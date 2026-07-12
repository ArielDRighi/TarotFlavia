import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { EmailService } from '../../src/modules/email/email.service';
import { AuthOrchestratorService } from '../../src/modules/auth/application/services/auth-orchestrator.service';

// Entities
import { User, UserPlan } from '../../src/modules/users/entities/user.entity';

// Increase timeout for integration tests
jest.setTimeout(30000);

describe('Email Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let emailService: EmailService;
  let authService: AuthOrchestratorService;

  // Test data
  let testUser: User;

  const testUserData = {
    email: `email-test-${Date.now()}@example.com`,
    password: 'TestPass123!',
    name: 'Email Test User',
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

    dataSource = moduleFixture.get<DataSource>(DataSource);
    usersService = moduleFixture.get<UsersService>(UsersService);
    emailService = moduleFixture.get<EmailService>(EmailService);
    authService = moduleFixture.get<AuthOrchestratorService>(
      AuthOrchestratorService,
    );
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    // Crear usuario de prueba con email único
    const uniqueEmail = `email-test-${Date.now()}-${Math.random()}@example.com`;

    const userWithoutPassword = await usersService.create({
      email: uniqueEmail,
      password: testUserData.password,
      name: testUserData.name,
    });

    const userRepo = dataSource.getRepository(User);
    testUser = (await userRepo.findOne({
      where: { id: userWithoutPassword.id },
    }))!;
  });

  afterEach(async () => {
    if (testUser?.id) {
      const userRepo = dataSource.getRepository(User);
      await userRepo.delete({ id: testUser.id });
    }
  });

  describe('Welcome Email', () => {
    it('should send welcome email when user registers', async () => {
      // ARRANGE
      const sendWelcomeSpy = jest.spyOn(emailService, 'sendWelcomeEmail');

      // ACT
      await emailService.sendWelcomeEmail(testUser.email, testUser.name);

      // ASSERT
      expect(sendWelcomeSpy).toHaveBeenCalledWith(
        testUser.email,
        testUser.name,
      );
      expect(sendWelcomeSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Password Reset Email', () => {
    /**
     * El token de reseteo viaja SOLO por email (T-PROD-015): no se devuelve por la API
     * ni se loguea. Los tests lo obtienen espiando al EmailService, que es la única vía
     * legítima — la misma que usa el usuario desde su bandeja de entrada.
     */
    it('should send password reset email when user requests it', async () => {
      // ARRANGE
      const sendPasswordResetSpy = jest.spyOn(
        emailService,
        'sendPasswordResetEmail',
      );

      // ACT
      const result = await authService.forgotPassword(testUser.email);

      // ASSERT
      expect(sendPasswordResetSpy).toHaveBeenCalledTimes(1);
      expect(sendPasswordResetSpy).toHaveBeenCalledWith(
        testUser.email,
        testUser.name,
        expect.any(String),
      );
      // El token nunca se filtra por la respuesta HTTP
      expect(result).not.toHaveProperty('token');
    });

    it('should send password reset email with valid token that can be used', async () => {
      // ARRANGE
      const sendPasswordResetSpy = jest.spyOn(
        emailService,
        'sendPasswordResetEmail',
      );

      // ACT: Request password reset
      await authService.forgotPassword(testUser.email);

      // ASSERT: Email sent
      expect(sendPasswordResetSpy).toHaveBeenCalledTimes(1);

      // ACT: Use the token from the email to reset password
      const resetToken = sendPasswordResetSpy.mock.calls[0][2];
      const resetResult = await authService.resetPassword(
        resetToken,
        'NewTestPass456!',
      );

      // ASSERT: Password was reset successfully
      expect(resetResult).toBeDefined();
      expect(resetResult.message).toBe('Password reset successful');
    });
  });

  describe('Plan Change Email', () => {
    it('should send plan change notification when user upgrades to premium', async () => {
      // ARRANGE
      const sendPlanChangeSpy = jest.spyOn(emailService, 'sendPlanChangeEmail');

      // ACT
      await emailService.sendPlanChangeEmail(testUser.email, {
        userName: testUser.name,
        oldPlan: UserPlan.FREE,
        newPlan: UserPlan.PREMIUM,
        changeDate: new Date().toISOString(),
      });

      // ASSERT
      expect(sendPlanChangeSpy).toHaveBeenCalledTimes(1);
      expect(sendPlanChangeSpy).toHaveBeenCalledWith(
        testUser.email,
        expect.objectContaining({
          userName: testUser.name,
          oldPlan: UserPlan.FREE,
          newPlan: UserPlan.PREMIUM,
        }),
      );
    });
  });

  describe('Quota Warning Email', () => {
    it('should send quota warning when user reaches 80% usage', async () => {
      // ARRANGE
      const sendQuotaWarningSpy = jest.spyOn(
        emailService,
        'sendQuotaWarningEmail',
      );

      const quotaData = {
        userName: testUser.name,
        plan: UserPlan.FREE,
        quotaLimit: 100,
        requestsUsed: 80,
        requestsRemaining: 20,
        percentageUsed: 80,
        resetDate: 'December 1, 2025',
        frontendUrl: 'http://localhost:3000',
      };

      // ACT
      await emailService.sendQuotaWarningEmail(testUser.email, quotaData);

      // ASSERT
      expect(sendQuotaWarningSpy).toHaveBeenCalledTimes(1);
      expect(sendQuotaWarningSpy).toHaveBeenCalledWith(
        testUser.email,
        expect.objectContaining({
          percentageUsed: 80,
          plan: UserPlan.FREE,
        }),
      );
    });

    it('should send quota limit reached when user hits 100% usage', async () => {
      // ARRANGE
      const sendQuotaLimitSpy = jest.spyOn(
        emailService,
        'sendQuotaLimitReachedEmail',
      );

      const quotaData = {
        userName: testUser.name,
        plan: UserPlan.FREE,
        quotaLimit: 100,
        requestsUsed: 100,
        resetDate: 'December 1, 2025',
        frontendUrl: 'http://localhost:3000',
      };

      // ACT
      await emailService.sendQuotaLimitReachedEmail(testUser.email, quotaData);

      // ASSERT
      expect(sendQuotaLimitSpy).toHaveBeenCalledTimes(1);
      expect(sendQuotaLimitSpy).toHaveBeenCalledWith(
        testUser.email,
        expect.objectContaining({
          requestsUsed: 100,
          plan: UserPlan.FREE,
        }),
      );
    });
  });
});
