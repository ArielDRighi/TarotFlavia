import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../../src/app.module';
import { DataSource } from 'typeorm';
import { PlanConfigService } from '../../src/modules/plan-config/plan-config.service';
import { UserPlan } from '../../src/modules/users/entities/user.entity';
import { Plan } from '../../src/modules/plan-config/entities/plan.entity';

jest.setTimeout(30000);

/**
 * PLAN CONFIG INTEGRATION TESTS
 *
 * Objetivo: Validar configuración de planes y sus límites
 * Base de datos: tarot_integration (PostgreSQL puerto 5439)
 */
describe('Plan Configuration Integration Tests', () => {
  let app: INestApplication;
  let planService: PlanConfigService;
  let dataSource: DataSource;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    planService = moduleFixture.get<PlanConfigService>(PlanConfigService);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // Seed planes iniciales
    await seedPlans(dataSource);
  });

  afterAll(async () => {
    await dataSource.destroy();
    await app.close();
  });

  describe('Plan Configuration', () => {
    it('should have 3 active plans (ANONYMOUS, FREE, PREMIUM)', async () => {
      const plans = await planService.findAll();

      expect(plans).toHaveLength(3);
      expect(plans.map((p) => p.planType)).toEqual(
        expect.arrayContaining([
          UserPlan.ANONYMOUS,
          UserPlan.FREE,
          UserPlan.PREMIUM,
        ]),
      );
      expect(plans.every((p) => p.isActive)).toBe(true);
    });

    it('should find ANONYMOUS plan with correct limits', async () => {
      const plan = await planService.findByPlanType(UserPlan.ANONYMOUS);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe(UserPlan.ANONYMOUS);
      // Updated by TASK-003: MVP Strategy values
      expect(plan.readingsLimit).toBe(1); // 1 daily card reading
      expect(plan.aiQuotaMonthly).toBe(0); // No AI for anonymous
      expect(parseFloat(plan.price.toString())).toBe(0);
    });

    it('should find FREE plan with correct limits', async () => {
      const plan = await planService.findByPlanType(UserPlan.FREE);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe(UserPlan.FREE);
      // Updated by TASK-003: MVP Strategy values - COST OPTIMIZATION
      expect(plan.readingsLimit).toBe(2); // 2 readings (1 daily card + 1 spread)
      expect(plan.aiQuotaMonthly).toBe(0); // No AI for FREE (cost saving)
      expect(parseFloat(plan.price.toString())).toBe(0);
    });

    it('should find PREMIUM plan with correct limits', async () => {
      const plan = await planService.findByPlanType(UserPlan.PREMIUM);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe(UserPlan.PREMIUM);
      // Updated by TASK-003: MVP Strategy values - LIMITED BUT SUFFICIENT
      expect(plan.readingsLimit).toBe(3); // 3 readings monthly
      expect(plan.aiQuotaMonthly).toBe(100); // 100 AI requests monthly
      expect(parseFloat(plan.price.toString())).toBeGreaterThan(0);
    });
  });

  describe('Plan Features Validation', () => {
    it('should validate custom questions feature per plan', async () => {
      const anonymous = await planService.findByPlanType(UserPlan.ANONYMOUS);
      const free = await planService.findByPlanType(UserPlan.FREE);
      const premium = await planService.findByPlanType(UserPlan.PREMIUM);

      expect(anonymous.allowCustomQuestions).toBe(false);
      expect(free.allowCustomQuestions).toBe(false);
      expect(premium.allowCustomQuestions).toBe(true);
    });

    it('should validate sharing feature per plan', async () => {
      const anonymous = await planService.findByPlanType(UserPlan.ANONYMOUS);
      const free = await planService.findByPlanType(UserPlan.FREE);
      const premium = await planService.findByPlanType(UserPlan.PREMIUM);

      expect(anonymous.allowSharing).toBe(false);
      expect(free.allowSharing).toBe(false);
      expect(premium.allowSharing).toBe(true);
    });

    it('should validate advanced spreads feature per plan', async () => {
      const anonymous = await planService.findByPlanType(UserPlan.ANONYMOUS);
      const free = await planService.findByPlanType(UserPlan.FREE);
      const premium = await planService.findByPlanType(UserPlan.PREMIUM);

      expect(anonymous.allowAdvancedSpreads).toBe(false);
      expect(free.allowAdvancedSpreads).toBe(false);
      expect(premium.allowAdvancedSpreads).toBe(true);
    });
  });

  describe('Plan Methods', () => {
    it('should correctly identify unlimited plans', async () => {
      const premium = await planService.findByPlanType(UserPlan.PREMIUM);

      // Updated by TASK-003: PREMIUM is now LIMITED (3 readings)
      expect(premium.isUnlimited()).toBe(false);
      expect(premium.readingsLimit).toBe(3);
    });

    it('should get effective AI quota correctly', async () => {
      const premium = await planService.findByPlanType(UserPlan.PREMIUM);

      // Updated by TASK-003: PREMIUM has limited AI quota (100)
      expect(premium.getEffectiveAiQuota()).toBe(100);
    });
  });

  describe('Plan Updates', () => {
    it('should update plan limits successfully', async () => {
      const free = await planService.findByPlanType(UserPlan.FREE);
      const originalLimit = free.readingsLimit;

      const updated = await planService.update(UserPlan.FREE, {
        readingsLimit: originalLimit + 5,
      });

      expect(updated.readingsLimit).toBe(originalLimit + 5);

      // Restore original
      await planService.update(UserPlan.FREE, {
        readingsLimit: originalLimit,
      });
    });

    it('should update plan features successfully', async () => {
      const free = await planService.findByPlanType(UserPlan.FREE);
      const originalSharing = free.allowSharing;

      const updated = await planService.update(UserPlan.FREE, {
        allowSharing: !originalSharing,
      });

      expect(updated.allowSharing).toBe(!originalSharing);

      // Restore original
      await planService.update(UserPlan.FREE, {
        allowSharing: originalSharing,
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw NotFoundException for non-existent plan', async () => {
      await expect(
        planService.findByPlanType('nonexistent' as any),
      ).rejects.toThrow();
    });

    it('should throw ConflictException when creating duplicate plan', async () => {
      await expect(
        planService.create({
          planType: UserPlan.FREE, // Already exists
          name: 'Duplicate Free',
          description: 'This should fail',
          price: 0,
          readingsLimit: 10,
          aiQuotaMonthly: 100,
          allowCustomQuestions: false,
          allowSharing: false,
          allowAdvancedSpreads: false,
          isActive: true,
        }),
      ).rejects.toThrow();
    });

    it('should throw error for invalid feature name', async () => {
      const plan = await planService.findByPlanType(UserPlan.FREE);

      expect(() => plan.hasFeature('invalidFeature' as any)).toThrow();
    });
  });
});

