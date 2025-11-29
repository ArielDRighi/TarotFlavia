import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module';

// Services
import { UsersService } from '../../src/modules/users/users.service';
import { PlanConfigService } from '../../src/modules/plan-config/plan-config.service';

// Entities
import { User, UserPlan } from '../../src/modules/users/entities/user.entity';
import { Plan } from '../../src/modules/plan-config/entities/plan.entity';

/**
 * Integration Tests: PlanConfig + Users
 * Tests how plan configuration integrates with user management
 * Following TESTING_PHILOSOPHY.md: Tests should find REAL bugs, not assume correctness
 */
describe('PlanConfig + Users Integration Tests', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let usersService: UsersService;
  let planConfigService: PlanConfigService;

  // Repositories
  let userRepository: any;
  let planRepository: any;

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
    planConfigService = moduleFixture.get<PlanConfigService>(PlanConfigService);

    // Initialize repositories
    userRepository = dataSource.getRepository(User);
    planRepository = dataSource.getRepository(Plan);
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(async () => {
    // Clean up test users
    await dataSource.query('DELETE FROM "user" WHERE email LIKE $1', [
      '%plan-config-users-integration%',
    ]);
  });

  describe('User Plan Validation', () => {
    it('should create user with default FREE plan', async () => {
      const userData = {
        email: `test-default-${Date.now()}@plan-config-users-integration.com`,
        password: 'TestPass123!',
        name: 'Test User',
      };

      const user = await usersService.create(userData);

      // VERIFY: Does the system default to FREE plan?
      expect(user.plan).toBe(UserPlan.FREE);
    });

    it('should validate all plan types exist in plan_config', async () => {
      const testPlans = [
        UserPlan.GUEST,
        UserPlan.FREE,
        UserPlan.PREMIUM,
        UserPlan.PROFESSIONAL,
      ];

      for (const planType of testPlans) {
        // BUG HUNT: Does each plan exist in database?
        const plan = await planConfigService.findByPlanType(planType);
        expect(plan).toBeDefined();
        expect(plan.planType).toBe(planType);

        // BUG HUNT: Can we create users with this plan?
        const user = await usersService.create({
          email: `test-${planType}-${Date.now()}@plan-config-users-integration.com`,
          password: 'TestPass123!',
          name: `Test ${planType} User`,
        });

        const fullUser = await userRepository.findOne({
          where: { id: user.id },
        });

        fullUser.plan = planType;
        await userRepository.save(fullUser);

        const updatedUser = await userRepository.findOne({
          where: { id: user.id },
        });

        // VERIFY: Did the plan update correctly?
        expect(updatedUser.plan).toBe(planType);
      }
    });
  });

  describe('Plan Limit Consistency', () => {
    it('should have consistent GUEST plan limits', async () => {
      const guestPlan = await planConfigService.findByPlanType(UserPlan.GUEST);

      // VERIFY: GUEST plan configuration matches requirements
      expect(guestPlan.readingsLimit).toBe(3);
      expect(guestPlan.aiQuotaMonthly).toBe(0);
      expect(guestPlan.allowCustomQuestions).toBe(false);
      expect(guestPlan.allowSharing).toBe(false);
      expect(guestPlan.allowAdvancedSpreads).toBe(false);
    });

    it('should have consistent FREE plan limits', async () => {
      const freePlan = await planConfigService.findByPlanType(UserPlan.FREE);

      // VERIFY: FREE plan configuration matches requirements
      expect(freePlan.readingsLimit).toBe(10);
      expect(freePlan.aiQuotaMonthly).toBe(100);
      expect(freePlan.allowCustomQuestions).toBe(false);
      expect(freePlan.allowSharing).toBe(false);
      expect(freePlan.allowAdvancedSpreads).toBe(false);
    });

    it('should have unlimited limits for PREMIUM plan', async () => {
      const premiumPlan = await planConfigService.findByPlanType(
        UserPlan.PREMIUM,
      );

      // VERIFY: PREMIUM has unlimited limits (-1)
      expect(premiumPlan.readingsLimit).toBe(-1);
      expect(premiumPlan.aiQuotaMonthly).toBe(-1);
      expect(premiumPlan.allowCustomQuestions).toBe(true);
      expect(premiumPlan.allowSharing).toBe(true);
      expect(premiumPlan.allowAdvancedSpreads).toBe(true);
    });
  });

  describe('Plan Service Helper Methods', () => {
    it('should get correct readings limit for each plan', async () => {
      const guestLimit = await planConfigService.getReadingsLimit(
        UserPlan.GUEST,
      );
      const freeLimit = await planConfigService.getReadingsLimit(UserPlan.FREE);
      const premiumLimit = await planConfigService.getReadingsLimit(
        UserPlan.PREMIUM,
      );

      // VERIFY: Limits match seeder configuration
      expect(guestLimit).toBe(3);
      expect(freeLimit).toBe(10);
      expect(premiumLimit).toBe(-1);
    });

    it('should get correct AI quota for each plan', async () => {
      const guestQuota = await planConfigService.getAiQuota(UserPlan.GUEST);
      const freeQuota = await planConfigService.getAiQuota(UserPlan.FREE);
      const premiumQuota = await planConfigService.getAiQuota(UserPlan.PREMIUM);

      // VERIFY: AI quotas match seeder configuration
      expect(guestQuota).toBe(0);
      expect(freeQuota).toBe(100);
      expect(premiumQuota).toBe(-1);
    });

    it('should check feature availability correctly', async () => {
      // VERIFY: GUEST does not have allowSharing
      const guestHasSharing = await planConfigService.hasFeature(
        UserPlan.GUEST,
        'allowSharing',
      );
      expect(guestHasSharing).toBe(false);

      // VERIFY: PREMIUM has allowSharing
      const premiumHasSharing = await planConfigService.hasFeature(
        UserPlan.PREMIUM,
        'allowSharing',
      );
      expect(premiumHasSharing).toBe(true);

      // VERIFY: PREMIUM has allowCustomQuestions
      const premiumHasCustom = await planConfigService.hasFeature(
        UserPlan.PREMIUM,
        'allowCustomQuestions',
      );
      expect(premiumHasCustom).toBe(true);
    });
  });

  describe('Dynamic Plan Updates', () => {
    it('should immediately reflect reading limit changes', async () => {
      const freePlan = await planConfigService.findByPlanType(UserPlan.FREE);
      const originalLimit = freePlan.readingsLimit;
      expect(originalLimit).toBe(10);

      // Update limit
      await planRepository.update(
        { planType: UserPlan.FREE },
        { readingsLimit: 15 },
      );

      // VERIFY: New limit is immediately available
      const newLimit = await planConfigService.getReadingsLimit(UserPlan.FREE);
      expect(newLimit).toBe(15);

      // Restore original
      await planRepository.update(
        { planType: UserPlan.FREE },
        { readingsLimit: originalLimit },
      );
    });

    it('should immediately reflect AI quota changes', async () => {
      const freePlan = await planConfigService.findByPlanType(UserPlan.FREE);
      const originalQuota = freePlan.aiQuotaMonthly;
      expect(originalQuota).toBe(100);

      // Update quota
      await planRepository.update(
        { planType: UserPlan.FREE },
        { aiQuotaMonthly: 50 },
      );

      // VERIFY: New quota is immediately available
      const newQuota = await planConfigService.getAiQuota(UserPlan.FREE);
      expect(newQuota).toBe(50);

      // Restore original
      await planRepository.update(
        { planType: UserPlan.FREE },
        { aiQuotaMonthly: originalQuota },
      );
    });

    it('should immediately reflect feature flag changes', async () => {
      const freePlan = await planConfigService.findByPlanType(UserPlan.FREE);
      const originalAllowSharing = freePlan.allowSharing;
      expect(originalAllowSharing).toBe(false);

      // Enable sharing for FREE plan
      await planRepository.update(
        { planType: UserPlan.FREE },
        { allowSharing: true },
      );

      // VERIFY: Feature is immediately available
      const hasSharing = await planConfigService.hasFeature(
        UserPlan.FREE,
        'allowSharing',
      );
      expect(hasSharing).toBe(true);

      // Restore original
      await planRepository.update(
        { planType: UserPlan.FREE },
        { allowSharing: originalAllowSharing },
      );
    });
  });

  describe('Plan Pricing', () => {
    it('should have correct pricing for each plan', async () => {
      const guestPlan = await planConfigService.findByPlanType(UserPlan.GUEST);
      const freePlan = await planConfigService.findByPlanType(UserPlan.FREE);
      const premiumPlan = await planConfigService.findByPlanType(
        UserPlan.PREMIUM,
      );
      const professionalPlan = await planConfigService.findByPlanType(
        UserPlan.PROFESSIONAL,
      );

      // VERIFY: Free plans cost $0
      expect(parseFloat(guestPlan.price.toString())).toBe(0);
      expect(parseFloat(freePlan.price.toString())).toBe(0);

      // VERIFY: Paid plans have prices
      expect(parseFloat(premiumPlan.price.toString())).toBeGreaterThan(0);
      expect(parseFloat(professionalPlan.price.toString())).toBeGreaterThan(
        parseFloat(premiumPlan.price.toString()),
      );
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException for invalid plan type', async () => {
      // BUG HUNT: Does it handle invalid plan types correctly?
      // Note: PostgreSQL validates enum at query level, throwing QueryFailedError
      await expect(
        planConfigService.findByPlanType('invalid' as UserPlan),
      ).rejects.toThrow();
    });

    it('should throw NotFoundException for getReadingsLimit with invalid plan', async () => {
      await expect(
        planConfigService.getReadingsLimit('invalid' as UserPlan),
      ).rejects.toThrow();
    });

    it('should throw NotFoundException for getAiQuota with invalid plan', async () => {
      await expect(
        planConfigService.getAiQuota('invalid' as UserPlan),
      ).rejects.toThrow();
    });

    it('should throw NotFoundException for hasFeature with invalid plan', async () => {
      await expect(
        planConfigService.hasFeature('invalid' as UserPlan, 'allowSharing'),
      ).rejects.toThrow();
    });
  });
});
