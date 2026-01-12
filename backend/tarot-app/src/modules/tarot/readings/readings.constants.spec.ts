import {
  READING_RETENTION_DAYS,
  SOFT_DELETE_GRACE_PERIOD_DAYS,
  DAILY_READING_RETENTION_DAYS,
} from './readings.constants';
import { UserPlan } from '../../users/entities/user.entity';

describe('Readings Constants', () => {
  describe('READING_RETENTION_DAYS', () => {
    it('should be defined', () => {
      expect(READING_RETENTION_DAYS).toBeDefined();
    });

    it('should have retention policy for all user plans', () => {
      expect(READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBeDefined();
      expect(READING_RETENTION_DAYS[UserPlan.FREE]).toBeDefined();
      expect(READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBeDefined();
    });

    it('should set ANONYMOUS users to 0 days retention', () => {
      expect(READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBe(0);
    });

    it('should set FREE users to 30 days retention', () => {
      expect(READING_RETENTION_DAYS[UserPlan.FREE]).toBe(30);
    });

    it('should set PREMIUM users to 365 days retention', () => {
      expect(READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBe(365);
    });

    it('should only contain entries for the three defined user plans', () => {
      const keys = Object.keys(READING_RETENTION_DAYS);
      expect(keys).toHaveLength(3);
      expect(keys).toContain(UserPlan.ANONYMOUS);
      expect(keys).toContain(UserPlan.FREE);
      expect(keys).toContain(UserPlan.PREMIUM);
    });

    it('should have numeric values for all plans', () => {
      Object.values(READING_RETENTION_DAYS).forEach((days) => {
        expect(typeof days).toBe('number');
        expect(days).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('SOFT_DELETE_GRACE_PERIOD_DAYS', () => {
    it('should be defined', () => {
      expect(SOFT_DELETE_GRACE_PERIOD_DAYS).toBeDefined();
    });

    it('should be 30 days', () => {
      expect(SOFT_DELETE_GRACE_PERIOD_DAYS).toBe(30);
    });

    it('should be a positive number', () => {
      expect(typeof SOFT_DELETE_GRACE_PERIOD_DAYS).toBe('number');
      expect(SOFT_DELETE_GRACE_PERIOD_DAYS).toBeGreaterThan(0);
    });
  });

  describe('DAILY_READING_RETENTION_DAYS', () => {
    it('should be defined', () => {
      expect(DAILY_READING_RETENTION_DAYS).toBeDefined();
    });

    it('should have retention policy for all user plans', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBeDefined();
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.FREE]).toBeDefined();
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBeDefined();
    });

    it('should set ANONYMOUS users to 1 day retention', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBe(1);
    });

    it('should set FREE users to 30 days retention', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.FREE]).toBe(30);
    });

    it('should set PREMIUM users to 365 days retention', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBe(365);
    });

    it('should only contain entries for the three defined user plans', () => {
      const keys = Object.keys(DAILY_READING_RETENTION_DAYS);
      expect(keys).toHaveLength(3);
      expect(keys).toContain(UserPlan.ANONYMOUS);
      expect(keys).toContain(UserPlan.FREE);
      expect(keys).toContain(UserPlan.PREMIUM);
    });

    it('should have numeric values for all plans', () => {
      Object.values(DAILY_READING_RETENTION_DAYS).forEach((days) => {
        expect(typeof days).toBe('number');
        expect(days).toBeGreaterThanOrEqual(0);
      });
    });
  });

  describe('Business Rules Validation', () => {
    it('should have ANONYMOUS users with shortest retention for readings', () => {
      expect(READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBeLessThan(
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBeLessThan(
        READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
    });

    it('should have PREMIUM users with longest retention for readings', () => {
      expect(READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBeGreaterThan(
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBeGreaterThan(
        READING_RETENTION_DAYS[UserPlan.ANONYMOUS],
      );
    });

    it('should have ANONYMOUS users with shortest retention for daily readings', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBeLessThan(
        DAILY_READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.ANONYMOUS]).toBeLessThan(
        DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
    });

    it('should have PREMIUM users with longest retention for daily readings', () => {
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBeGreaterThan(
        DAILY_READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBeGreaterThan(
        DAILY_READING_RETENTION_DAYS[UserPlan.ANONYMOUS],
      );
    });

    it('should have same retention days for FREE and PREMIUM users on both reading types', () => {
      expect(READING_RETENTION_DAYS[UserPlan.FREE]).toBe(
        DAILY_READING_RETENTION_DAYS[UserPlan.FREE],
      );
      expect(READING_RETENTION_DAYS[UserPlan.PREMIUM]).toBe(
        DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
    });
  });
});
