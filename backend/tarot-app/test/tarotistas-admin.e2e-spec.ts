import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Tarotistas Admin Controller
 *
 * Tests the admin endpoints for managing tarotistas:
 * - POST /admin/tarotistas - Create tarotista
 * - GET /admin/tarotistas - List all tarotistas
 * - PUT /admin/tarotistas/:id - Update tarotista
 * - PUT /admin/tarotistas/:id/deactivate - Deactivate tarotista
 * - PUT /admin/tarotistas/:id/reactivate - Reactivate tarotista
 * - GET /admin/tarotistas/:id/config - Get config
 * - PUT /admin/tarotistas/:id/config - Update config
 * - POST /admin/tarotistas/:id/config/reset - Reset config
 * - POST /admin/tarotistas/:id/meanings - Set custom meaning
 * - GET /admin/tarotistas/:id/meanings - Get custom meanings
 * - DELETE /admin/tarotistas/:id/meanings/:meaningId - Delete meaning
 * - GET /admin/tarotistas/applications - List applications
 * - POST /admin/tarotistas/applications/:id/approve - Approve application
 * - POST /admin/tarotistas/applications/:id/reject - Reject application
 *
 * @module TarotistasAdminE2E
 */
describe('Tarotistas Admin (e2e)', () => {
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

  describe('GET /admin/tarotistas', () => {
    it('should return tarotistas list when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas')
        .expect(401);
    });
  });

  describe('POST /admin/tarotistas', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas')
        .send({
          userId: 1,
          displayName: 'Test Tarotista',
          bio: 'Test bio',
        })
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          userId: 1,
          displayName: 'Test Tarotista',
          bio: 'Test bio',
        })
        .expect(403);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('PUT /admin/tarotistas/:id', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1')
        .send({ displayName: 'Updated Name' })
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ displayName: 'Updated Name' })
        .expect(403);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ displayName: 'Updated Name' })
        .expect(400);
    });
  });

  describe('PUT /admin/tarotistas/:id/deactivate', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1/deactivate')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1/deactivate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/invalid/deactivate')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('PUT /admin/tarotistas/:id/reactivate', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1/reactivate')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1/reactivate')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/tarotistas/:id/config', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/1/config')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/1/config')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return config for existing tarotista', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/1/config')
        .set('Authorization', `Bearer ${adminToken}`);

      // Either 200 with config or 404 if tarotista doesn't exist
      expect([200, 404]).toContain(response.status);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/invalid/config')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('PUT /admin/tarotistas/:id/config', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1/config')
        .send({})
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/admin/tarotistas/1/config')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('POST /admin/tarotistas/:id/config/reset', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/1/config/reset')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/1/config/reset')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('GET /admin/tarotistas/:id/meanings', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/1/meanings')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/1/meanings')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return meanings for existing tarotista', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/1/meanings')
        .set('Authorization', `Bearer ${adminToken}`);

      // Either 200 with meanings array or 404 if tarotista doesn't exist
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(Array.isArray(response.body)).toBe(true);
      }
    });
  });

  describe('POST /admin/tarotistas/:id/meanings', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/1/meanings')
        .send({})
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/1/meanings')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/1/meanings')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(400);
    });
  });

  describe('DELETE /admin/tarotistas/:id/meanings/:meaningId', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/tarotistas/1/meanings/1')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/tarotistas/1/meanings/1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });

    it('should return 400 for invalid id', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/tarotistas/invalid/meanings/1')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });

    it('should return 400 for invalid meaningId', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/admin/tarotistas/1/meanings/invalid')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  describe('GET /admin/tarotistas/applications', () => {
    it('should return applications list when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/applications')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/applications')
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/admin/tarotistas/applications')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });

  describe('POST /admin/tarotistas/applications/:id/approve', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/applications/1/approve')
        .send({})
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/applications/1/approve')
        .set('Authorization', `Bearer ${userToken}`)
        .send({})
        .expect(403);
    });

    it('should return 404 for non-existent application', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/applications/999999/approve')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({})
        .expect(404);
    });
  });

  describe('POST /admin/tarotistas/applications/:id/reject', () => {
    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/applications/1/reject')
        .send({ reason: 'Test rejection' })
        .expect(401);
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/applications/1/reject')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ reason: 'Test rejection' })
        .expect(403);
    });

    it('should return error for non-existent application', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/v1/admin/tarotistas/applications/999999/reject')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test rejection' });

      // May return 400 (validation) or 404 (not found)
      expect([400, 404]).toContain(response.status);
    });
  });
});
