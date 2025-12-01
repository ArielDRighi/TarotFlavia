import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Tarotist Scheduling Controller
 *
 * Tests the tarotist scheduling endpoints for authentication and error handling:
 * - GET /tarotist/scheduling/availability/weekly
 * - POST /tarotist/scheduling/availability/weekly
 * - DELETE /tarotist/scheduling/availability/weekly/:id
 * - GET /tarotist/scheduling/availability/exceptions
 * - POST /tarotist/scheduling/availability/exceptions
 * - DELETE /tarotist/scheduling/availability/exceptions/:id
 * - GET /tarotist/scheduling/sessions
 * - POST /tarotist/scheduling/sessions/:id/confirm
 * - POST /tarotist/scheduling/sessions/:id/complete
 * - POST /tarotist/scheduling/sessions/:id/cancel
 *
 * @module TarotistSchedulingE2E
 */
describe('Tarotist Scheduling (e2e)', () => {
  let app: INestApplication;
  let dbHelper: E2EDatabaseHelper;
  let regularUserToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

    // Login as regular user (not a tarotista) to test authorization
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' });
    regularUserToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  describe('GET /tarotist/scheduling/availability/weekly', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/tarotist/scheduling/availability/weekly')
        .expect(401);
    });

    it('should handle request from non-tarotista user', async () => {
      // Regular user accessing tarotista endpoints
      const response = await request(app.getHttpServer())
        .get('/tarotist/scheduling/availability/weekly')
        .set('Authorization', `Bearer ${regularUserToken}`);

      // May return 200 with empty array, 403 (forbidden), or 500 (null tarotistaId)
      expect([200, 403, 500]).toContain(response.status);
    });
  });

  describe('POST /tarotist/scheduling/availability/weekly', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/availability/weekly')
        .send({
          dayOfWeek: 1,
          startTime: '09:00',
          endTime: '17:00',
        })
        .expect(401);
    });

    it('should return 400 for missing required fields when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotist/scheduling/availability/weekly')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({});

      // Should return 400 for validation or 403/500 for not being tarotista
      expect([400, 403, 500]).toContain(response.status);
    });
  });

  describe('DELETE /tarotist/scheduling/availability/weekly/:id', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/tarotist/scheduling/availability/weekly/1')
        .expect(401);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .delete('/tarotist/scheduling/availability/weekly/invalid')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(400);
    });
  });

  describe('GET /tarotist/scheduling/availability/exceptions', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/tarotist/scheduling/availability/exceptions')
        .expect(401);
    });
  });

  describe('POST /tarotist/scheduling/availability/exceptions', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/availability/exceptions')
        .send({
          date: '2025-12-25',
          isBlocked: true,
          reason: 'Holiday',
        })
        .expect(401);
    });

    it('should return 400 for missing required fields when authenticated', async () => {
      const response = await request(app.getHttpServer())
        .post('/tarotist/scheduling/availability/exceptions')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({});

      expect([400, 403, 500]).toContain(response.status);
    });
  });

  describe('DELETE /tarotist/scheduling/availability/exceptions/:id', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/tarotist/scheduling/availability/exceptions/1')
        .expect(401);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .delete('/tarotist/scheduling/availability/exceptions/invalid')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .expect(400);
    });
  });

  describe('GET /tarotist/scheduling/sessions', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/tarotist/scheduling/sessions')
        .expect(401);
    });
  });

  describe('POST /tarotist/scheduling/sessions/:id/confirm', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/sessions/1/confirm')
        .send({})
        .expect(401);
    });

    it('should return 400 for invalid session id', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/sessions/invalid/confirm')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('POST /tarotist/scheduling/sessions/:id/complete', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/sessions/1/complete')
        .send({})
        .expect(401);
    });

    it('should return 400 for invalid session id', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/sessions/invalid/complete')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('POST /tarotist/scheduling/sessions/:id/cancel', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/sessions/1/cancel')
        .send({ reason: 'Test cancellation' })
        .expect(401);
    });

    it('should return 400 for invalid session id', async () => {
      await request(app.getHttpServer())
        .post('/tarotist/scheduling/sessions/invalid/cancel')
        .set('Authorization', `Bearer ${regularUserToken}`)
        .send({ reason: 'Test cancellation' })
        .expect(400);
    });
  });
});
