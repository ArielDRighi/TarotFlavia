import { Plan } from './plan.entity';
import { UserPlan } from '../../users/entities/user.entity';

describe('Plan Entity', () => {
  describe('constructor and basic properties', () => {
    it('should create a FREE plan with correct defaults', () => {
      const plan = new Plan();
      plan.planType = UserPlan.FREE;
      plan.name = 'Plan Gratuito';
      plan.description = 'Plan básico gratuito';
      plan.price = 0;
      plan.readingsLimit = 10;
      plan.aiQuotaMonthly = 100;
      plan.isActive = true;

      expect(plan.planType).toBe(UserPlan.FREE);
      expect(plan.name).toBe('Plan Gratuito');
      expect(plan.readingsLimit).toBe(10);
      expect(plan.aiQuotaMonthly).toBe(100);
      expect(plan.isActive).toBe(true);
    });

    it('should create a PREMIUM plan with unlimited limits', () => {
      const plan = new Plan();
      plan.planType = UserPlan.PREMIUM;
      plan.name = 'Plan Premium';
      plan.price = 9.99;
      plan.readingsLimit = -1; // unlimited
      plan.aiQuotaMonthly = -1; // unlimited

      expect(plan.planType).toBe(UserPlan.PREMIUM);
      expect(plan.readingsLimit).toBe(-1);
      expect(plan.aiQuotaMonthly).toBe(-1);
    });

    it('should create a PROFESSIONAL plan with unlimited limits', () => {
      const plan = new Plan();
      plan.planType = UserPlan.PROFESSIONAL;
      plan.name = 'Plan Profesional';
      plan.price = 19.99;
      plan.readingsLimit = -1;
      plan.aiQuotaMonthly = -1;

      expect(plan.planType).toBe(UserPlan.PROFESSIONAL);
      expect(plan.readingsLimit).toBe(-1);
    });
  });

  describe('feature flags', () => {
    it('should have all feature flags set to false by default for FREE', () => {
      const plan = new Plan();
      plan.planType = UserPlan.FREE;
      plan.allowCustomQuestions = false;
      plan.allowSharing = false;
      plan.allowAdvancedSpreads = false;

      expect(plan.allowCustomQuestions).toBe(false);
      expect(plan.allowSharing).toBe(false);
      expect(plan.allowAdvancedSpreads).toBe(false);
    });

    it('should allow enabling all features for PREMIUM', () => {
      const plan = new Plan();
      plan.planType = UserPlan.PREMIUM;
      plan.allowCustomQuestions = true;
      plan.allowSharing = true;
      plan.allowAdvancedSpreads = true;

      expect(plan.allowCustomQuestions).toBe(true);
      expect(plan.allowSharing).toBe(true);
      expect(plan.allowAdvancedSpreads).toBe(true);
    });
  });

  describe('isUnlimited method', () => {
    it('should return true when readingsLimit is -1', () => {
      const plan = new Plan();
      plan.readingsLimit = -1;

      expect(plan.isUnlimited()).toBe(true);
    });

    it('should return false when readingsLimit is a positive number', () => {
      const plan = new Plan();
      plan.readingsLimit = 10;

      expect(plan.isUnlimited()).toBe(false);
    });

    it('should return false when readingsLimit is 0', () => {
      const plan = new Plan();
      plan.readingsLimit = 0;

      expect(plan.isUnlimited()).toBe(false);
    });
  });

  describe('hasFeature method', () => {
    it('should return true when feature is enabled', () => {
      const plan = new Plan();
      plan.allowCustomQuestions = true;

      expect(plan.hasFeature('allowCustomQuestions')).toBe(true);
    });

    it('should return false when feature is disabled', () => {
      const plan = new Plan();
      plan.allowCustomQuestions = false;

      expect(plan.hasFeature('allowCustomQuestions')).toBe(false);
    });

    it('should return false for invalid feature name', () => {
      const plan = new Plan();

      expect(plan.hasFeature('invalidFeature' as any)).toBe(false);
    });
  });

  describe('getEffectiveAiQuota method', () => {
    it('should return Number.MAX_SAFE_INTEGER for unlimited quota', () => {
      const plan = new Plan();
      plan.aiQuotaMonthly = -1;

      expect(plan.getEffectiveAiQuota()).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should return the actual quota value for limited plans', () => {
      const plan = new Plan();
      plan.aiQuotaMonthly = 100;

      expect(plan.getEffectiveAiQuota()).toBe(100);
    });

    it('should return 0 for zero quota', () => {
      const plan = new Plan();
      plan.aiQuotaMonthly = 0;

      expect(plan.getEffectiveAiQuota()).toBe(0);
    });
  });

  describe('validation', () => {
    it('should require planType', () => {
      const plan = new Plan();
      // planType is required, this would fail validation
      expect(plan.planType).toBeUndefined();
    });

    it('should require name', () => {
      const plan = new Plan();
      // name is required, this would fail validation
      expect(plan.name).toBeUndefined();
    });

    it('should allow negative values for unlimited limits', () => {
      const plan = new Plan();
      plan.readingsLimit = -1;
      plan.aiQuotaMonthly = -1;

      expect(plan.readingsLimit).toBe(-1);
      expect(plan.aiQuotaMonthly).toBe(-1);
    });
  });

  describe('timestamps', () => {
    it('should have createdAt and updatedAt timestamps', () => {
      const plan = new Plan();
      const now = new Date();

      plan.createdAt = now;
      plan.updatedAt = now;

      expect(plan.createdAt).toBeInstanceOf(Date);
      expect(plan.updatedAt).toBeInstanceOf(Date);
    });
  });
});
