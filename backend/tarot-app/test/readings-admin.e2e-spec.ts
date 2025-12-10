import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Readings Admin Controller
 *
 * Tests the admin endpoint for viewing all readings:
 * - GET /admin/readings - List all readings (with optional includeDeleted filter)
 *
 * @module ReadingsAdminE2E
 */
describe('Readings Admin (e2e)', () => {
  let app: INestApplication;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
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

    // Login as admin
    const adminLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' });
    adminToken = adminLogin.body.access_token;

    // Login as regular user
    const userLogin = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' });
    userToken = userLogin.body.access_token;
  });

  afterAll(async () => {
    await dbHelper.close();
    await app.close();
  });

  describe('GET /admin/readings', () => {
    describe('Authentication & Authorization', () => {
      it('should return readings list when authenticated as admin', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should return 403 when authenticated as non-admin user', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should return 401 when not authenticated', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .expect(401);
      });

      it('should return 401 with invalid token', async () => {
        await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', 'Bearer invalid-token')
          .expect(401);
      });
    });

    describe('Response Structure', () => {
      it('should return proper pagination structure', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
        expect(response.body).toHaveProperty('meta');
        expect(response.body.meta).toHaveProperty('totalItems');
        expect(typeof response.body.meta.totalItems).toBe('number');
      });

      it('should return readings array', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Array.isArray(response.body.data)).toBe(true);
      });

      it('should return reading objects with expected properties when data exists', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        if (response.body.data.length > 0) {
          const reading = response.body.data[0];
          expect(reading).toHaveProperty('id');
          // La respuesta puede tener 'user' (objeto) o 'userId' dependiendo de las relaciones
          expect('userId' in reading || 'user' in reading).toBe(true);
          expect(reading).toHaveProperty('createdAt');
        }
      });
    });

    describe('includeDeleted Filter', () => {
      it('should accept includeDeleted=false parameter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .query({ includeDeleted: false })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });

      it('should accept includeDeleted=true parameter', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .query({ includeDeleted: true })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });

      it('should work without includeDeleted parameter (default behavior)', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });

      it('should potentially return more results with includeDeleted=true', async () => {
        const withoutDeleted = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .query({ includeDeleted: false })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const withDeleted = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .query({ includeDeleted: true })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        // With includeDeleted should have >= results than without
        expect(withDeleted.body.meta.totalItems).toBeGreaterThanOrEqual(
          withoutDeleted.body.meta.totalItems,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle string "true" for includeDeleted', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .query({ includeDeleted: 'true' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });

      it('should handle string "false" for includeDeleted', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .query({ includeDeleted: 'false' })
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body).toHaveProperty('data');
      });

      it('should return consistent response on multiple calls', async () => {
        const response1 = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        const response2 = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(Object.keys(response1.body).sort()).toEqual(
          Object.keys(response2.body).sort(),
        );
      });

      it('should return non-negative total count', async () => {
        const response = await request(app.getHttpServer())
          .get('/api/v1/admin/readings')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(0);
      });
    });
  });
});