/**
 * Helper para seed de planes iniciales
 * Updated to match TASK-003 MVP cost optimization strategy values
 *
 * IMPORTANT: This function uses UPDATE-or-INSERT (UPSERT) strategy intentionally:
 * - On every test run, existing plans are UPDATED to match current strategy values
 * - This ensures data consistency across test runs and prevents stale data issues
 * - Tests should NOT depend on mutations between each other (test isolation principle)
 * - This approach guarantees that all tests start with the same baseline data
 * - If a test needs to modify plan configs, it should restore them in afterEach
 */
async function seedPlans(dataSource: DataSource) {
  const planRepository = dataSource.getRepository(Plan);

  const plans = [
    {
      planType: UserPlan.ANONYMOUS,
      name: 'Plan Anónimo',
      description: 'Plan básico sin registro',
      price: 0,
      readingsLimit: 1, // Updated TASK-003: 1 daily card only
      aiQuotaMonthly: 0, // No AI for anonymous
      allowCustomQuestions: false,
      allowSharing: false,
      allowAdvancedSpreads: false,
      isActive: true,
    },
    {
      planType: UserPlan.FREE,
      name: 'Plan Gratuito',
      description: 'Plan gratuito con registro',
      price: 0,
      readingsLimit: 2, // Updated TASK-003: 2 readings (1 daily + 1 spread)
      aiQuotaMonthly: 0, // Updated TASK-003: No AI for cost optimization
      allowCustomQuestions: false, // Updated TASK-009: Only PREMIUM allowed
      allowSharing: false,
      allowAdvancedSpreads: false, // Only PREMIUM allowed
      isActive: true,
    },
    {
      planType: UserPlan.PREMIUM,
      name: 'Plan Premium',
      description: 'Plan premium con todas las funciones',
      price: 9.99,
      readingsLimit: 3, // Updated TASK-003: 3 readings monthly
      aiQuotaMonthly: 100, // Updated TASK-003: 100 AI requests monthly
      allowCustomQuestions: true,
      allowSharing: true,
      allowAdvancedSpreads: true,
      isActive: true,
    },
  ];

  for (const planData of plans) {
    const existing = await planRepository.findOne({
      where: { planType: planData.planType },
    });

    if (existing) {
      // UPDATE existing plan to match current strategy
      await planRepository.update({ planType: planData.planType }, planData);
    } else {
      // INSERT new plan
      await planRepository.save(planData);
    }
  }
}
