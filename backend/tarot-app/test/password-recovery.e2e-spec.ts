import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { APP_GUARD, APP_FILTER } from '@nestjs/core';
import { EmailService } from '../src/modules/email/email.service';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';

/**
 * El token de reseteo NO se devuelve por la API ni se loguea (T-PROD-015).
 * La única vía legítima para obtenerlo es el email, así que los tests lo leen
 * del EmailService mockeado — igual que lo haría el usuario desde su bandeja.
 */
describe('Password Recovery (e2e)', () => {
  let app: INestApplication<App>;
  const dbHelper = new E2EDatabaseHelper();
  let resetToken: string;

  const GENERIC_MESSAGE =
    'Si el email está registrado, recibirás un enlace para restablecer tu contraseña.';

  const mockEmailService = {
    sendPasswordResetEmail: jest
      .fn()
      .mockImplementation((_to: string, _userName: string, token: string) => {
        resetToken = token;
        return Promise.resolve();
      }),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
  };

  const testUser = {
    email: 'password-test@example.com',
    name: 'Password Test User',
    password: 'OldPassword123!',
  };

  const requestPasswordReset = async (
    email: string = testUser.email,
  ): Promise<request.Response> =>
    request(app.getHttpServer())
      .post('/api/v1/auth/forgot-password')
      .send({ email })
      .expect(200);

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
      .overrideProvider(EmailService)
      .useValue(mockEmailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');

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
        .post('/api/v1/auth/register')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('access_token');
      expect(response.body).toHaveProperty('refresh_token');
      expect(response.body).toHaveProperty('user');
    });

    it('should request password reset and send the email with the token', async () => {
      const response = await requestPasswordReset();

      expect(response.body).toHaveProperty('message', GENERIC_MESSAGE);
      // El token viaja SOLO por email: nunca en la respuesta HTTP
      expect(response.body).not.toHaveProperty('token');
      expect(mockEmailService.sendPasswordResetEmail).toHaveBeenCalledWith(
        testUser.email,
        testUser.name,
        expect.any(String),
      );
      expect(resetToken).toBeDefined();
      expect(resetToken.length).toBeGreaterThan(0);
    });

    it('should fail to reset password with invalid token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: 'invalid-token-123',
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should reset password successfully with valid token', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
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
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherPassword123!',
        })
        .expect(400);
    });

    it('should fail to login with old password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(401);
    });

    it('should login successfully with new password', async () => {
      const newPassword = 'NewPassword123!';

      const response = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
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
      // Request a new password reset (the token arrives through the mocked email)
      await requestPasswordReset();

      // Get a refresh token before password reset
      const loginResponse = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
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
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'AnotherNewPassword123!',
        })
        .expect(200);

      // Try to use old refresh token - should fail
      await request(app.getHttpServer())
        .post('/api/v1/auth/refresh')
        .send({
          refreshToken: oldRefreshToken,
        })
        .expect(401);
    });

    it('should handle password reset for non-existent user', async () => {
      // Security: Returns 200 with the same message (not 404) to prevent user enumeration
      mockEmailService.sendPasswordResetEmail.mockClear();

      const response = await requestPasswordReset('nonexistent@example.com');

      expect(response.body).toHaveProperty('message', GENERIC_MESSAGE);
      expect(mockEmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should validate password strength on reset', async () => {
      await requestPasswordReset();

      // Try with weak password (no numbers) - validates IsStrongPassword decorator
      await request(app.getHttpServer())
        .post('/api/v1/auth/reset-password')
        .send({
          token: resetToken,
          newPassword: 'WeakPassword',
        })
        .expect(400);
    });
  });
});
