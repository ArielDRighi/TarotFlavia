import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UserPlan } from '../src/modules/users/entities/user.entity';
import { UserRole } from '../src/common/enums/user-role.enum';

const TEST_DOMAIN = 'test-admin-users.com';

interface LoginResponse {
  user: {
    id: number;
    email: string;
    name: string;
    isAdmin: boolean;
    plan: string;
  };
  access_token: string;
  refresh_token: string;
}

interface UserListResponse {
  users: Array<{
    id: number;
    email: string;
    name: string;
    roles: UserRole[];
    plan: UserPlan;
    bannedAt: Date | null;
    banReason: string | null;
  }>;
  meta: {
    currentPage: number;
    itemsPerPage: number;
    totalItems: number;
    totalPages: number;
  };
}

interface UserDetailResponse {
  user: {
    id: number;
    email: string;
    name: string;
    roles: UserRole[];
    plan: UserPlan;
    bannedAt: Date | null;
    banReason: string | null;
  };
  statistics: {
    totalReadings: number;
    lastReadingDate: Date | null;
    totalAIUsage: number;
  };
}

interface UserActionResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name: string;
    roles: UserRole[];
    plan: UserPlan;
    bannedAt: Date | null;
    banReason: string | null;
  };
}

describe('Admin Users Management (e2e)', () => {
  let app: INestApplication<App>;
  let dataSource: DataSource;
  let adminToken: string;
  let userToken: string;
  let testUserId: number;

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
      '%@test-admin-users.com',
    ]);

    // Create admin user
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    await dataSource.query(
      `INSERT INTO "user" (email, password, name, "isAdmin", roles, plan) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        'admin@test-admin-users.com',
        hashedPassword,
        'Admin User',
        true,
        [UserRole.CONSUMER, UserRole.ADMIN],
        UserPlan.PREMIUM,
      ],
    );

    // Create regular user
    await dataSource.query(
      `INSERT INTO "user" (email, password, name, "isAdmin", roles, plan) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        'user@test-admin-users.com',
        hashedPassword,
        'Regular User',
        false,
        [UserRole.CONSUMER],
        UserPlan.FREE,
      ],
    );

    // Create test user to manipulate
    const testUserResult: Array<{ id: number }> = await dataSource.query(
      `INSERT INTO "user" (email, password, name, "isAdmin", roles, plan) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      [
        `testuser@${TEST_DOMAIN}`,
        hashedPassword,
        'Test User',
        false,
        [UserRole.CONSUMER],
        UserPlan.FREE,
      ],
    );
    testUserId = testUserResult[0].id;

    // Login as admin
    const adminLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `admin@${TEST_DOMAIN}`,
        password: 'Admin123!',
      });
    const adminLogin = adminLoginResponse.body as LoginResponse;
    adminToken = adminLogin.access_token;

    // Login as regular user
    const userLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: `user@${TEST_DOMAIN}`,
        password: 'Admin123!',
      });
    const userLogin = userLoginResponse.body as LoginResponse;
    userToken = userLogin.access_token;
  });

  afterAll(async () => {
    // Clean up test data
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      `%@${TEST_DOMAIN}`,
    ]);
    await app.close();
  });

  describe('Authentication and Authorization', () => {
    it('should require authentication', async () => {
      const response = await request(app.getHttpServer()).get('/admin/users');

      expect(response.status).toBe(401);
    });

    it('should require admin role', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(403);
    });

    it('should allow admin access', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /admin/users - List users with filters', () => {
    it('should return paginated users', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as UserListResponse;
      expect(body).toHaveProperty('users');
      expect(body).toHaveProperty('meta');
      expect(body.meta).toHaveProperty('currentPage', 1);
      expect(body.meta).toHaveProperty('itemsPerPage', 10);
      expect(body.meta).toHaveProperty('totalItems');
      expect(body.meta).toHaveProperty('totalPages');
      expect(Array.isArray(body.users)).toBe(true);
    });

    it('should filter by search term', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .query({ search: 'admin@test-admin-users.com' })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as UserListResponse;
      expect(body.users.length).toBeGreaterThan(0);
      const foundUser = body.users.find(
        (u) => u.email === 'admin@test-admin-users.com',
      );
      expect(foundUser).toBeDefined();
    });

    it('should filter by role', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .query({ role: UserRole.ADMIN })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as UserListResponse;
      expect(body.users.length).toBeGreaterThan(0);
      body.users.forEach((user) => {
        expect(user.roles).toContain(UserRole.ADMIN);
      });
    });

    it('should support pagination', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users')
        .query({ page: 1, limit: 2 })
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as UserListResponse;
      expect(body.meta.itemsPerPage).toBe(2);
      expect(body.users.length).toBeLessThanOrEqual(2);
    });
  });

  describe('GET /admin/users/:id - Get user detail', () => {
    it('should return user details with statistics', async () => {
      const response = await request(app.getHttpServer())
        .get(`/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as UserDetailResponse;
      expect(body).toHaveProperty('user');
      expect(body).toHaveProperty('statistics');
      expect(body.user).toHaveProperty('email');
      expect(body.statistics).toHaveProperty('totalReadings');
      expect(body.statistics).toHaveProperty('lastReadingDate');
      expect(body.statistics).toHaveProperty('totalAIUsage');
    });

    it('should return 404 for non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .get('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('POST /admin/users/:id/ban - Ban user', () => {
    it('should ban a user with reason', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: 'Test ban reason' });

      expect(response.status).toBe(201);
      const body = response.body as UserActionResponse;
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('user');
      expect(body.user.bannedAt).toBeDefined();
      expect(body.user.banReason).toBe('Test ban reason');
    });

    it('should require ban reason', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ reason: '' });

      expect(response.status).toBe(400);
    });
  });

  describe('Banned user login blocking', () => {
    it('should block banned user from logging in', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: `testuser@${TEST_DOMAIN}`,
          password: 'Admin123!',
        });

      expect(response.status).toBe(401);
      const body = response.body as { message: string; statusCode: number };
      expect(body.message).toContain('baneado');
    });
  });

  describe('POST /admin/users/:id/unban - Unban user', () => {
    it('should unban a user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/unban`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      const body = response.body as UserActionResponse;
      expect(body).toHaveProperty('message');
      expect(body).toHaveProperty('user');
      expect(body.user.bannedAt).toBeNull();
      expect(body.user.banReason).toBeNull();
    });
  });

  describe('PATCH /admin/users/:id/plan - Update user plan', () => {
    it('should update user plan', async () => {
      const response = await request(app.getHttpServer())
        .patch(`/admin/users/${testUserId}/plan`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ plan: UserPlan.PREMIUM });

      expect(response.status).toBe(200);
      const body = response.body as UserActionResponse;
      expect(body).toHaveProperty('user');
      expect(body.user.plan).toBe(UserPlan.PREMIUM);
    });
  });

  describe('POST /admin/users/:id/roles/tarotist - Add TAROTIST role', () => {
    it('should add TAROTIST role to user', async () => {
      const response = await request(app.getHttpServer())
        .post(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(201);
      const body = response.body as UserActionResponse;
      expect(body).toHaveProperty('user');
      expect(body.user.roles).toContain(UserRole.TAROTIST);
    });
  });

  describe('DELETE /admin/users/:id/roles/:role - Remove role', () => {
    it('should remove TAROTIST role from user', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}/roles/tarotist`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      const body = response.body as UserActionResponse;
      expect(body).toHaveProperty('user');
      expect(body.user.roles).not.toContain(UserRole.TAROTIST);
    });
  });

  describe('DELETE /admin/users/:id - Delete user', () => {
    it('should delete a user (soft delete)', async () => {
      const response = await request(app.getHttpServer())
        .delete(`/admin/users/${testUserId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when deleting non-existent user', async () => {
      const response = await request(app.getHttpServer())
        .delete('/admin/users/999999')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(response.status).toBe(404);
    });
  });
});
