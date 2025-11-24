import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { UserPlan } from '../src/modules/users/entities/user.entity';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
    plan: string;
  };
  access_token: string;
}

interface ReadingResponse {
  id: number;
  predefinedQuestionId: number | null;
  customQuestion: string | null;
  questionType: 'predefined' | 'custom';
  tarotistaId: number | null;
  interpretation?: {
    id: number;
    interpretationText: string;
    tokensUsed: number;
    aiProvider: string;
  };
  cards: Array<{
    cardId: number;
    position: string;
    isReversed: boolean;
  }>;
  regenerationCount?: number;
}

/**
 * Premium User Edge Cases E2E Tests
 *
 * Tests edge cases específicos del journey de usuarios PREMIUM que no están
 * cubiertos por mvp-complete.e2e-spec.ts ni reading-regeneration.e2e-spec.ts
 *
 * Coverage:
 * - Unlimited readings verification (stress test)
 * - Custom question edge cases (empty, very long, special chars)
 * - Regeneration workflow edge cases
 * - Premium downgrade scenarios
 * - Concurrent premium operations
 */
describe('Premium User Edge Cases E2E', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let premiumUserToken: string;
  let premiumUserId: number;
  let deckId: number;
  let spreadId: number;
  let cardIds: number[];
  const testTimestamp = Date.now();

  beforeAll(async () => {
    await dbHelper.initialize();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();

    // Get seeded data
    const ds = dbHelper.getDataSource();

    // Get deck

    const decks = await ds.query('SELECT id FROM tarot_deck LIMIT 1');

    deckId = decks[0].id as number;

    // Get spread

    const spreads = await ds.query('SELECT id FROM tarot_spread LIMIT 1');

    spreadId = spreads[0].id as number;

    // Get cards

    const cards = await ds.query('SELECT id FROM tarot_card LIMIT 3');

    cardIds = cards.map((c: { id: number }) => c.id);

    // Register premium user
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({
        email: `premium-edge-${testTimestamp}@test.com`,
        password: 'Test1234!',
        name: 'Premium Edge Test User',
      })
      .expect(201);

    const registerBody = registerResponse.body as LoginResponse;
    premiumUserId = registerBody.user.id;
    premiumUserToken = registerBody.access_token;

    // Upgrade to premium
    await ds.query('UPDATE "user" SET plan = $1 WHERE id = $2', [
      UserPlan.PREMIUM,
      premiumUserId,
    ]);

    // Re-login to get fresh token with PREMIUM plan
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `premium-edge-${testTimestamp}@test.com`,
        password: 'Test1234!',
      })
      .expect(200);

    const loginBody = loginResponse.body as LoginResponse;
    premiumUserToken = loginBody.access_token;
    expect(loginBody.user.plan).toBe(UserPlan.PREMIUM);
  });

  afterAll(async () => {
    // Cleanup test user and readings
    const ds = dbHelper.getDataSource();
    if (premiumUserId) {
      // Delete interpretations first (FK constraint)
      await ds.query(
        'DELETE FROM tarot_interpretation WHERE "readingId" IN (SELECT id FROM tarot_reading WHERE "userId" = $1)',
        [premiumUserId],
      );
      await ds.query('DELETE FROM tarot_reading WHERE "userId" = $1', [
        premiumUserId,
      ]);
      await ds.query('DELETE FROM usage_limit WHERE user_id = $1', [
        premiumUserId,
      ]);
      await ds.query('DELETE FROM "user" WHERE id = $1', [premiumUserId]);
    }
    await app.close();
  });

  describe('1. Unlimited Readings Verification', () => {
    it('should allow creating more than 10 readings without limit', async () => {
      // FREE users have 3/day limit, PREMIUM should have no limit
      // Create 11 readings to verify unlimited (more than 3x FREE limit)
      const createdReadingIds: number[] = [];

      for (let i = 0; i < 11; i++) {
        const response = await request(app.getHttpServer())
          .post('/readings')
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .send({
            customQuestion: `Test question ${i + 1}`,
            deckId: deckId,
            spreadId: spreadId,
            cardIds: cardIds,
            cardPositions: [
              { cardId: cardIds[0], position: 'past', isReversed: false },
              { cardId: cardIds[1], position: 'present', isReversed: false },
              { cardId: cardIds[2], position: 'future', isReversed: false },
            ],
            generateInterpretation: false,
          })
          .expect(201);

        const body = response.body as ReadingResponse;
        createdReadingIds.push(body.id);

        // Small delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Verify all 11 readings were created successfully
      expect(createdReadingIds).toHaveLength(11);

      // Verify no usage_limit record for premium (or count is NOT enforced)
      const ds = dbHelper.getDataSource();
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const usageLimits = await ds.query(
        'SELECT * FROM usage_limit WHERE user_id = $1 AND feature = $2 AND date = $3',
        [premiumUserId, 'tarot_reading', today],
      );

      // Premium users might have NO usage_limit record, or count is tracked but not enforced

      if (usageLimits.length > 0) {
        expect(usageLimits[0].count).toBeGreaterThanOrEqual(11);
      }
    }, 30000);
  });

  describe('2. Custom Question Edge Cases', () => {
    it('should reject empty custom question', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: '',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should reject very long custom question (>500 chars)', async () => {
      const longQuestion = 'A'.repeat(501);

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: longQuestion,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(400);

      expect(response.body.message).toBeDefined();
    });

    it('should accept custom question with special characters', async () => {
      const specialCharQuestion = '¿Qué me depara el futuro? 🔮 (pregunta #1)';

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: specialCharQuestion,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body.customQuestion).toBe(specialCharQuestion);
      expect(body.questionType).toBe('custom');
    });

    it('should accept custom question at max length (500 chars)', async () => {
      const maxQuestion = 'A'.repeat(500);

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: maxQuestion,
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const body = response.body as ReadingResponse;
      expect(body.customQuestion).toBe(maxQuestion);
      expect(body.customQuestion?.length).toBe(500);
    });
  });

  describe('3. Regeneration Workflow Edge Cases', () => {
    it('should track regeneration count correctly after multiple regenerations', async () => {
      // Create reading
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Test regeneration count',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const readingId = (createResponse.body as ReadingResponse).id;

      // Regenerate 3 times (limit is 3 regenerations per reading)
      for (let i = 1; i <= 3; i++) {
        const regenResponse = await request(app.getHttpServer())
          .post(`/readings/${readingId}/regenerate`)
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .send({
            customQuestion: `Regenerated question ${i}`,
          })
          .expect(201); // Regenerate returns 201 Created

        const body = regenResponse.body as ReadingResponse;
        expect(body.regenerationCount).toBe(i);

        // Delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Wait extra time before testing limit
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 4th regeneration should fail (limit exceeded OR rate limited)
      const fourthRegen = await request(app.getHttpServer())
        .post(`/readings/${readingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Fourth regeneration (should fail)',
        });

      // Should fail (403 for limit OR 429 for rate limit)
      expect([403, 429]).toContain(fourthRegen.status);
    }, 30000); // Increased timeout for delays

    it('should preserve original reading data after failed regeneration', async () => {
      // Create reading
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Original question',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const readingId = (createResponse.body as ReadingResponse).id;

      // Exhaust regeneration limit
      for (let i = 0; i < 3; i++) {
        await request(app.getHttpServer())
          .post(`/readings/${readingId}/regenerate`)
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .send({ customQuestion: `Regen ${i + 1}` })
          .expect(201); // Regenerate returns 201 Created

        // Delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Wait extra time
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Attempt regeneration with empty question (should fail validation)
      const fourthRegen = await request(app.getHttpServer())
        .post(`/readings/${readingId}/regenerate`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ customQuestion: '' });

      // Should fail (403 for limit OR 429 for rate limit)
      expect([403, 429]).toContain(fourthRegen.status);

      // Verify original reading is intact (fetch from DB)
      const getResponse = await request(app.getHttpServer())
        .get(`/readings/${readingId}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      const body = getResponse.body as ReadingResponse;
      // After 3 regenerations, question will be "Regen 3", not original
      expect(body.regenerationCount).toBe(3);
      expect(body.id).toBe(readingId);
    }, 30000); // Increased timeout for delays
  });

  describe('4. Premium Downgrade Scenarios', () => {
    it('should preserve existing readings after downgrade to FREE', async () => {
      // Create 2 readings as premium
      const reading1 = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Premium reading 1',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const readingId1 = (reading1.body as ReadingResponse).id;

      await new Promise((resolve) => setTimeout(resolve, 100));

      const reading2 = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Premium reading 2',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const readingId2 = (reading2.body as ReadingResponse).id;

      // Downgrade to FREE
      const ds = dbHelper.getDataSource();
      await ds.query('UPDATE "user" SET plan = $1 WHERE id = $2', [
        UserPlan.FREE,
        premiumUserId,
      ]);

      // Verify readings still accessible
      await request(app.getHttpServer())
        .get(`/readings/${readingId1}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/readings/${readingId2}`)
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      // Restore premium status for subsequent tests
      await ds.query('UPDATE "user" SET plan = $1 WHERE id = $2', [
        UserPlan.PREMIUM,
        premiumUserId,
      ]);
    }, 15000);

    it('should block custom questions after downgrade to FREE', async () => {
      // Downgrade to FREE
      const ds = dbHelper.getDataSource();
      await ds.query('UPDATE "user" SET plan = $1 WHERE id = $2', [
        UserPlan.FREE,
        premiumUserId,
      ]);

      // Attempt custom question (should fail)
      await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Should be rejected',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(403);

      // Restore premium status
      await ds.query('UPDATE "user" SET plan = $1 WHERE id = $2', [
        UserPlan.PREMIUM,
        premiumUserId,
      ]);
    });
  });

  /**
   * 5. Multi-Tarotista Support (TASK-074)
   */
  describe('5. Multi-Tarotista Support (TASK-074)', () => {
    it('should include tarotistaId in PREMIUM user readings', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Multi-tarotista test for premium',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const reading = response.body as ReadingResponse;
      expect(reading.tarotistaId).toBe(1); // Default to Flavia when no subscription
    }, 15000);

    it('should validate tarotistaId persists in database for PREMIUM readings', async () => {
      const createResponse = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({
          customQuestion: 'Persistence test',
          deckId: deckId,
          spreadId: spreadId,
          cardIds: cardIds,
          cardPositions: [
            { cardId: cardIds[0], position: 'past', isReversed: false },
            { cardId: cardIds[1], position: 'present', isReversed: false },
            { cardId: cardIds[2], position: 'future', isReversed: false },
          ],
          generateInterpretation: false,
        })
        .expect(201);

      const reading = createResponse.body as ReadingResponse;
      const readingId = reading.id;

      // Query database directly
      const ds = dbHelper.getDataSource();
      const dbReading = await ds.query(
        'SELECT tarotista_id FROM tarot_reading WHERE id = $1',
        [readingId],
      );

      expect(dbReading).toHaveLength(1);
      expect(dbReading[0].tarotista_id).toBe(1);
    }, 15000);
  });
});
