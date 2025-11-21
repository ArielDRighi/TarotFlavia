import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

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

describe('Rate Limit Status (e2e)', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let freeAccessToken: string;
  let premiumAccessToken: string;
  let adminAccessToken: string;

  beforeAll(async () => {
    await dbHelper.initialize();
    // NOTE: NO limpiar base de datos aquí - los seeders ya se ejecutaron en globalSetup

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    // Login with seeded test users from globalSetup
    const freeLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'free@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    freeAccessToken = (freeLogin.body as LoginResponse).access_token;

    const premiumLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'premium@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    premiumAccessToken = (premiumLogin.body as LoginResponse).access_token;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Test123456!',
      })
      .expect(200);

    adminAccessToken = (adminLogin.body as LoginResponse).access_token;

    // Verify tokens were obtained
    if (!freeAccessToken || !premiumAccessToken || !adminAccessToken) {
      throw new Error(
        'Failed to obtain authentication tokens from seeded users',
      );
    }
  }, 30000);

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  describe('GET /rate-limit/status', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer())
        .get('/rate-limit/status')
        .expect(401);

      expect(response.body.message).toContain('Unauthorized');
    });

    it('should return rate limit status for FREE user', async () => {
      const response = await request(app.getHttpServer())
        .get('/rate-limit/status')
        .set('Authorization', `Bearer ${freeAccessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        plan: 'free',
        limits: {
          requestsPerHour: 60,
          requestsPerMinute: 100,
          regenerationsPerReading: 0,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: 60,
            minute: 100,
          },
        },
      });

      expect(response.body.resetAt.hour).toBeGreaterThan(Date.now());
      expect(response.body.resetAt.minute).toBeGreaterThan(Date.now());
    });

    it('should return rate limit status for PREMIUM user', async () => {
      const response = await request(app.getHttpServer())
        .get('/rate-limit/status')
        .set('Authorization', `Bearer ${premiumAccessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        plan: 'premium',
        limits: {
          requestsPerHour: 300,
          requestsPerMinute: 200,
          regenerationsPerReading: 3,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: 300,
            minute: 200,
          },
        },
      });

      expect(response.body.resetAt.hour).toBeGreaterThan(Date.now());
      expect(response.body.resetAt.minute).toBeGreaterThan(Date.now());
    });

    it('should return unlimited status for ADMIN users', async () => {
      const response = await request(app.getHttpServer())
        .get('/rate-limit/status')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      // Note: Infinity is serialized as null in JSON
      expect(response.body).toMatchObject({
        plan: 'ADMIN',
        limits: {
          requestsPerHour: null,
          requestsPerMinute: null,
          regenerationsPerReading: null,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: null,
            minute: null,
          },
        },
        resetAt: {
          hour: null,
          minute: null,
        },
      });
    });
  });
});
