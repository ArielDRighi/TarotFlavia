import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Rate Limits Admin Controller
 *
 * Tests the admin endpoint for rate limiting violations:
 * - GET /admin/rate-limits/violations - Get rate limiting statistics
 *
 * @module RateLimitsAdminE2E
 */
describe('Rate Limits Admin (e2e)', () => {
  let app: INestApplication;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let userToken: string;

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

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' });
    adminToken = adminLogin.body.access_token;

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' });
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  describe('GET /admin/rate-limits/violations', () => {
    describe('Authentication & Authorization', () => {
      it('should return violations stats when authenticated as admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('violations');
        expect(response.body).toHaveProperty('blockedIps');
        expect(response.body).toHaveProperty('stats');
      });

      it('should return 403 when authenticated as non-admin user', async () => {
        await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 401 when not authenticated', async () => {
        await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('Response Structure', () => {
      it('should return violations as an array', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body.violations)).toBe(true);
      });

      it('should return blockedIps as an array', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body.blockedIps)).toBe(true);
      });

      it('should return stats object with expected properties', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.stats).toHaveProperty('totalViolations');
        expect(response.body.stats).toHaveProperty('totalBlockedIps');
        expect(response.body.stats).toHaveProperty('activeViolationsCount');
      });

      it('should return numeric values for stats', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(typeof response.body.stats.totalViolations).toBe('number');
        expect(typeof response.body.stats.totalBlockedIps).toBe('number');
        expect(typeof response.body.stats.activeViolationsCount).toBe('number');
      });

      it('should return non-negative values for stats', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.stats.totalViolations).toBeGreaterThanOrEqual(0);
        expect(response.body.stats.totalBlockedIps).toBeGreaterThanOrEqual(0);
        expect(
          response.body.stats.activeViolationsCount,
        ).toBeGreaterThanOrEqual(0);
      });
    });

    describe('Edge Cases', () => {
      it('should return consistent response on multiple calls', async () => {
        const response1 = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const response2 = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Object.keys(response1.body).sort()).toEqual(
          Object.keys(response2.body).sort(),
        );
      });

      it('should have blockedIps count match stats.totalBlockedIps', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.blockedIps.length).toBe(
          response.body.stats.totalBlockedIps,
        );
      });

      it('should have violations count match stats.activeViolationsCount', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/rate-limits/violations')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.violations.length).toBe(
          response.body.stats.activeViolationsCount,
        );
      });
    });
  });
});
