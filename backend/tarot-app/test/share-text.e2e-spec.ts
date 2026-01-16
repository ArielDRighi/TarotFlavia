import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import * as bcrypt from 'bcryptjs';

/**
 * E2E tests for Share Text endpoints
 * Tests GET /readings/:id/share-text and GET /daily-reading/share-text
 */
describe('Share Text (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let dbHelper: E2EDatabaseHelper;

  // Test user data
  let freeUserId: number;
  let premiumUserId: number;
  let freeAuthToken: string;
  let premiumAuthToken: string;
  let testCardId: number;
  let freeReadingId: number;
  let premiumReadingId: number;
  let freeDailyReadingId: number;
  let premiumDailyReadingId: number;

  beforeAll(async () => {
    // Initialize E2E database helper
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Get DataSource for direct queries
    dataSource = dbHelper.getDataSource();

    // Create NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();

    // Clean up any existing test data
    await dataSource.query(
      `DELETE FROM "user" WHERE email LIKE '%share-test@test.com'`,
    );

    // Create test users
    const hashedPassword = await bcrypt.hash('Test1234!', 10);

    // Create FREE user
    const freeUserResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "user" (email, password, name, plan, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'free', NOW(), NOW())
       RETURNING id`,
      ['free-share-test@test.com', hashedPassword, 'Free Share Test User'],
    );
    freeUserId = freeUserResult[0].id;

    // Create PREMIUM user
    const premiumUserResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "user" (email, password, name, plan, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'premium', NOW(), NOW())
       RETURNING id`,
      [
        'premium-share-test@test.com',
        hashedPassword,
        'Premium Share Test User',
      ],
    );
    premiumUserId = premiumUserResult[0].id;

    // Login users
    const freeLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'free-share-test@test.com', password: 'Test1234!' })
      .expect(200);
    freeAuthToken = freeLoginResponse.body.access_token;

    const premiumLoginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'premium-share-test@test.com', password: 'Test1234!' })
      .expect(200);
    premiumAuthToken = premiumLoginResponse.body.access_token;

    if (!freeAuthToken || !premiumAuthToken) {
      throw new Error('Failed to obtain authentication tokens');
    }

    // Get test card (El Loco - should exist from seeders)
    const cardResult: Array<{ id: number }> = await dataSource.query(
      `SELECT id FROM tarot_card WHERE name = 'El Loco' LIMIT 1`,
    );
    if (!cardResult.length) {
      throw new Error('No se encontró la carta El Loco en los seeders');
    }
    testCardId = cardResult[0].id;

    // Create FREE reading (without AI interpretation)
    const freeReadingResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "tarot_reading" 
        ("predefinedQuestionId", "customQuestion", "question", "userId", "deckId", "spread_id", "tarotista_id", "categoryId", "interpretation", "isPublic", "cardPositions", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING id`,
      [
        1,
        null,
        '¿Qué debo saber?',
        freeUserId,
        1,
        1,
        1,
        1,
        null,
        false,
        JSON.stringify([
          { cardId: testCardId, position: 'Presente', isReversed: false },
        ]),
      ],
    );
    freeReadingId = freeReadingResult[0].id;

    // Insert card into join table for free reading
    await dataSource.query(
      `INSERT INTO "tarot_reading_cards_tarot_card" ("tarotReadingId", "tarotCardId") VALUES ($1, $2)`,
      [freeReadingId, testCardId],
    );

    // Create PREMIUM reading (with AI interpretation)
    const premiumReadingResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "tarot_reading" 
        ("predefinedQuestionId", "customQuestion", "question", "userId", "deckId", "spread_id", "tarotista_id", "categoryId", "interpretation", "isPublic", "cardPositions", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
       RETURNING id`,
      [
        null,
        '¿Cuál es mi camino?',
        null,
        premiumUserId,
        1,
        1,
        1,
        1,
        'Estás en el inicio de un gran viaje. Tu energía está lista para explorar nuevos horizontes con valentía y confianza.',
        false,
        JSON.stringify([
          { cardId: testCardId, position: 'Presente', isReversed: false },
        ]),
      ],
    );
    premiumReadingId = premiumReadingResult[0].id;

    // Insert card into join table for premium reading
    await dataSource.query(
      `INSERT INTO "tarot_reading_cards_tarot_card" ("tarotReadingId", "tarotCardId") VALUES ($1, $2)`,
      [premiumReadingId, testCardId],
    );

    // Create daily readings
    const today = new Date().toISOString().split('T')[0];

    // FREE daily reading (without interpretation)
    const freeDailyResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "daily_readings" ("user_id", "card_id", "is_reversed", "interpretation", "reading_date", "tarotista_id", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [freeUserId, testCardId, false, null, today, 1],
    );
    freeDailyReadingId = freeDailyResult[0].id;

    // PREMIUM daily reading (with interpretation)
    const premiumDailyResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "daily_readings" ("user_id", "card_id", "is_reversed", "interpretation", "reading_date", "tarotista_id", "created_at", "updated_at")
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING id`,
      [
        premiumUserId,
        testCardId,
        false,
        'Hoy es un día perfecto para comenzar algo nuevo. La energía del Loco te impulsa a dar el primer paso con confianza.',
        today,
        1,
      ],
    );
    premiumDailyReadingId = premiumDailyResult[0].id;
  });

  afterAll(async () => {
    // Cleanup test data
    if (dataSource?.isInitialized) {
      try {
        // Delete in order respecting foreign keys
        if (freeDailyReadingId) {
          await dataSource.query(`DELETE FROM "daily_readings" WHERE id = $1`, [
            freeDailyReadingId,
          ]);
        }
        if (premiumDailyReadingId) {
          await dataSource.query(`DELETE FROM "daily_readings" WHERE id = $1`, [
            premiumDailyReadingId,
          ]);
        }
        if (freeReadingId) {
          await dataSource.query(
            `DELETE FROM "tarot_reading_cards_tarot_card" WHERE "tarotReadingId" = $1`,
            [freeReadingId],
          );
          await dataSource.query(`DELETE FROM "tarot_reading" WHERE id = $1`, [
            freeReadingId,
          ]);
        }
        if (premiumReadingId) {
          await dataSource.query(
            `DELETE FROM "tarot_reading_cards_tarot_card" WHERE "tarotReadingId" = $1`,
            [premiumReadingId],
          );
          await dataSource.query(`DELETE FROM "tarot_reading" WHERE id = $1`, [
            premiumReadingId,
          ]);
        }
        // Delete test users
        await dataSource.query(
          `DELETE FROM "user" WHERE email LIKE '%share-test@test.com'`,
        );
      } catch (err) {
        console.error('Cleanup error:', err);
      }
    }

    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  });

  describe('GET /readings/:id/share-text', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/readings/${freeReadingId}/share-text`)
        .expect(401);

      expect(response.body.message).toBe('Unauthorized');
    });

    it('should validate ownership - FREE user cannot get PREMIUM user reading', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/readings/${premiumReadingId}/share-text`)
        .set('Authorization', `Bearer ${freeAuthToken}`)
        .expect(403);

      expect(response.body.message).toContain('not own this reading');
    });

    it('should return share text for FREE user reading', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/readings/${freeReadingId}/share-text`)
        .set('Authorization', `Bearer ${freeAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('text');
      expect(response.body.text).toContain('Mi Lectura de Tarot en Auguria');
      expect(response.body.text).toContain('El Loco');
      // FREE users get card meanings from DB
      expect(response.body.text).toContain('Descubre más lecturas'); // CTA FREE
      expect(response.body.text).not.toContain(
        '💭 Interpretación personalizada',
      ); // No debe tener interpretación
    });

    it('should return share text for PREMIUM user reading with interpretation', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/readings/${premiumReadingId}/share-text`)
        .set('Authorization', `Bearer ${premiumAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('text');
      expect(response.body.text).toContain('Mi Lectura de Tarot en Auguria');
      expect(response.body.text).toContain('El Loco');
      expect(response.body.text).toContain('💭 Interpretación personalizada:');
      expect(response.body.text).toContain('Estás en el inicio'); // Interpretación IA
      expect(response.body.text).toContain(
        'Obtén interpretaciones personalizadas',
      ); // CTA PREMIUM
    });

    it('should return 404 for non-existent reading', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/readings/999999/share-text')
        .set('Authorization', `Bearer ${freeAuthToken}`)
        .expect(404);
    });
  });

  describe('GET /daily-reading/share-text', () => {
    it('should work for authenticated FREE user', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/daily-reading/share-text')
        .set('Authorization', `Bearer ${freeAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('text');
      expect(response.body.text).toContain('Carta del Día en Auguria');
      expect(response.body.text).toContain('El Loco');
      // FREE: Significado DB
      expect(response.body.text).toContain('Descubre más lecturas'); // CTA FREE
      expect(response.body.text).not.toContain(
        '💭 Interpretación personalizada',
      );
    });

    it('should work for authenticated PREMIUM user with interpretation', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/daily-reading/share-text')
        .set('Authorization', `Bearer ${premiumAuthToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('text');
      expect(response.body.text).toContain('Mi Carta del Día en Auguria');
      expect(response.body.text).toContain('El Loco');
      expect(response.body.text).toContain('💭 Interpretación personalizada:');
      expect(response.body.text).toContain('Hoy es un día perfecto'); // Interpretación IA
      expect(response.body.text).toContain(
        'Obtén interpretaciones personalizadas',
      ); // CTA PREMIUM
    });

    it('should work for anonymous users with fingerprint', async () => {
      // Create anonymous daily reading manually
      const fingerprint = 'test-fingerprint-' + Date.now();
      const today = new Date().toISOString().split('T')[0];

      const anonDailyResult: Array<{ id: number }> = await dataSource.query(
        `INSERT INTO "daily_readings" ("user_id", "anonymous_fingerprint", "card_id", "is_reversed", "interpretation", "reading_date", "tarotista_id", "created_at", "updated_at")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id`,
        [null, fingerprint, testCardId, false, null, today, 1],
      );
      const anonDailyId = anonDailyResult[0].id;

      try {
        // Get share text with fingerprint
        const response = await request(app.getHttpServer())
          .get(`/api/v1/daily-reading/share-text?fingerprint=${fingerprint}`)
          .expect(200);

        expect(response.body).toHaveProperty('text');
        expect(response.body.text).toContain('Carta del Día en Auguria');
        expect(response.body.text).toContain('Regístrate gratis'); // CTA ANONYMOUS
        expect(response.body.text).not.toContain(
          '💭 Interpretación personalizada',
        );
      } finally {
        // Cleanup
        await dataSource.query(`DELETE FROM "daily_readings" WHERE id = $1`, [
          anonDailyId,
        ]);
      }
    });

    it('should return 404 if user has no daily reading for today', async () => {
      // Crear un usuario sin daily reading
      const hashedPassword = await bcrypt.hash('Test1234!', 10);

      const noCardUserResult: Array<{ id: number }> = await dataSource.query(
        `INSERT INTO "user" (email, password, name, plan, "createdAt", "updatedAt")
         VALUES ($1, $2, $3, 'free', NOW(), NOW())
         RETURNING id`,
        ['nocard-share-test@test.com', hashedPassword, 'No Card User'],
      );
      const noCardUserId = noCardUserResult[0].id;

      try {
        const login = await request(app.getHttpServer())
          .post('/api/v1/auth/login')
          .send({ email: 'nocard-share-test@test.com', password: 'Test1234!' })
          .expect(200);

        const response = await request(app.getHttpServer())
          .get('/api/v1/daily-reading/share-text')
          .set('Authorization', `Bearer ${login.body.access_token}`)
          .expect(404);

        expect(response.body.message).toContain('No existe carta del día');
      } finally {
        // Cleanup
        await dataSource.query(`DELETE FROM "user" WHERE id = $1`, [
          noCardUserId,
        ]);
      }
    });
  });
});
