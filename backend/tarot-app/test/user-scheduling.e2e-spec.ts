import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for User Scheduling Controller
 *
 * Tests the user scheduling endpoints:
 * - GET /scheduling/available-slots - Get available slots for a tarotista
 * - POST /scheduling/book - Book a session
 * - GET /scheduling/my-sessions - Get user's sessions
 * - GET /scheduling/my-sessions/:id - Get session detail
 * - POST /scheduling/my-sessions/:id/cancel - Cancel a session
 *
 * @module UserSchedulingE2E
 */
describe('User Scheduling (e2e)', () => {
  let app: INestApplication;
  let dbHelper: E2EDatabaseHelper;
  let userToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();

    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Reset usage limits to ensure login doesn't fail due to daily limits
    const dataSource = dbHelper.getDataSource();
    try {
      await dataSource.query('TRUNCATE TABLE usage_limit RESTART IDENTITY CASCADE');
    } catch (error) {
      // Ignore if table doesn't exist
    }

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' })
      .expect(200);

    // Verify token was received
    expect(userLogin.body).toHaveProperty('access_token');
    expect(userLogin.body.access_token).toBeDefined();
    expect(typeof userLogin.body.access_token).toBe('string');

    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  describe('GET /scheduling/available-slots', () => {
    it('should return available slots when authenticated', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 1,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          durationMinutes: 30,
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 1,
          startDate: '2025-12-01',
          endDate: '2025-12-07',
          durationMinutes: 30,
        })
        .expect(401);
    });

    it('should return 400 for invalid tarotistaId', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 'invalid',
          startDate: '2025-12-01',
          endDate: '2025-12-07',
          durationMinutes: 30,
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should return 400 for invalid durationMinutes', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 1,
          startDate: '2025-12-01',
          endDate: '2025-12-07',
          durationMinutes: 'invalid',
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });

    it('should accept 60 minute duration', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 1,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          durationMinutes: 60,
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should accept 90 minute duration', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 1,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          durationMinutes: 90,
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /scheduling/my-sessions', () => {
    it('should return user sessions when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions')
        .expect(401);
    });

    it('should filter by status when provided', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions')
        .query({ status: 'PENDING' })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should return empty array when no sessions exist', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });
  });

  describe('GET /scheduling/my-sessions/:id', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions/1')
        .expect(401);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions/999999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);
    });

    it('should return 400 for invalid session id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/scheduling/my-sessions/invalid')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);
    });
  });

  describe('POST /scheduling/book', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scheduling/book')
        .send({
          tarotistaId: 1,
          startTime: new Date().toISOString(),
          durationMinutes: 30,
        })
        .expect(401);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scheduling/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(400);
    });

    it('should return 400 for invalid tarotistaId', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scheduling/book')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          tarotistaId: 'invalid',
          startTime: new Date().toISOString(),
          durationMinutes: 30,
        })
        .expect(400);
    });
  });

  describe('POST /scheduling/my-sessions/:id/cancel', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scheduling/my-sessions/1/cancel')
        .send({ reason: 'Test cancellation' })
        .expect(401);
    });

    it('should return 404 for non-existent session', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scheduling/my-sessions/999999/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Test cancellation' })
        .expect(404);
    });

    it('should return 400 for invalid session id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/scheduling/my-sessions/invalid/cancel')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Test cancellation' })
        .expect(400);
    });
  });

  describe('Edge Cases', () => {
    it('should handle date range in the past gracefully', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 1,
          startDate: '2020-01-01',
          endDate: '2020-01-07',
          durationMinutes: 30,
        })
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(0);
    });

    it('should handle non-existent tarotista', async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 1);
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);

      // Non-existent tarotista should return empty slots or 404
      const response = await request(app.getHttpServer())
        .get('/api/v1/scheduling/available-slots')
        .query({
          tarotistaId: 999999,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
          durationMinutes: 30,
        })
        .set('Authorization', `Bearer ${userToken}`);

      // Either 200 with empty array or 404
      expect([200, 404]).toContain(response.status);
    });
  });
});
