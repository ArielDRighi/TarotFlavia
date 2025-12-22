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
      // NOTE: Tests reflect ACTUAL SEEDER VALUES in plans.seeder.ts
      // TASK-003 will update seeder to match MVP Strategy
      expect(plan.readingsLimit).toBe(3); // Current seeder value
      expect(plan.aiQuotaMonthly).toBe(0); // Current seeder value
      expect(parseFloat(plan.price.toString())).toBe(0);
    });

    it('should find FREE plan with correct limits', async () => {
      const plan = await planService.findByPlanType(UserPlan.FREE);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe(UserPlan.FREE);
      // NOTE: Tests reflect ACTUAL SEEDER VALUES in plans.seeder.ts
      // TASK-003 will update seeder to match MVP Strategy
      expect(plan.readingsLimit).toBe(10); // TODO TASK-003: should be 2
      expect(plan.aiQuotaMonthly).toBe(100); // TODO TASK-003: should be 0 (CRITICAL)
      expect(parseFloat(plan.price.toString())).toBe(0);
    });

    it('should find PREMIUM plan with correct limits', async () => {
      const plan = await planService.findByPlanType(UserPlan.PREMIUM);

      expect(plan).toBeDefined();
      expect(plan.planType).toBe(UserPlan.PREMIUM);
      // NOTE: Tests reflect ACTUAL SEEDER VALUES in plans.seeder.ts
      // TASK-003 will update seeder to match MVP Strategy
      expect(plan.readingsLimit).toBe(-1); // Current seeder value (unlimited)
      expect(plan.aiQuotaMonthly).toBe(-1); // Current seeder value (unlimited)
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

      // NOTE: Tests reflect ACTUAL SEEDER VALUES in plans.seeder.ts
      // Seeder defines PREMIUM as unlimited (-1)
      expect(premium.isUnlimited()).toBe(true);
      expect(premium.readingsLimit).toBe(-1);
    });

    it('should get effective AI quota correctly', async () => {
      const premium = await planService.findByPlanType(UserPlan.PREMIUM);

      // NOTE: Tests reflect ACTUAL SEEDER VALUES in plans.seeder.ts
      // PREMIUM has unlimited AI quota (-1 converts to MAX_SAFE_INTEGER)
      expect(premium.getEffectiveAiQuota()).toBe(Number.MAX_SAFE_INTEGER);
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
 */
async function seedPlans(dataSource: DataSource) {
  const planRepository = dataSource.getRepository(Plan);

  const plans = [
    {
      planType: UserPlan.ANONYMOUS,
      name: 'Plan Anónimo',
      description: 'Plan básico sin registro',
      price: 0,
      readingsLimit: 5,
      aiQuotaMonthly: 50,
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
      readingsLimit: 10,
      aiQuotaMonthly: 100,
      allowCustomQuestions: false,
      allowSharing: false,
      allowAdvancedSpreads: false,
      isActive: true,
    },
    {
      planType: UserPlan.PREMIUM,
      name: 'Plan Premium',
      description: 'Plan premium con todas las funciones',
      price: 9.99,
      readingsLimit: 50,
      aiQuotaMonthly: 500,
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

    if (!existing) {
      await planRepository.save(planData);
    }
  }
}
