import { validate } from 'class-validator';
import {
  FeatureLimitDto,
  PendulumLimitDto,
  UserCapabilitiesDto,
  UserPlanType,
} from './user-capabilities.dto';

describe('FeatureLimitDto', () => {
  describe('validation', () => {
    it('should pass validation with valid data', async () => {
      const dto = new FeatureLimitDto();
      dto.used = 1;
      dto.limit = 3;
      dto.canUse = true;
      dto.resetAt = '2026-01-09T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when limit is 999999 (unlimited)', async () => {
      const dto = new FeatureLimitDto();
      dto.used = 0;
      dto.limit = 999999;
      dto.canUse = true;
      dto.resetAt = '2026-01-09T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation when canUse is false (limit reached)', async () => {
      const dto = new FeatureLimitDto();
      dto.used = 3;
      dto.limit = 3;
      dto.canUse = false;
      dto.resetAt = '2026-01-09T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with negative used value', async () => {
      const dto = new FeatureLimitDto();
      dto.used = -1;
      dto.limit = 3;
      dto.canUse = true;
      dto.resetAt = '2026-01-09T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'used')).toBeTruthy();
    });

    it('should fail validation with negative limit value', async () => {
      const dto = new FeatureLimitDto();
      dto.used = 0;
      dto.limit = -1;
      dto.canUse = true;
      dto.resetAt = '2026-01-09T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'limit')).toBeTruthy();
    });

    it('should fail validation with invalid resetAt format', async () => {
      const dto = new FeatureLimitDto();
      dto.used = 0;
      dto.limit = 3;
      dto.canUse = true;
      Object.assign(dto, { resetAt: 'invalid-date' });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'resetAt')).toBeTruthy();
    });

    it('should fail validation with non-boolean canUse', async () => {
      const dto = new FeatureLimitDto();
      dto.used = 0;
      dto.limit = 3;
      Object.assign(dto, { canUse: 'true' });
      dto.resetAt = '2026-01-09T00:00:00.000Z';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'canUse')).toBeTruthy();
    });
  });
});

