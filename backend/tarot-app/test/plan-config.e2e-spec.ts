import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserPlan } from '../src/modules/users/entities/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';

const TEST_DOMAIN = 'test-plan-config.com';

interface PlanResponse {
  id: number;
  planType: UserPlan;
  name: string;
  description: string;
  readingsLimit: number;
  aiQuotaMonthly: number;
  price: number;
  features: Record<string, boolean>;
  createdAt: string;
  updatedAt: string;
}

describe('Plan Config Management (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
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
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    await app.init();

    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Clean up test data
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      `%@${TEST_DOMAIN}`,
    ]);

    // Create admin user
    const hashedPassword = await bcrypt.hash('AdminPass123!', 10);
    await dataSource.query(
      `INSERT INTO "user" (email, "passwordHash", name, "emailVerified", roles, plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name`,
      [
        `admin@${TEST_DOMAIN}`,
        hashedPassword,
        'Test Admin',
        true,
        [UserRole.ADMIN],
        UserPlan.PREMIUM,
      ],
    );

    // Create regular user
    await dataSource.query(
      `INSERT INTO "user" (email, "passwordHash", name, "emailVerified", roles, plan)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, name`,
      [
        `user@${TEST_DOMAIN}`,
        hashedPassword,
        'Test User',
        true,
        [],
        UserPlan.FREE,
      ],
    );

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `admin@${TEST_DOMAIN}`,
        password: 'AdminPass123!',
      })
      .expect(200);

    adminToken = adminLoginResponse.body.access_token;

    // Login as regular user
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `user@${TEST_DOMAIN}`,
        password: 'AdminPass123!',
      })
      .expect(200);

    userToken = userLoginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      `%@${TEST_DOMAIN}`,
    ]);
    await app.close();
  });

  describe('GET /plan-config', () => {
    it('should return all plans for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(4); // GUEST, FREE, PREMIUM, PROFESSIONAL

      // Verify structure
      const plan = response.body[0];
      expect(plan).toHaveProperty('id');
      expect(plan).toHaveProperty('planType');
      expect(plan).toHaveProperty('name');
      expect(plan).toHaveProperty('description');
      expect(plan).toHaveProperty('readingsLimit');
      expect(plan).toHaveProperty('aiQuotaMonthly');
      expect(plan).toHaveProperty('price');
      expect(plan).toHaveProperty('features');
      expect(plan).toHaveProperty('createdAt');
      expect(plan).toHaveProperty('updatedAt');
    });

    it('should deny access for non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/plan-config')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny access for unauthenticated users', async () => {
      await request(app.getHttpServer()).get('/plan-config').expect(401);
    });

    it('should return plans ordered by planType', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const planTypes = response.body.map((p: PlanResponse) => p.planType);
      const sortedPlanTypes = [...planTypes].sort();
      expect(planTypes).toEqual(sortedPlanTypes);
    });
  });

  describe('GET /plan-config/:planType', () => {
    it('should return specific plan by type for admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.planType).toBe('free');
      expect(response.body.name).toBeDefined();
      expect(response.body.readingsLimit).toBeDefined();
    });

    it('should return GUEST plan details', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan-config/guest')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.planType).toBe('guest');
      expect(response.body.readingsLimit).toBe(3);
      expect(response.body.aiQuotaMonthly).toBe(0);
    });

    it('should return 404 for non-existent plan type', async () => {
      await request(app.getHttpServer())
        .get('/plan-config/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access for non-admin users', async () => {
      await request(app.getHttpServer())
        .get('/plan-config/free')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('POST /plan-config', () => {
    const newPlanData = {
      planType: UserPlan.PREMIUM,
      name: 'Test Premium Plan',
      description: 'A test premium plan',
      readingsLimit: -1,
      aiQuotaMonthly: -1,
      price: 29.99,
      features: {
        saveHistory: true,
        aiInterpretations: true,
        prioritySupport: true,
      },
    };

    it('should create a new plan as admin', async () => {
      // First, delete the plan if it exists (for idempotency)
      await dataSource.query('DELETE FROM plan WHERE "planType" = $1', [
        'premium',
      ]);

      const response = await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPlanData)
        .expect(201);

      expect(response.body.planType).toBe(newPlanData.planType);
      expect(response.body.name).toBe(newPlanData.name);
      expect(response.body.readingsLimit).toBe(newPlanData.readingsLimit);
      expect(response.body.features).toEqual(newPlanData.features);
    });

    it('should return 409 if plan already exists', async () => {
      // Create plan first
      await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPlanData);

      // Try to create again
      await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(newPlanData)
        .expect(409);

      // Clean up
      await dataSource.query('DELETE FROM plan WHERE "planType" = $1', [
        'premium',
      ]);
    });

    it('should validate required fields', async () => {
      const invalidData = {
        planType: UserPlan.PREMIUM,
        // Missing required fields
      };

      await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate readingsLimit is a number', async () => {
      const invalidData = {
        ...newPlanData,
        readingsLimit: 'invalid',
      };

      await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should validate price is not negative', async () => {
      const invalidData = {
        ...newPlanData,
        price: -10,
      };

      await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);
    });

    it('should deny access for non-admin users', async () => {
      await request(app.getHttpServer())
        .post('/plan-config')
        .set('Authorization', `Bearer ${userToken}`)
        .send(newPlanData)
        .expect(403);
    });
  });

  describe('PUT /plan-config/:planType', () => {
    beforeEach(async () => {
      // Ensure FREE plan exists and reset it to known state
      await dataSource.query(
        `INSERT INTO plan ("planType", name, description, "readingsLimit", "aiQuotaMonthly", price, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ("planType") DO UPDATE
         SET name = $2, description = $3, "readingsLimit" = $4, "aiQuotaMonthly" = $5, price = $6, features = $7`,
        [
          UserPlan.FREE,
          'Free Plan',
          'Basic free plan',
          10,
          100,
          0,
          JSON.stringify({ saveHistory: true, aiInterpretations: true }),
        ],
      );
    });

    it('should update an existing plan as admin', async () => {
      const updateData = {
        name: 'Updated Free Plan',
        description: 'Updated description',
        readingsLimit: 15,
        aiQuotaMonthly: 150,
      };

      const response = await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.readingsLimit).toBe(updateData.readingsLimit);
      expect(response.body.aiQuotaMonthly).toBe(updateData.aiQuotaMonthly);
      expect(response.body.planType).toBe('free'); // Should not change
    });

    it('should update only provided fields', async () => {
      const updateData = {
        readingsLimit: 20,
      };

      const response = await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.readingsLimit).toBe(20);
      expect(response.body.name).toBe('Updated Free Plan'); // From previous test or default
    });

    it('should update features object', async () => {
      const updateData = {
        features: {
          saveHistory: true,
          aiInterpretations: true,
          customQuestions: true,
        },
      };

      const response = await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.features).toEqual(updateData.features);
    });

    it('should return 404 for non-existent plan', async () => {
      await request(app.getHttpServer())
        .put('/plan-config/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ name: 'Test' })
        .expect(404);
    });

    it('should not allow changing planType', async () => {
      const updateData = {
        planType: UserPlan.PREMIUM,
        name: 'Hacked Plan',
      };

      const response = await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      // planType should remain 'free'
      expect(response.body.planType).toBe('free');
    });

    it('should deny access for non-admin users', async () => {
      await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ name: 'Test' })
        .expect(403);
    });
  });

  describe('DELETE /plan-config/:planType', () => {
    beforeEach(async () => {
      // Create a test plan for deletion
      await dataSource.query(
        `INSERT INTO plan ("planType", name, description, "readingsLimit", "aiQuotaMonthly", price, features)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT ("planType") DO NOTHING`,
        [
          'premium',
          'Premium Test Plan',
          'For deletion tests',
          -1,
          -1,
          19.99,
          JSON.stringify({ saveHistory: true }),
        ],
      );
    });

    it('should delete an existing plan as admin', async () => {
      await request(app.getHttpServer())
        .delete('/plan-config/premium')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify deletion
      const result = await dataSource.query(
        'SELECT * FROM plan WHERE "planType" = $1',
        ['premium'],
      );
      expect(result).toHaveLength(0);
    });

    it('should return 404 for non-existent plan', async () => {
      await request(app.getHttpServer())
        .delete('/plan-config/nonexistent')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should deny access for non-admin users', async () => {
      await request(app.getHttpServer())
        .delete('/plan-config/premium')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should deny deletion for unauthenticated users', async () => {
      await request(app.getHttpServer())
        .delete('/plan-config/premium')
        .expect(401);
    });
  });

  describe('Plan Config - Edge Cases', () => {
    it('should handle unlimited readings (-1)', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan-config/premium')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.readingsLimit).toBe(-1);
    });

    it('should handle zero AI quota (GUEST plan)', async () => {
      const response = await request(app.getHttpServer())
        .get('/plan-config/guest')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.aiQuotaMonthly).toBe(0);
    });

    it('should preserve features object structure', async () => {
      const complexFeatures = {
        saveHistory: true,
        aiInterpretations: false,
        customQuestions: true,
        prioritySupport: false,
        advancedAnalytics: true,
      };

      // Update plan with complex features
      await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ features: complexFeatures })
        .expect(200);

      // Retrieve and verify
      const response = await request(app.getHttpServer())
        .get('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.features).toEqual(complexFeatures);
    });

    it('should handle decimal prices correctly', async () => {
      const updateData = {
        price: 9.99,
      };

      const response = await request(app.getHttpServer())
        .put('/plan-config/free')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.price).toBe(9.99);
    });
  });

  describe('Plan Config - Authorization Edge Cases', () => {
    it('should reject invalid JWT token', async () => {
      await request(app.getHttpServer())
        .get('/plan-config')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should reject malformed Authorization header', async () => {
      await request(app.getHttpServer())
        .get('/plan-config')
        .set('Authorization', adminToken) // Missing "Bearer"
        .expect(401);
    });

    it('should reject admin operations with regular user token', async () => {
      const operations = [
        request(app.getHttpServer())
          .get('/plan-config')
          .set('Authorization', `Bearer ${userToken}`),
        request(app.getHttpServer())
          .post('/plan-config')
          .set('Authorization', `Bearer ${userToken}`)
          .send({
            planType: UserPlan.PREMIUM,
            name: 'Test',
            description: 'Test',
            readingsLimit: 10,
            aiQuotaMonthly: 10,
            price: 10,
            features: {},
          }),
        request(app.getHttpServer())
          .put('/plan-config/free')
          .set('Authorization', `Bearer ${userToken}`)
          .send({ name: 'Test' }),
        request(app.getHttpServer())
          .delete('/plan-config/premium')
          .set('Authorization', `Bearer ${userToken}`),
      ];

      for (const operation of operations) {
        await operation.expect(403);
      }
    });
  });
});
