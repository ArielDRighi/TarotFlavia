/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { DailyReading } from '../src/modules/tarot/daily-reading/entities/daily-reading.entity';
import { InterpretationsService } from '../src/modules/tarot/interpretations/interpretations.service';

/**
 * Mock InterpretationsService for E2E tests
 * Returns dummy interpretations to avoid AI API calls and rate limits
 */
const mockInterpretationsService = {
  generateDailyCardInterpretation: jest
    .fn()
    .mockImplementation((card, isReversed) => {
      return Promise.resolve(
        `**Energía del Día**: ${card.name}${isReversed ? ' (Invertida)' : ''}\n\n` +
          `**Mensaje Principal**: Esta es una interpretación de prueba para E2E tests.\n\n` +
          `**Consejo**: Aprovecha las oportunidades que se presentan hoy.\n\n` +
          `**Reflexión**: ${card.name} te invita a reflexionar sobre tu camino.`,
      );
    }),
};

describe('DailyReading (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUserId: number;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let premiumUserId: number;

  beforeAll(async () => {
    // Initialize E2E database helper
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Create NestJS application with mocked InterpretationsService
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(InterpretationsService)
      .useValue(mockInterpretationsService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login as free user
    const freeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' })
      .expect(200);

    freeUserToken = freeLoginResponse.body.access_token;
    freeUserId = freeLoginResponse.body.user.id;

    // Login as premium user
    const premiumLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'premium@test.com', password: 'Test123456!' })
      .expect(200);

    premiumUserToken = premiumLoginResponse.body.access_token;
    premiumUserId = premiumLoginResponse.body.user.id;

    if (!freeUserToken || !premiumUserToken) {
      throw new Error('Failed to obtain authentication tokens');
    }
  });

  afterAll(async () => {
    // Final cleanup
    const dataSource = dbHelper.getDataSource();
    await dataSource.query('DELETE FROM daily_readings');

    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  });

  beforeEach(async () => {
    // Clean daily readings before each test
    const dataSource = dbHelper.getDataSource();
    await dataSource.query('DELETE FROM daily_readings');
  });

  afterEach(async () => {
    // Clean daily readings after each test
    const dataSource = dbHelper.getDataSource();
    await dataSource.query('DELETE FROM daily_readings');
  });

  describe('POST /daily-reading', () => {
    it('should generate daily card for authenticated user', async () => {
      const response = await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('card');
      expect(response.body).toHaveProperty('interpretation');
      expect(response.body).toHaveProperty('isReversed');
      expect(response.body).toHaveProperty('readingDate');
      expect(response.body.wasRegenerated).toBe(false);
      expect(response.body.card).toHaveProperty('name');
    }, 30000); // 30 seconds timeout for AI generation

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/daily-reading')
        .send({ tarotistaId: 1 })
        .expect(401);
    });

    it('should fail if user already has daily card for today', async () => {
      // First request - should succeed
      await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      // Second request - should fail with 409 Conflict
      const response = await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(409);

      expect(response.body.message).toContain('Ya generaste tu carta del día');
    }, 30000);

    it('should generate different cards for different users', async () => {
      const response1 = await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      expect(response1.body.id).not.toBe(response2.body.id);
    }, 60000);
  });

  describe('GET /daily-reading/today', () => {
    it('should return null if no daily card exists for today', async () => {
      const response = await request(app.getHttpServer())
        .get('/daily-reading/today')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      // Should be null or empty when no card exists
      expect(
        response.body == null ||
          Object.keys(response.body as object).length === 0,
      ).toBe(true);
    });

    it("should return today's card if it exists", async () => {
      // First create a daily card
      const createResponse = await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      // Then retrieve it
      const getResponse = await request(app.getHttpServer())
        .get('/daily-reading/today')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      expect(getResponse.body).toHaveProperty('id', createResponse.body.id);
      expect(getResponse.body).toHaveProperty('card');
      expect(getResponse.body).toHaveProperty('interpretation');
    }, 30000);

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/daily-reading/today')
        .expect(401);
    });
  });

  describe('GET /daily-reading/history', () => {
    it('should return empty history for new user', async () => {
      const response = await request(app.getHttpServer())
        .get('/daily-reading/history')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      expect(response.body.items).toEqual([]);
      expect(response.body.total).toBe(0);
      expect(response.body.page).toBe(1);
      expect(response.body.totalPages).toBe(0);
    });

    it('should support pagination', async () => {
      // Note: History doesn't include today's card, only past cards
      // So we need to manually insert a past card for this test
      const dataSource = dbHelper.getDataSource();
      const dailyReadingRepo = dataSource.getRepository(DailyReading);

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      yesterday.setHours(0, 0, 0, 0);
      const year = yesterday.getFullYear();
      const month = String(yesterday.getMonth() + 1).padStart(2, '0');
      const day = String(yesterday.getDate()).padStart(2, '0');
      const yesterdayStr = `${year}-${month}-${day}`;

      await dailyReadingRepo.save({
        userId: freeUserId,
        tarotistaId: 1,
        cardId: 1,
        isReversed: false,
        interpretation: 'Test interpretation',
        readingDate: yesterdayStr as unknown as Date,
        wasRegenerated: false,
      });

      // Request with pagination
      const response = await request(app.getHttpServer())
        .get('/daily-reading/history?page=1&limit=10')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      expect(response.body.items).toHaveLength(1);
      expect(response.body.total).toBe(1);
      expect(response.body.page).toBe(1);
      expect(response.body.limit).toBe(10);
    });

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .get('/daily-reading/history')
        .expect(401);
    });
  });

  describe('POST /daily-reading/regenerate', () => {
    it('should fail if no daily card exists', async () => {
      await request(app.getHttpServer())
        .post('/daily-reading/regenerate')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(404);
    });

    it('should fail for free users', async () => {
      // First create a daily card
      await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      // Try to regenerate as free user
      const response = await request(app.getHttpServer())
        .post('/daily-reading/regenerate')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(403);

      expect(response.body.message).toContain('premium');
    }, 30000);

    it('should regenerate daily card for premium users', async () => {
      // First create a daily card
      await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      // Regenerate
      const regenerateResponse = await request(app.getHttpServer())
        .post('/daily-reading/regenerate')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(200);

      expect(regenerateResponse.body).toHaveProperty('id');
      expect(regenerateResponse.body.wasRegenerated).toBe(true);
      expect(regenerateResponse.body).toHaveProperty('card');
      expect(regenerateResponse.body).toHaveProperty('interpretation');

      // Card might be different (random selection)
      // But should still be a valid card
      expect(regenerateResponse.body.card).toHaveProperty('name');
    }, 60000);

    it('should fail without authentication', async () => {
      await request(app.getHttpServer())
        .post('/daily-reading/regenerate')
        .send({ tarotistaId: 1 })
        .expect(401);
    });
  });

  describe('Integration: Full Daily Card Flow', () => {
    it('should complete full daily card workflow', async () => {
      // Step 1: Check no card exists
      let todayCheck = await request(app.getHttpServer())
        .get('/daily-reading/today')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      // Should be null or empty response when no card exists
      expect(
        todayCheck.body == null ||
          Object.keys(todayCheck.body as object).length === 0,
      ).toBe(true);

      // Step 2: Generate daily card
      const createResponse = await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(201);

      expect(createResponse.body.wasRegenerated).toBe(false);
      const originalCardName = createResponse.body.card.name;

      // Step 3: Verify card exists for today
      todayCheck = await request(app.getHttpServer())
        .get('/daily-reading/today')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);
      expect(todayCheck.body).not.toBeNull();
      expect(todayCheck.body.card.name).toBe(originalCardName);

      // Step 4: Try to generate again (should fail)
      await request(app.getHttpServer())
        .post('/daily-reading')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(409);

      // Step 5: Regenerate as premium user
      const regenerateResponse = await request(app.getHttpServer())
        .post('/daily-reading/regenerate')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .send({ tarotistaId: 1 })
        .expect(200);

      expect(regenerateResponse.body.wasRegenerated).toBe(true);

      // Step 6: Verify today's card is the regenerated one
      const finalCheck = await request(app.getHttpServer())
        .get('/daily-reading/today')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);
      expect(finalCheck.body.wasRegenerated).toBe(true);
    }, 90000);
  });
});
