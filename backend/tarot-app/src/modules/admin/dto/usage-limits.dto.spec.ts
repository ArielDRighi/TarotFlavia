import { validate } from 'class-validator';
import {
  UpdateBirthChartLimitsDto,
  UsageLimitConfigDto,
} from './usage-limits.dto';

describe('UpdateBirthChartLimitsDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 3;
      dto.premiumLimit = 5;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with zero limits', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 0;
      dto.premiumLimit = 0;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with max limits', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 100;
      dto.premiumLimit = 100;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with negative freeLimit', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = -1;
      dto.premiumLimit = 5;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('freeLimit');
    });

    it('should fail validation with negative premiumLimit', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 3;
      dto.premiumLimit = -1;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('premiumLimit');
    });

    it('should fail validation with freeLimit > 100', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 101;
      dto.premiumLimit = 5;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('freeLimit');
    });

    it('should fail validation with premiumLimit > 100', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 3;
      dto.premiumLimit = 101;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('premiumLimit');
    });

    it('should fail validation with non-integer freeLimit', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 3.5 as unknown as number;
      dto.premiumLimit = 5;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('freeLimit');
    });

    it('should fail validation with non-integer premiumLimit', async () => {
      const dto = new UpdateBirthChartLimitsDto();
      dto.freeLimit = 3;
      dto.premiumLimit = 5.5 as unknown as number;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('premiumLimit');
    });
  });
});

describe('UsageLimitConfigDto', () => {
  describe('properties', () => {
    it('should set and get all required properties', () => {
      const dto = new UsageLimitConfigDto();

      dto.usageType = 'birth_chart';
      dto.period = 'monthly';
      dto.limits = { anonymous: 1, free: 3, premium: 5 };
      dto.updatedAt = '2026-02-06T12:00:00Z';

      expect(dto.usageType).toBe('birth_chart');
      expect(dto.period).toBe('monthly');
      expect(dto.limits).toEqual({ anonymous: 1, free: 3, premium: 5 });
      expect(dto.updatedAt).toBe('2026-02-06T12:00:00Z');
    });

    it('should handle optional updatedBy field', () => {
      const dto = new UsageLimitConfigDto();

      dto.usageType = 'birth_chart';
      dto.period = 'monthly';
      dto.limits = { anonymous: 1, free: 3, premium: 5 };
      dto.updatedAt = '2026-02-06T12:00:00Z';
      dto.updatedBy = 'admin@auguria.com';

      expect(dto.updatedBy).toBe('admin@auguria.com');
    });

    it('should allow updatedBy to be undefined', () => {
      const dto = new UsageLimitConfigDto();

      dto.usageType = 'birth_chart';
      dto.period = 'monthly';
      dto.limits = { anonymous: 1, free: 3, premium: 5 };
      dto.updatedAt = '2026-02-06T12:00:00Z';

      expect(dto.updatedBy).toBeUndefined();
    });
  });
});
