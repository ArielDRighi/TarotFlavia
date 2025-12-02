import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for AI Usage Statistics Controller
 *
 * Tests the GET /admin/ai-usage endpoint which provides:
 * - AI usage statistics per provider (GROQ, OPENAI, etc.)
 * - Token consumption and cost metrics
 * - Alert flags for rate limits, errors, costs
 *
 * @module AIUsageE2E
 */
describe('AI Usage Statistics (e2e)', () => {
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

  describe('GET /admin/ai-usage', () => {
    describe('Authentication & Authorization', () => {
      it('should return AI usage statistics when authenticated as admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
        expect(response.body).toHaveProperty('groqCallsToday');
        expect(response.body).toHaveProperty('groqRateLimitAlert');
        expect(response.body).toHaveProperty('highErrorRateAlert');
        expect(response.body).toHaveProperty('highFallbackRateAlert');
        expect(response.body).toHaveProperty('highDailyCostAlert');
      });

      it('should return 403 when authenticated as non-admin user', async () => {
        await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 401 when not authenticated', async () => {
        await request(app.getHttpServer()).get('/admin/ai-usage').expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('Response Structure', () => {
      it('should return statistics as an array', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body.statistics)).toBe(true);
      });

      it('should return boolean values for alert flags', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(typeof response.body.groqRateLimitAlert).toBe('boolean');
        expect(typeof response.body.highErrorRateAlert).toBe('boolean');
        expect(typeof response.body.highFallbackRateAlert).toBe('boolean');
        expect(typeof response.body.highDailyCostAlert).toBe('boolean');
      });

      it('should return numeric value for groqCallsToday', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(typeof response.body.groqCallsToday).toBe('number');
        expect(response.body.groqCallsToday).toBeGreaterThanOrEqual(0);
      });

      it('should return provider statistics with correct structure when data exists', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // If there are statistics, verify their structure
        if (response.body.statistics.length > 0) {
          const stat = response.body.statistics[0];
          expect(stat).toHaveProperty('provider');
          expect(stat).toHaveProperty('totalCalls');
          expect(stat).toHaveProperty('successCalls');
          expect(stat).toHaveProperty('errorCalls');
          expect(stat).toHaveProperty('cachedCalls');
          expect(stat).toHaveProperty('totalTokens');
          expect(stat).toHaveProperty('totalCost');
          expect(stat).toHaveProperty('avgDuration');
          expect(stat).toHaveProperty('errorRate');
          expect(stat).toHaveProperty('cacheHitRate');
          expect(stat).toHaveProperty('fallbackRate');
        }
      });
    });

    describe('Date Filtering', () => {
      it('should accept startDate query parameter', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 7);

        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .query({ startDate: startDate.toISOString() })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
      });

      it('should accept endDate query parameter', async () => {
        const endDate = new Date();

        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .query({ endDate: endDate.toISOString() })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
      });

      it('should accept both startDate and endDate', async () => {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        const endDate = new Date();

        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .query({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
      });

      it('should handle date range with no data gracefully', async () => {
        // Use a date range far in the past where there's no data
        const startDate = new Date('2020-01-01');
        const endDate = new Date('2020-01-02');

        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .query({
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
          })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
        expect(Array.isArray(response.body.statistics)).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should handle missing query parameters', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
      });

      it('should handle empty string query parameters', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .query({ startDate: '', endDate: '' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('statistics');
      });

      it('should return consistent structure across multiple calls', async () => {
        const response1 = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const response2 = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Object.keys(response1.body).sort()).toEqual(
          Object.keys(response2.body).sort(),
        );
      });
    });

    describe('Provider Statistics Validation', () => {
      it('should return non-negative values for all numeric fields', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        response.body.statistics.forEach((stat: any) => {
          expect(stat.totalCalls).toBeGreaterThanOrEqual(0);
          expect(stat.successCalls).toBeGreaterThanOrEqual(0);
          expect(stat.errorCalls).toBeGreaterThanOrEqual(0);
          expect(stat.cachedCalls).toBeGreaterThanOrEqual(0);
          expect(stat.totalTokens).toBeGreaterThanOrEqual(0);
          expect(stat.totalCost).toBeGreaterThanOrEqual(0);
          expect(stat.avgDuration).toBeGreaterThanOrEqual(0);
          expect(stat.errorRate).toBeGreaterThanOrEqual(0);
          expect(stat.cacheHitRate).toBeGreaterThanOrEqual(0);
          expect(stat.fallbackRate).toBeGreaterThanOrEqual(0);
        });
      });

      it('should have valid provider enum values', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const validProviders = [
          'GROQ',
          'OPENAI',
          'ANTHROPIC',
          'LOCAL',
          'groq',
          'openai',
          'anthropic',
          'local',
        ];

        response.body.statistics.forEach((stat: any) => {
          expect(validProviders).toContain(stat.provider);
        });
      });

      it('should have rates between 0 and 100', async () => {
        const response = await request(app.getHttpServer())
          .get('/admin/ai-usage')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        response.body.statistics.forEach((stat: any) => {
          expect(stat.errorRate).toBeGreaterThanOrEqual(0);
          expect(stat.errorRate).toBeLessThanOrEqual(100);
          expect(stat.cacheHitRate).toBeGreaterThanOrEqual(0);
          expect(stat.cacheHitRate).toBeLessThanOrEqual(100);
          expect(stat.fallbackRate).toBeGreaterThanOrEqual(0);
          expect(stat.fallbackRate).toBeLessThanOrEqual(100);
        });
      });
    });
  });
});