describe('UserCapabilitiesDto', () => {
  describe('validation', () => {
    it('should pass validation with valid authenticated free user data', async () => {
      const dailyCard = new FeatureLimitDto();
      dailyCard.used = 0;
      dailyCard.limit = 1;
      dailyCard.canUse = true;
      dailyCard.resetAt = '2026-01-09T00:00:00.000Z';

      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 0;
      tarotReadings.limit = 1;
      tarotReadings.canUse = true;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const pendulum = new PendulumLimitDto();
      pendulum.used = 0;
      pendulum.limit = 3;
      pendulum.canUse = true;
      pendulum.resetAt = '2026-02-01T00:00:00.000Z';
      pendulum.period = 'monthly';

      const dto = new UserCapabilitiesDto();
      dto.dailyCard = dailyCard;
      dto.tarotReadings = tarotReadings;
      dto.pendulum = pendulum;
      dto.canCreateDailyReading = true;
      dto.canCreateTarotReading = true;
      dto.canUseAI = false;
      dto.canUseCustomQuestions = false;
      dto.canUseAdvancedSpreads = false;
      dto.canUseFullDeck = false;
      dto.plan = UserPlanType.FREE;
      dto.isAuthenticated = true;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid premium user data', async () => {
      const dailyCard = new FeatureLimitDto();
      dailyCard.used = 1;
      dailyCard.limit = 1;
      dailyCard.canUse = false;
      dailyCard.resetAt = '2026-01-09T00:00:00.000Z';

      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 2;
      tarotReadings.limit = 3;
      tarotReadings.canUse = true;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const pendulum = new PendulumLimitDto();
      pendulum.used = 0;
      pendulum.limit = 1;
      pendulum.canUse = true;
      pendulum.resetAt = '2026-01-10T00:00:00.000Z';
      pendulum.period = 'daily';

      const dto = new UserCapabilitiesDto();
      dto.dailyCard = dailyCard;
      dto.tarotReadings = tarotReadings;
      dto.pendulum = pendulum;
      dto.canCreateDailyReading = false;
      dto.canCreateTarotReading = true;
      dto.canUseAI = true;
      dto.canUseCustomQuestions = true;
      dto.canUseAdvancedSpreads = true;
      dto.canUseFullDeck = true;
      dto.plan = UserPlanType.PREMIUM;
      dto.isAuthenticated = true;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should pass validation with valid anonymous user data', async () => {
      const dailyCard = new FeatureLimitDto();
      dailyCard.used = 0;
      dailyCard.limit = 1;
      dailyCard.canUse = true;
      dailyCard.resetAt = '2026-01-09T00:00:00.000Z';

      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 0;
      tarotReadings.limit = 0;
      tarotReadings.canUse = false;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const pendulum = new PendulumLimitDto();
      pendulum.used = 0;
      pendulum.limit = 1;
      pendulum.canUse = true;
      pendulum.resetAt = null;
      pendulum.period = 'lifetime';

      const dto = new UserCapabilitiesDto();
      dto.dailyCard = dailyCard;
      dto.tarotReadings = tarotReadings;
      dto.pendulum = pendulum;
      dto.canCreateDailyReading = true;
      dto.canCreateTarotReading = false;
      dto.canUseAI = false;
      dto.canUseCustomQuestions = false;
      dto.canUseAdvancedSpreads = false;
      dto.canUseFullDeck = false;
      dto.plan = UserPlanType.ANONYMOUS;
      dto.isAuthenticated = false;

      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    });

    it('should fail validation with invalid plan value', async () => {
      const dailyCard = new FeatureLimitDto();
      dailyCard.used = 0;
      dailyCard.limit = 1;
      dailyCard.canUse = true;
      dailyCard.resetAt = '2026-01-09T00:00:00.000Z';

      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 0;
      tarotReadings.limit = 1;
      tarotReadings.canUse = true;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const dto = new UserCapabilitiesDto();
      dto.dailyCard = dailyCard;
      dto.tarotReadings = tarotReadings;
      dto.canCreateDailyReading = true;
      dto.canCreateTarotReading = true;
      dto.canUseAI = false;
      dto.canUseCustomQuestions = false;
      dto.canUseAdvancedSpreads = false;
      Object.assign(dto, { plan: 'invalid-plan' });
      dto.isAuthenticated = true;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'plan')).toBeTruthy();
    });

    it('should fail validation with non-boolean isAuthenticated', async () => {
      const dailyCard = new FeatureLimitDto();
      dailyCard.used = 0;
      dailyCard.limit = 1;
      dailyCard.canUse = true;
      dailyCard.resetAt = '2026-01-09T00:00:00.000Z';

      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 0;
      tarotReadings.limit = 1;
      tarotReadings.canUse = true;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const dto = new UserCapabilitiesDto();
      dto.dailyCard = dailyCard;
      dto.tarotReadings = tarotReadings;
      dto.canCreateDailyReading = true;
      dto.canCreateTarotReading = true;
      dto.canUseAI = false;
      dto.canUseCustomQuestions = false;
      dto.canUseAdvancedSpreads = false;
      dto.plan = UserPlanType.FREE;
      Object.assign(dto, { isAuthenticated: 'true' });

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some((e) => e.property === 'isAuthenticated')).toBeTruthy();
    });

    it('should fail validation with invalid dailyCard nested object', async () => {
      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 0;
      tarotReadings.limit = 1;
      tarotReadings.canUse = true;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const dto = new UserCapabilitiesDto();
      Object.assign(dto, { dailyCard: { invalid: 'data' } });
      dto.tarotReadings = tarotReadings;
      dto.canCreateDailyReading = true;
      dto.canCreateTarotReading = true;
      dto.canUseAI = false;
      dto.canUseCustomQuestions = false;
      dto.canUseAdvancedSpreads = false;
      dto.plan = UserPlanType.FREE;
      dto.isAuthenticated = true;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('should fail validation with non-boolean capability flags', async () => {
      const dailyCard = new FeatureLimitDto();
      dailyCard.used = 0;
      dailyCard.limit = 1;
      dailyCard.canUse = true;
      dailyCard.resetAt = '2026-01-09T00:00:00.000Z';

      const tarotReadings = new FeatureLimitDto();
      tarotReadings.used = 0;
      tarotReadings.limit = 1;
      tarotReadings.canUse = true;
      tarotReadings.resetAt = '2026-01-09T00:00:00.000Z';

      const dto = new UserCapabilitiesDto();
      dto.dailyCard = dailyCard;
      dto.tarotReadings = tarotReadings;
      Object.assign(dto, { canCreateDailyReading: 'true' });
      dto.canCreateTarotReading = true;
      dto.canUseAI = false;
      dto.canUseCustomQuestions = false;
      dto.canUseAdvancedSpreads = false;
      dto.plan = UserPlanType.FREE;
      dto.isAuthenticated = true;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(
        errors.some((e) => e.property === 'canCreateDailyReading'),
      ).toBeTruthy();
    });
  });
});
