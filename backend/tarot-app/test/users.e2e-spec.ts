import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * E2E Tests for Users Module (Regular User Endpoints)
 *
 * Tests cover:
 * - GET /users/profile - Get own profile
 * - PATCH /users/profile - Update own profile
 * - GET /users - List all users (admin only)
 * - GET /users/:id - Get user by ID
 * - DELETE /users/:id - Delete user
 * - PATCH /users/:id/plan - Update user plan (admin only)
 * - Role management endpoints (admin only)
 *
 * Following TESTING_PHILOSOPHY.md guidelines:
 * - No `as any` casts
 * - Investigate failures in production code, not tests
 * - Tests validate real behavior
 */
describe('Users (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let adminToken: string;
  let freeUserToken: string;
  let premiumUserToken: string;
  let freeUserId: number;
  let premiumUserId: number;
  let adminUserId: number;

  interface UserProfile {
    id: number;
    email: string;
    name: string;
    plan: string;
    roles: string[];
    profilePicture?: string;
    createdAt: string;
    updatedAt: string;
  }

  interface LoginResponse {
    access_token: string;
    user: {
      id: number;
      email: string;
      plan: string;
    };
  }

  beforeAll(async () => {
    // Initialize E2E database helper
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Create NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Login to get tokens (using seeded users)
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'admin@test.com', password: 'Test123456!' })
      .expect(200);

    const freeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' })
      .expect(200);

    const premiumLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'premium@test.com', password: 'Test123456!' })
      .expect(200);

    const adminBody = adminLoginResponse.body as LoginResponse;
    const freeBody = freeLoginResponse.body as LoginResponse;
    const premiumBody = premiumLoginResponse.body as LoginResponse;

    adminToken = adminBody.access_token;
    freeUserToken = freeBody.access_token;
    premiumUserToken = premiumBody.access_token;
    adminUserId = adminBody.user.id;
    freeUserId = freeBody.user.id;
    premiumUserId = premiumBody.user.id;

    if (!adminToken || !freeUserToken || !premiumUserToken) {
      throw new Error('Failed to obtain authentication tokens');
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  });

  // ============================================
  // GET /users/profile - Get Own Profile
  // ============================================
  describe('GET /users/profile', () => {
    it('should return profile for authenticated free user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      const profile = response.body as UserProfile;
      expect(profile.id).toBe(freeUserId);
      expect(profile.email).toBe('free@test.com');
      expect(profile.plan).toBe('free');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('roles');
      expect(profile).not.toHaveProperty('password'); // Password should be excluded
    });

    it('should return profile for authenticated premium user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${premiumUserToken}`)
        .expect(200);

      const profile = response.body as UserProfile;
      expect(profile.id).toBe(premiumUserId);
      expect(profile.email).toBe('premium@test.com');
      expect(profile.plan).toBe('premium');
    });

    it('should return profile for authenticated admin user', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const profile = response.body as UserProfile;
      expect(profile.id).toBe(adminUserId);
      expect(profile.email).toBe('admin@test.com');
      expect(profile.roles).toContain('admin');
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/users/profile').expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  // ============================================
  // PATCH /users/profile - Update Own Profile
  // ============================================
  describe('PATCH /users/profile', () => {
    it('should update user name', async () => {
      const newName = 'Updated Free User';

      const response = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ name: newName })
        .expect(200);

      const profile = response.body as UserProfile;
      expect(profile.name).toBe(newName);

      // Verify the change persisted
      const verifyResponse = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      expect((verifyResponse.body as UserProfile).name).toBe(newName);
    });

    it('should update profile picture URL', async () => {
      const newPicture = 'https://example.com/new-profile.jpg';

      const response = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ profilePicture: newPicture })
        .expect(200);

      const profile = response.body as UserProfile;
      expect(profile.profilePicture).toBe(newPicture);
    });

    it('should return 400 for invalid email format', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for password too short', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ password: '12345' }) // Less than 6 characters
        .expect(400);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile')
        .send({ name: 'Test' })
        .expect(401);
    });

    it('should allow empty update (no changes)', async () => {
      const response = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({})
        .expect(200);

      expect(response.body).toHaveProperty('id');
    });
  });

  // ============================================
  // GET /users - List All Users (Admin Only)
  // ============================================
  describe('GET /users', () => {
    it('should return all users when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const users = response.body as UserProfile[];
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThanOrEqual(3); // At least admin, free, premium
    });

    it('should return 403 when authenticated as non-admin user', async () => {
      await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer()).get('/users').expect(401);
    });
  });

  // ============================================
  // GET /users/:id - Get User by ID
  // ============================================
  describe('GET /users/:id', () => {
    it('should return own user data', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${freeUserId}`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      const user = response.body as UserProfile;
      expect(user.id).toBe(freeUserId);
      expect(user.email).toBe('free@test.com');
    });

    it('should allow admin to view any user', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${freeUserId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const user = response.body as UserProfile;
      expect(user.id).toBe(freeUserId);
    });

    it('should return 403 when non-admin tries to view other user', async () => {
      await request(app.getHttpServer())
        .get(`/users/${adminUserId}`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .get(`/users/${freeUserId}`)
        .expect(401);
    });
  });

  // ============================================
  // PATCH /users/:id/plan - Update User Plan (Admin Only)
  // ============================================
  describe('PATCH /users/:id/plan', () => {
    let testUserId: number;
    let testUserToken: string;

    beforeEach(async () => {
      // Create a test user for plan updates
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `plantest-${Date.now()}@test.com`,
          password: 'Test123456!',
          name: 'Plan Test User',
        })
        .expect(201);

      const body = registerResponse.body as LoginResponse;
      testUserId = body.user.id;
      testUserToken = body.access_token;
    });

    afterEach(async () => {
      // Clean up test user
      if (testUserId) {
        const dataSource = dbHelper.getDataSource();
        await dataSource.query(`DELETE FROM "user" WHERE id = $1`, [
          testUserId,
        ]);
      }
    });

    it('should update user plan when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/users/${testUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: 'premium' })
        .expect(200);

      expect(response.body.message).toContain('Plan actualizado');
      expect(response.body.user.plan).toBe('premium');
    });

    it('should return 403 when non-admin tries to update plan', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${testUserId}/plan`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({ plan: 'premium' })
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .patch(`/users/${testUserId}/plan`)
        .send({ plan: 'premium' })
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .patch('/users/99999/plan')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: 'premium' })
        .expect(404);
    });
  });

  // ============================================
  // Role Management - POST /users/:id/roles/tarotist
  // ============================================
  describe('POST /users/:id/roles/tarotist', () => {
    let testUserId: number;

    beforeEach(async () => {
      // Create a test user for role tests
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `roletest-${Date.now()}@test.com`,
          password: 'Test123456!',
          name: 'Role Test User',
        })
        .expect(201);

      testUserId = (registerResponse.body as LoginResponse).user.id;
    });

    afterEach(async () => {
      // Clean up test user
      if (testUserId) {
        const dataSource = dbHelper.getDataSource();
        await dataSource.query(`DELETE FROM "user" WHERE id = $1`, [
          testUserId,
        ]);
      }
    });

    it('should add tarotist role when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.message).toContain('TAROTIST');
      expect(response.body.user.roles).toContain('tarotist');
    });

    it('should return 403 when non-admin tries to add role', async () => {
      await request(app.getHttpServer())
        .post(`/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .post(`/users/${testUserId}/roles/tarotist`)
        .expect(401);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/users/99999/roles/tarotist')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });
  });

  // ============================================
  // Role Management - POST /users/:id/roles/admin
  // ============================================
  describe('POST /users/:id/roles/admin', () => {
    let testUserId: number;

    beforeEach(async () => {
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `adminroletest-${Date.now()}@test.com`,
          password: 'Test123456!',
          name: 'Admin Role Test User',
        })
        .expect(201);

      testUserId = (registerResponse.body as LoginResponse).user.id;
    });

    afterEach(async () => {
      if (testUserId) {
        const dataSource = dbHelper.getDataSource();
        await dataSource.query(`DELETE FROM "user" WHERE id = $1`, [
          testUserId,
        ]);
      }
    });

    it('should add admin role when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .post(`/users/${testUserId}/roles/admin`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);

      expect(response.body.message).toContain('ADMIN');
      expect(response.body.user.roles).toContain('admin');
    });

    it('should return 403 when non-admin tries to add admin role', async () => {
      await request(app.getHttpServer())
        .post(`/users/${testUserId}/roles/admin`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });
  });

  // ============================================
  // Role Management - DELETE /users/:id/roles/:role
  // ============================================
  describe('DELETE /users/:id/roles/:role', () => {
    let testUserId: number;

    beforeEach(async () => {
      // Create user and add tarotist role
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `removeroletest-${Date.now()}@test.com`,
          password: 'Test123456!',
          name: 'Remove Role Test User',
        })
        .expect(201);

      testUserId = (registerResponse.body as LoginResponse).user.id;

      // Add tarotist role
      await request(app.getHttpServer())
        .post(`/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(201);
    });

    afterEach(async () => {
      if (testUserId) {
        const dataSource = dbHelper.getDataSource();
        await dataSource.query(`DELETE FROM "user" WHERE id = $1`, [
          testUserId,
        ]);
      }
    });

    it('should remove tarotist role when authenticated as admin', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('TAROTIST');
      expect(response.body.user.roles).not.toContain('tarotist');
    });

    it('should return 403 when non-admin tries to remove role', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${testUserId}/roles/tarotist`)
        .expect(401);
    });

    it('should return 400 for invalid role name', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${testUserId}/roles/invalid-role`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(400);
    });
  });

  // ============================================
  // DELETE /users/:id - Delete User
  // ============================================
  describe('DELETE /users/:id', () => {
    it('should allow admin to delete user', async () => {
      // Create a user to delete
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: `deletetest-${Date.now()}@test.com`,
          password: 'Test123456!',
          name: 'Delete Test User',
        })
        .expect(201);

      const userToDeleteId = (registerResponse.body as LoginResponse).user.id;

      const response = await request(app.getHttpServer())
        .delete(`/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toContain('eliminado');

      // Verify user is deleted
      await request(app.getHttpServer())
        .get(`/users/${userToDeleteId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 403 when non-admin tries to delete other user', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${adminUserId}`)
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(403);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .delete('/users/99999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);
    });

    it('should return 401 when not authenticated', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${freeUserId}`)
        .expect(401);
    });
  });

  // ============================================
  // Edge Cases
  // ============================================
  describe('Edge Cases', () => {
    it('should handle concurrent profile updates', async () => {
      // Send multiple update requests simultaneously
      const updates = await Promise.all([
        request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .send({ name: 'Update 1' }),
        request(app.getHttpServer())
          .patch('/users/profile')
          .set('Authorization', `Bearer ${premiumUserToken}`)
          .send({ name: 'Update 2' }),
      ]);

      // Both should succeed (status 200)
      expect(updates[0].status).toBe(200);
      expect(updates[1].status).toBe(200);
    });

    it('should not expose sensitive data in user responses', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .expect(200);

      const user = response.body as Record<string, unknown>;
      expect(user).not.toHaveProperty('password');
      expect(user).not.toHaveProperty('refreshToken');
    });
  });
});
