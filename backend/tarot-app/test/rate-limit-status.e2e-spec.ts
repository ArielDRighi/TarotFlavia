import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Rate Limit Status (e2e)', () => {
  let app: INestApplication;
  let freeAccessToken: string;
  let premiumAccessToken: string;
  let adminAccessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // Apply global pipes like in main.ts
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    // Login with seeded test users
    const freeLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'free@test.com',
        password: 'Test123456!',
      });
    freeAccessToken = freeLogin.body.accessToken;

    const premiumLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'premium@test.com',
        password: 'Test123456!',
      });
    premiumAccessToken = premiumLogin.body.accessToken;

    const adminLogin = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'Test123456!',
      });
    adminAccessToken = adminLogin.body.accessToken;
  }, 30000);

  afterAll(async () => {
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
    });

    it('should return unlimited status for ADMIN users', async () => {
      const response = await request(app.getHttpServer())
        .get('/rate-limit/status')
        .set('Authorization', `Bearer ${adminAccessToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        plan: 'ADMIN',
        limits: {
          requestsPerHour: Infinity,
          requestsPerMinute: Infinity,
          regenerationsPerReading: Infinity,
        },
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: Infinity,
            minute: Infinity,
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
