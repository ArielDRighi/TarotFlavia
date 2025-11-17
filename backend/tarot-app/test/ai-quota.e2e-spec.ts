import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { User, UserPlan } from '../src/modules/users/entities/user.entity';
import * as bcrypt from 'bcryptjs';
import type { Server } from 'http';

describe('AI Quota (E2E)', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let authToken: string;
  let testUserId: number;

  // Helper to get typed HTTP server
  const getServer = () => app.getHttpServer() as Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get(DataSource);

    // Create test user directly in database with quota values
    const userRepository = dataSource.getRepository(User);
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Insert using QueryBuilder to bypass defaults
    const result = await userRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values({
        email: 'quota.test@example.com',
        password: hashedPassword,
        name: 'Quota Test User',
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 50,
        aiCostUsdMonth: 0.025,
        aiTokensUsedMonth: 75000,
        aiProviderUsed: 'groq',
        quotaWarningSent: false,
        aiUsageResetAt: new Date(),
      })
      .execute();

    testUserId = result.identifiers[0].id as number;

    // Login to get auth token
    const loginResponse = await request(getServer())
      .post('/auth/login')
      .send({
        email: 'quota.test@example.com',
        password: 'password123',
      })
      .expect(200);

    authToken = (loginResponse.body as { access_token: string }).access_token;
  });

  afterAll(async () => {
    if (dataSource?.isInitialized) {
      const userRepository = dataSource.getRepository(User);
      await userRepository.delete(testUserId);
      await dataSource.destroy();
    }
    await app?.close();
  });

  describe('GET /usage/ai', () => {
    it('should return quota information for authenticated user', () => {
      return request(getServer())
        .get('/usage/ai')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body).toHaveProperty('quotaLimit', 100);
          expect(body).toHaveProperty('requestsUsed', 50);
          expect(body).toHaveProperty('requestsRemaining', 50);
          expect(body).toHaveProperty('percentageUsed', 50);
          expect(body).toHaveProperty('resetDate');
          expect(body).toHaveProperty('warningTriggered', false);
          expect(body).toHaveProperty('plan', UserPlan.FREE);
          expect(body).toHaveProperty('tokensUsed', 75000);
          expect(body.costEstimated).toBe('0.025000'); // Decimal returned as string from DB
          expect(body).toHaveProperty('providerPrimarilyUsed', 'groq');
        });
    });

    it('should return 401 when not authenticated', () => {
      return request(getServer()).get('/usage/ai').expect(401);
    });
  });

  describe('PREMIUM user quota', () => {
    let premiumToken: string;
    let premiumUserId: number;

    beforeAll(async () => {
      // Create premium user directly in database
      const userRepository = dataSource.getRepository(User);
      const hashedPassword = await bcrypt.hash('password123', 10);

      const result = await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: 'premium.quota@example.com',
          password: hashedPassword,
          name: 'Premium User',
          plan: UserPlan.PREMIUM,
          aiRequestsUsedMonth: 1000,
          aiCostUsdMonth: 0,
          aiTokensUsedMonth: 0,
          aiProviderUsed: null,
          quotaWarningSent: false,
          aiUsageResetAt: new Date(),
        })
        .execute();

      premiumUserId = result.identifiers[0].id as number;

      const loginResponse = await request(getServer())
        .post('/auth/login')
        .send({
          email: 'premium.quota@example.com',
          password: 'password123',
        })
        .expect(200);

      premiumToken = (loginResponse.body as { access_token: string })
        .access_token;
    });

    afterAll(async () => {
      if (dataSource?.isInitialized) {
        const userRepository = dataSource.getRepository(User);
        await userRepository.delete(premiumUserId);
      }
    });

    it('should show unlimited quota for PREMIUM user', () => {
      return request(getServer())
        .get('/usage/ai')
        .set('Authorization', `Bearer ${premiumToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body).toHaveProperty('quotaLimit', -1);
          expect(body).toHaveProperty('requestsRemaining', -1);
          expect(body).toHaveProperty('percentageUsed', 0);
          expect(body).toHaveProperty('plan', UserPlan.PREMIUM);
        });
    });
  });

  describe('Quota exhausted scenario', () => {
    let exhaustedToken: string;
    let exhaustedUserId: number;

    beforeAll(async () => {
      // Create exhausted user directly in database
      const userRepository = dataSource.getRepository(User);
      const hashedPassword = await bcrypt.hash('password123', 10);

      const result = await userRepository
        .createQueryBuilder()
        .insert()
        .into(User)
        .values({
          email: 'exhausted.quota@example.com',
          password: hashedPassword,
          name: 'Exhausted User',
          plan: UserPlan.FREE,
          aiRequestsUsedMonth: 100, // Quota exhausted
          aiCostUsdMonth: 0,
          aiTokensUsedMonth: 0,
          aiProviderUsed: null,
          quotaWarningSent: false,
          aiUsageResetAt: new Date(),
        })
        .execute();

      exhaustedUserId = result.identifiers[0].id as number;

      const loginResponse = await request(getServer())
        .post('/auth/login')
        .send({
          email: 'exhausted.quota@example.com',
          password: 'password123',
        })
        .expect(200);

      exhaustedToken = (loginResponse.body as { access_token: string })
        .access_token;
    });

    afterAll(async () => {
      if (dataSource?.isInitialized) {
        const userRepository = dataSource.getRepository(User);
        await userRepository.delete(exhaustedUserId);
      }
    });

    it('should show quota exhausted', () => {
      return request(getServer())
        .get('/usage/ai')
        .set('Authorization', `Bearer ${exhaustedToken}`)
        .expect(200)
        .expect((res) => {
          const body = res.body as Record<string, unknown>;
          expect(body).toHaveProperty('quotaLimit', 100);
          expect(body).toHaveProperty('requestsUsed', 100);
          expect(body).toHaveProperty('requestsRemaining', 0);
          expect(body).toHaveProperty('percentageUsed', 100);
        });
    });
  });
});
