import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCapabilitiesService } from './user-capabilities.service';
import { UsersService } from '../../users.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { PlanConfigService } from '../../../plan-config/plan-config.service';
import { DailyReading } from '../../../tarot/daily-reading/entities/daily-reading.entity';
import { UserPlanType } from '../dto/user-capabilities.dto';
import { UserPlan } from '../../entities/user.entity';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';

describe('UserCapabilitiesService', () => {
  let service: UserCapabilitiesService;
  let usersService: jest.Mocked<UsersService>;
  let usageLimitsService: jest.Mocked<UsageLimitsService>;
  let planConfigService: jest.Mocked<PlanConfigService>;
  let dailyReadingRepository: jest.Mocked<Repository<DailyReading>>;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    plan: UserPlan.FREE,
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlanConfig = {
    id: 1,
    planType: UserPlan.FREE,
    dailyCardLimit: 1,
    tarotReadingsLimit: 1,
    oracleQueriesLimit: 0,
    interpretationRegenerationsLimit: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserCapabilitiesService,
        {
          provide: UsersService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: UsageLimitsService,
          useValue: {
            getUsage: jest.fn(),
          },
        },
        {
          provide: PlanConfigService,
          useValue: {
            findByPlanType: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(DailyReading),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserCapabilitiesService>(UserCapabilitiesService);
    usersService = module.get(UsersService);
    usageLimitsService = module.get(UsageLimitsService);
    planConfigService = module.get(PlanConfigService);
    dailyReadingRepository = module.get(getRepositoryToken(DailyReading));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCapabilities', () => {
    describe('Anonymous User', () => {
      it('should return anonymous capabilities when userId is null and no fingerprint', async () => {
        // No fingerprint means we can't track usage, so return default (can create)
        const result = await service.getCapabilities(null, null);

        expect(result).toEqual({
          dailyCard: {
            used: 0,
            limit: 1,
            canUse: true,
            resetAt: expect.any(String),
          },
          tarotReadings: {
            used: 0,
            limit: 0,
            canUse: false,
            resetAt: expect.any(String),
          },
          canCreateDailyReading: true,
          canCreateTarotReading: false,
          canUseAI: false,
          canUseCustomQuestions: false,
          canUseAdvancedSpreads: false,
          plan: UserPlanType.ANONYMOUS,
          isAuthenticated: false,
        });

        // Verify resetAt is a valid ISO date
        expect(() => new Date(result.dailyCard.resetAt)).not.toThrow();
      });

      it('should check anonymous usage via fingerprint when fingerprint is provided', async () => {
        const fingerprint = 'abc123def456';

        // Mock: anonymous user has already used daily card (reading exists)
        dailyReadingRepository.findOne.mockResolvedValue({
          id: 1,
          anonymousFingerprint: fingerprint,
          readingDate: new Date(),
        } as DailyReading);

        const result = await service.getCapabilities(null, fingerprint);

        expect(dailyReadingRepository.findOne).toHaveBeenCalled();
        expect(result.dailyCard.used).toBe(1);
        expect(result.dailyCard.canUse).toBe(false);
        expect(result.canCreateDailyReading).toBe(false);
      });

      it('should allow daily card if anonymous user has not used it', async () => {
        const fingerprint = 'abc123def456';

        // Mock: anonymous user has NOT used daily card (no reading found)
        dailyReadingRepository.findOne.mockResolvedValue(null);

        const result = await service.getCapabilities(null, fingerprint);

        expect(result.dailyCard.used).toBe(0);
        expect(result.dailyCard.canUse).toBe(true);
        expect(result.canCreateDailyReading).toBe(true);
      });

      it('should not call user services when userId is null', async () => {
        dailyReadingRepository.findOne.mockResolvedValue(null);

        await service.getCapabilities(null, 'fingerprint123');

        expect(usersService.findById).not.toHaveBeenCalled();
        expect(usageLimitsService.getUsage).not.toHaveBeenCalled();
        expect(planConfigService.findByPlanType).not.toHaveBeenCalled();
      });
    });

    describe('FREE User', () => {
      it('should return capabilities for FREE user with no usage', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        // No daily reading found (hasn't used daily card)
        dailyReadingRepository.findOne.mockResolvedValue(null);
        // No tarot readings used
        usageLimitsService.getUsage.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        expect(result).toEqual({
          dailyCard: {
            used: 0,
            limit: 1,
            canUse: true,
            resetAt: expect.any(String),
          },
          tarotReadings: {
            used: 0,
            limit: 1,
            canUse: true,
            resetAt: expect.any(String),
          },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: false,
          canUseCustomQuestions: false,
          canUseAdvancedSpreads: false,
          plan: UserPlanType.FREE,
          isAuthenticated: true,
        });

        expect(usersService.findById).toHaveBeenCalledWith(1);
        expect(planConfigService.findByPlanType).toHaveBeenCalledWith(
          UserPlan.FREE,
        );
        // Should check daily_reading table
        expect(dailyReadingRepository.findOne).toHaveBeenCalled();
        // Should check tarot readings from usage_limits
        expect(usageLimitsService.getUsage).toHaveBeenCalledWith(
          1,
          UsageFeature.TAROT_READING,
        );
      });

      it('should return canUse: false when daily card limit is reached', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        // Daily reading exists (already used today)
        dailyReadingRepository.findOne.mockResolvedValue({
          id: 1,
          userId: 1,
          readingDate: new Date(),
        } as DailyReading);
        usageLimitsService.getUsage.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        expect(result.dailyCard).toEqual({
          used: 1,
          limit: 1,
          canUse: false,
          resetAt: expect.any(String),
        });
        expect(result.canCreateDailyReading).toBe(false);
      });

      it('should return canUse: false when tarot reading limit is reached', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        dailyReadingRepository.findOne.mockResolvedValue(null);
        // Tarot reading used once (limit = 1)
        usageLimitsService.getUsage.mockResolvedValue(1);

        const result = await service.getCapabilities(1);

        expect(result.tarotReadings).toEqual({
          used: 1,
          limit: 1,
          canUse: false,
          resetAt: expect.any(String),
        });
        expect(result.canCreateTarotReading).toBe(false);
      });

      it('should return canUse: false when usage exceeds limit', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        // Edge case: user has TWO daily readings somehow (shouldn't happen but test edge case)
        // Since we query daily_reading directly, we can only get 0 or 1
        // So this test is for when daily reading exists
        dailyReadingRepository.findOne.mockResolvedValue({
          id: 1,
          userId: 1,
          readingDate: new Date(),
        } as DailyReading);
        usageLimitsService.getUsage.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        expect(result.dailyCard).toEqual({
          used: 1,
          limit: 1,
          canUse: false,
          resetAt: expect.any(String),
        });
        expect(result.canCreateDailyReading).toBe(false);
      });
    });

    describe('PREMIUM User', () => {
      const premiumUser = {
        ...mockUser,
        plan: UserPlan.PREMIUM,
      };

      const premiumPlanConfig = {
        id: 3,
        planType: UserPlan.PREMIUM,
        dailyCardLimit: -1, // unlimited
        tarotReadingsLimit: 3,
        oracleQueriesLimit: -1,
        interpretationRegenerationsLimit: -1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      it('should return capabilities for PREMIUM user with unlimited daily card', async () => {
        usersService.findById.mockResolvedValue(premiumUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          premiumPlanConfig as any,
        );
        // Premium user has used daily card multiple times (but unlimited)
        dailyReadingRepository.findOne.mockResolvedValue({
          id: 5,
          userId: 1,
          readingDate: new Date(),
        } as DailyReading);
        usageLimitsService.getUsage.mockResolvedValue(1);

        const result = await service.getCapabilities(1);

        expect(result).toEqual({
          dailyCard: {
            used: 1, // Has one reading today
            limit: 999999, // unlimited represented as 999999
            canUse: true,
            resetAt: expect.any(String),
          },
          tarotReadings: {
            used: 1,
            limit: 3,
            canUse: true,
            resetAt: expect.any(String),
          },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          plan: UserPlanType.PREMIUM,
          isAuthenticated: true,
        });
      });

      it('should handle premium user reaching limited tarot readings', async () => {
        usersService.findById.mockResolvedValue(premiumUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          premiumPlanConfig as any,
        );
        dailyReadingRepository.findOne.mockResolvedValue(null);
        usageLimitsService.getUsage.mockResolvedValue(3); // Limit reached

        const result = await service.getCapabilities(1);

        expect(result.tarotReadings).toEqual({
          used: 3,
          limit: 3,
          canUse: false,
          resetAt: expect.any(String),
        });
        expect(result.canCreateTarotReading).toBe(false);
        // But still has premium features
        expect(result.canUseAI).toBe(true);
        expect(result.canUseCustomQuestions).toBe(true);
        expect(result.canUseAdvancedSpreads).toBe(true);
      });
    });

    describe('Edge Cases', () => {
      it('should throw error if user not found', async () => {
        usersService.findById.mockResolvedValue(null);

        await expect(service.getCapabilities(999)).rejects.toThrow();
      });

      it('should throw error if plan config not found', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockRejectedValue(
          new Error('Plan not found'),
        );

        await expect(service.getCapabilities(1)).rejects.toThrow(
          'Plan not found',
        );
      });
    });

    describe('resetAt calculation', () => {
      it('should return next midnight UTC', async () => {
        dailyReadingRepository.findOne.mockResolvedValue(null);

        const result = await service.getCapabilities(null, null);
        const resetDate = new Date(result.dailyCard.resetAt);

        // Should be a valid date
        expect(resetDate.toString()).not.toBe('Invalid Date');

        // Should be midnight UTC
        expect(resetDate.getUTCHours()).toBe(0);
        expect(resetDate.getUTCMinutes()).toBe(0);
        expect(resetDate.getUTCSeconds()).toBe(0);
        expect(resetDate.getUTCMilliseconds()).toBe(0);

        // Should be in the future (tomorrow)
        const now = new Date();
        expect(resetDate.getTime()).toBeGreaterThan(now.getTime());
      });

      it('should use same resetAt for all features', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        dailyReadingRepository.findOne.mockResolvedValue(null);
        usageLimitsService.getUsage.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        // Both features should have the same reset time
        expect(result.dailyCard.resetAt).toBe(result.tarotReadings.resetAt);
      });
    });
  });
});
