import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreatePlanDto } from './create-plan.dto';
import { UserPlan } from '../../users/entities/user.entity';

describe('CreatePlanDto', () => {
  describe('valid data', () => {
    it('should validate a valid FREE plan', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Plan Gratuito',
        description: 'Plan básico gratuito',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
        isActive: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate a valid PREMIUM plan with unlimited limits', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.PREMIUM,
        name: 'Plan Premium',
        description: 'Plan premium con todo ilimitado',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
        isActive: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should validate with minimal required fields', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Basic Plan',
        price: 0,
        readingsLimit: 5,
        aiQuotaMonthly: 50,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('planType validation', () => {
    it('should fail if planType is missing', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        name: 'Plan',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('planType');
    });

    it('should fail if planType is invalid', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: 'invalid-plan',
        name: 'Plan',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('planType');
    });
  });

  describe('name validation', () => {
    it('should fail if name is missing', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail if name is empty string', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: '',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });

    it('should fail if name exceeds 100 characters', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'a'.repeat(101),
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('name');
    });
  });

  describe('price validation', () => {
    it('should accept 0 as valid price', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept positive decimal prices', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.PREMIUM,
        name: 'Premium Plan',
        price: 19.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail if price is negative', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: -5,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });

    it('should fail if price is missing', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('price');
    });
  });

  describe('readingsLimit validation', () => {
    it('should accept -1 for unlimited', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.PREMIUM,
        name: 'Premium Plan',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept positive integers', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail if readingsLimit is less than -1', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: 0,
        readingsLimit: -2,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('readingsLimit');
    });

    it('should fail if readingsLimit is missing', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: 0,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('readingsLimit');
    });
  });

  describe('aiQuotaMonthly validation', () => {
    it('should accept -1 for unlimited', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.PREMIUM,
        name: 'Premium Plan',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept positive integers', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should fail if aiQuotaMonthly is less than -1', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free Plan',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: -5,
      });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('aiQuotaMonthly');
    });
  });

  describe('boolean flags validation', () => {
    it('should accept boolean true', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.PREMIUM,
        name: 'Premium',
        price: 9.99,
        readingsLimit: -1,
        aiQuotaMonthly: -1,
        allowCustomQuestions: true,
        allowSharing: true,
        allowAdvancedSpreads: true,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should accept boolean false', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
        allowCustomQuestions: false,
        allowSharing: false,
        allowAdvancedSpreads: false,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('should use default false when optional booleans are omitted', async () => {
      const dto = plainToInstance(CreatePlanDto, {
        planType: UserPlan.FREE,
        name: 'Free',
        price: 0,
        readingsLimit: 10,
        aiQuotaMonthly: 100,
      });

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });
});
