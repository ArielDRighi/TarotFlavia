import { validate } from 'class-validator';
import { UpdateUserPlanDto } from './update-user-plan.dto';
import { UserPlan, SubscriptionStatus } from '../../entities/user.entity';

describe('UpdateUserPlanDto', () => {
  describe('validation', () => {
    it('should pass validation with valid premium plan data', async () => {
      const dto = new UpdateUserPlanDto();
      dto.plan = UserPlan.PREMIUM;
      dto.subscriptionStatus = SubscriptionStatus.ACTIVE;
      dto.planStartedAt = new Date('2023-01-01');
      dto.planExpiresAt = new Date('2023-12-31');
      dto.stripeCustomerId = 'cus_123456789';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid free plan data', async () => {
      const dto = new UpdateUserPlanDto();
      dto.plan = UserPlan.FREE;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with only required fields', async () => {
      const dto = new UpdateUserPlanDto();
      dto.plan = UserPlan.PREMIUM;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid plan', async () => {
      const dto = new UpdateUserPlanDto();

      (dto as any).plan = 'invalid_plan';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('plan');
    });

    it('should fail validation with invalid subscription status', async () => {
      const dto = new UpdateUserPlanDto();
      dto.plan = UserPlan.PREMIUM;

      (dto as any).subscriptionStatus = 'invalid_status';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) => e.property === 'subscriptionStatus'),
      ).toBeTruthy();
    });

    it('should fail validation with invalid date format', async () => {
      const dto = new UpdateUserPlanDto();
      dto.plan = UserPlan.PREMIUM;

      (dto as any).planStartedAt = 'invalid-date';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'planStartedAt')).toBeTruthy();
    });

    it('should fail validation with invalid stripeCustomerId type', async () => {
      const dto = new UpdateUserPlanDto();
      dto.plan = UserPlan.PREMIUM;

      (dto as any).stripeCustomerId = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) => e.property === 'stripeCustomerId'),
      ).toBeTruthy();
    });
  });
});
