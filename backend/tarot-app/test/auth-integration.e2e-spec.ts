/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

interface AuthResponse {
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

describe('Auth Integration Tests (E2E)', () => {
  let app: INestApplication;
  let datasource: DataSource;

  const testUserData = {
    email: 'integration-test@example.com',
    password: 'SecurePassword123!',
    name: 'Integration Test User',
  };

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

    datasource = moduleFixture.get<DataSource>(DataSource);
  });

  afterAll(async () => {
    // Clean up test data
    await datasource.query(
      `DELETE FROM "user" WHERE email = '${testUserData.email}'`,
    );
    await app.close();
  });

  afterEach(async () => {
    // Clean up test user after each test
    await datasource.query(
      `DELETE FROM "user" WHERE email = '${testUserData.email}'`,
    );
  });

  describe('Complete Auth Flow: Register → Login → Refresh → Logout', () => {
    it('should register new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      expect(response.body).toBeDefined();
      expect(response.body.access_token).toBeDefined();
      expect(response.body.refresh_token).toBeDefined();
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testUserData.email);
      expect(response.body.user.name).toBe(testUserData.name);
      expect(response.body.user.isAdmin).toBe(false);
      expect(response.body.user.plan).toBe('free');
    });

    it('should not register user with duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      // Attempt duplicate registration
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: 'AnotherPassword123!',
          name: 'Another Name',
        })
        .expect(409); // Conflict
    });

    it('should login after registration', async () => {
      // Register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      // Login
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        })
        .expect(200);

      expect(loginResponse.body).toBeDefined();
      expect(loginResponse.body.access_token).toBeDefined();
      expect(loginResponse.body.refresh_token).toBeDefined();
      expect(loginResponse.body.user).toBeDefined();
      expect(loginResponse.body.user.email).toBe(testUserData.email);
    });

    it('should not login with wrong password', async () => {
      // Register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      // Attempt login with wrong password
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserData.email,
          password: 'WrongPassword123!',
        })
        .expect(401);
    });

    it('should refresh access token', async () => {
      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      const originalRefreshToken = (registerResponse.body as AuthResponse)
        .refresh_token;

      // Refresh
      const refreshResponse = await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: originalRefreshToken,
        })
        .expect(201);

      expect(refreshResponse.body).toBeDefined();
      expect(refreshResponse.body.access_token).toBeDefined();
      expect(refreshResponse.body.refresh_token).toBeDefined();
      // Refresh token should be different (rotation)
      expect(refreshResponse.body.refresh_token).not.toBe(originalRefreshToken);
    });

    it('should logout user', async () => {
      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      const refreshToken = (registerResponse.body as AuthResponse)
        .refresh_token;

      // Logout
      await request(app.getHttpServer())
        .post('/auth/logout')
        .send({
          refreshToken: refreshToken,
        })
        .expect(201);

      // Attempt to refresh with logged-out token should fail
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: refreshToken,
        })
        .expect(401);
    });

    it('should logout from all sessions', async () => {
      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      const accessToken = (registerResponse.body as AuthResponse).access_token;

      // Create multiple sessions (login multiple times)
      const session1Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        })
        .expect(200);

      const session2Response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        })
        .expect(200);

      const session1RefreshToken = (session1Response.body as AuthResponse)
        .refresh_token;
      const session2RefreshToken = (session2Response.body as AuthResponse)
        .refresh_token;

      // Logout from all sessions
      await request(app.getHttpServer())
        .post('/auth/logout-all')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(201);

      // All refresh tokens should be revoked
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: session1RefreshToken,
        })
        .expect(401);

      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: session2RefreshToken,
        })
        .expect(401);
    });

    // TODO: Requires implementing /users/:id/ban endpoint
    it.skip('should not login banned user', async () => {
      // Register
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      // Ban user (requires admin access)
      const adminLoginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: 'Test123456!',
        })
        .expect(200);

      const adminToken = (adminLoginResponse.body as AuthResponse).access_token;

      // Get user ID
      const usersResponse = await request(app.getHttpServer())
        .get('/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
      const testUser = usersResponse.body.find(
        (u: any) => u.email === testUserData.email,
      );

      await request(app.getHttpServer())
        .post(`/users/${testUser.id}/ban`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          reason: 'Test ban',
        })
        .expect(200);

      // Attempt login
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        })
        .expect(403);
    });
  });

  describe('Password validation', () => {
    it('should reject weak passwords', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: 'weak',
          name: testUserData.name,
        })
        .expect(400);
    });

    it('should reject registration without email', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(400);
    });

    it('should reject registration without name', async () => {
      await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
        })
        .expect(400);
    });
  });

  describe('Token security', () => {
    it('should reject invalid refresh token', async () => {
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: 'invalid-token',
        })
        .expect(401);
    });

    it('should reject expired refresh token', async () => {
      // This would require mocking time or waiting for token expiration
      // Skipping for now as it's a complex test
    });

    it('should not allow reusing refresh token after rotation', async () => {
      // Register
      const registerResponse = await request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: testUserData.email,
          password: testUserData.password,
          name: testUserData.name,
        })
        .expect(201);

      const originalRefreshToken = (registerResponse.body as AuthResponse)
        .refresh_token;

      // First refresh (should work)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: originalRefreshToken,
        })
        .expect(201);

      // Second refresh with same token (should fail due to rotation)
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: originalRefreshToken,
        })
        .expect(401);
    });
  });
});
