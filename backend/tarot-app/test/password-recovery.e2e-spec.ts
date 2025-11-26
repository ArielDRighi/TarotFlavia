import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

describe('Password Recovery (e2e)', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let resetToken: string;

  const testUser = {
    email: 'password-test@example.com',
    name: 'Password Test User',
    password: 'OldPassword123!',
  };

  beforeAll(async () => {
    // Create a mock guard that always allows requests (disables throttling)
    const mockThrottlerGuard = {
      canActivate: jest.fn().mockReturnValue(true),
    };

    // Create a mock filter that does nothing (disables throttler exception handling)
    const mockThrottlerFilter = {
      catch: jest.fn(),
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(APP_GUARD)
      .useValue(mockThrottlerGuard)
      .overrideProvider(APP_FILTER)
      .useValue(mockThrottlerFilter)
      .compile();

    app = moduleFixture.createNestApplication();

    // Configure validation pipe globally
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();

    await dbHelper.initialize();

    // Cleanup: Delete test user and related data BEFORE tests
    const dataSource = dbHelper.getDataSource();
    await dataSource.query(
      `DELETE FROM "password_reset_tokens" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`,
      [testUser.email],
    );
    await dataSource.query(
      `DELETE FROM "refresh_tokens" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`,
      [testUser.email],
    );
    await dataSource.query(`DELETE FROM "user" WHERE email = $1`, [
      testUser.email,
    ]);
  });

  afterAll(async () => {
    // Cleanup: Delete test user and related data
    const dataSource = dbHelper.getDataSource();
    await dataSource.query(
      `DELETE FROM "password_reset_tokens" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`,
      [testUser.email],
    );
    await dataSource.query(
      `DELETE FROM "refresh_tokens" WHERE user_id IN (SELECT id FROM "user" WHERE email = $1)`,
      [testUser.email],
    );
    await dataSource.query(`DELETE FROM "user" WHERE email = $1`, [
      testUser.email,
    ]);

    await dbHelper.close();
    await app.close();
  });

  describe('Password Recovery Flow', () => {
    it('should register a new user', async () => {
      const response = await request(app.getHttpServer())
        .post('/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should request password reset', async () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation((...args: unknown[]) => {
          // Capture the reset token from console log
          const message = args.join(' ');
          if (typeof message === 'string' && message.includes('token=')) {
            const match = message.match(/token=([a-f0-9]+)/);
            if (match?.[1]) {
              resetToken = match[1];
            }
          }
        });

      const response = await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Password reset email sent',
      );
      expect(resetToken).toBeDefined();
      expect(resetToken.length).toBeGreaterThan(0);

      consoleLogSpy.mockRestore();
    });

    it('should fail to reset password with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should reset password successfully with valid token', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty(
        'message',
        'Password reset successful',
      );
    });

    it('should not allow reusing the same reset token', async () => {
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);
    });

    it('should fail to login with old password', async () => {
      await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);
    });

    it('should login successfully with new password', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: newPassword,
        })
        .expect(200);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should invalidate old refresh tokens after password reset', async () => {
      // Request a new password reset
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation((...args: unknown[]) => {
          const message = args.join(' ');
          if (typeof message === 'string' && message.includes('token=')) {
            const match = message.match(/token=([a-f0-9]+)/);
            if (match?.[1]) {
              resetToken = match[1];
            }
          }
        });

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      consoleLogSpy.mockRestore();

      // Get a refresh token before password reset
      const loginResponse = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: testUser.email,
          password: 'NewPassword123!',
        })
        .expect(200);

      interface LoginResponse {
        refresh_token: string;
      }
      const oldRefreshToken = String(
        (loginResponse.body as LoginResponse).refresh_token,
      );

      // Reset password
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherNewPassword123!',
        })
        .expect(200);

      // Try to use old refresh token - should fail
      await request(app.getHttpServer())
        .post('/auth/refresh')
        .send({
          refreshToken: oldRefreshToken,
        })
        .expect(401);
    });

    it('should handle password reset for non-existent user', async () => {
      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(200);
    });

    it('should validate password strength on reset', async () => {
      const consoleLogSpy = jest
        .spyOn(console, 'log')
        .mockImplementation((...args: unknown[]) => {
          const message = args.join(' ');
          if (typeof message === 'string' && message.includes('token=')) {
            const match = message.match(/token=([a-f0-9]+)/);
            if (match?.[1]) {
              resetToken = match[1];
            }
          }
        });

      await request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: testUser.email })
        .expect(200);

      consoleLogSpy.mockRestore();

      // Try with weak password (no numbers) - validates IsStrongPassword decorator
      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'WeakPassword',
        })
        .expect(400);
    });
  });
});
