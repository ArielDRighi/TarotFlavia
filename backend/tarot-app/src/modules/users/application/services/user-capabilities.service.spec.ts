import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserCapabilitiesService } from './user-capabilities.service';
import { UsersService } from '../../users.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { AnonymousTrackingService } from '../../../usage-limits/services/anonymous-tracking.service';
import { PlanConfigService } from '../../../plan-config/plan-config.service';
import { DailyReading } from '../../../tarot/daily-reading/entities/daily-reading.entity';
import { TarotReading } from '../../../tarot/readings/entities/tarot-reading.entity';
import { UserPlanType } from '../dto/user-capabilities.dto';
import { UserPlan } from '../../entities/user.entity';

describe('UserCapabilitiesService', () => {
  let service: UserCapabilitiesService;
  let usersService: jest.Mocked<UsersService>;
  let usageLimitsService: jest.Mocked<UsageLimitsService>;
  let _anonymousTrackingService: jest.Mocked<AnonymousTrackingService>;
  let planConfigService: jest.Mocked<PlanConfigService>;
  let dailyReadingRepository: jest.Mocked<Repository<DailyReading>>;
  let tarotReadingRepository: jest.Mocked<Repository<TarotReading>>;

  // Mock for createQueryBuilder chain
  let mockQueryBuilder: {
    where: jest.Mock;
    andWhere: jest.Mock;
    getOne: jest.Mock;
  };

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
    // Setup mock query builder chain
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      getOne: jest.fn().mockResolvedValue(null),
    };

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
            getUsage: jest.fn().mockResolvedValue(0),
          },
        },
        {
          provide: AnonymousTrackingService,
          useValue: {
            canAccessLifetime: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: PlanConfigService,
          useValue: {
            findByPlanType: jest.fn(),
            getPendulumLimit: jest.fn().mockResolvedValue({
              limit: 1,
              period: 'lifetime' as const,
            }),
          },
        },
        {
          provide: getRepositoryToken(DailyReading),
          useValue: {
            findOne: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
          },
        },
        {
          provide: getRepositoryToken(TarotReading),
          useValue: {
            count: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UserCapabilitiesService>(UserCapabilitiesService);
    usersService = module.get(UsersService);
    usageLimitsService = module.get(UsageLimitsService);
    _anonymousTrackingService = module.get(AnonymousTrackingService);
    planConfigService = module.get(PlanConfigService);
    dailyReadingRepository = module.get(getRepositoryToken(DailyReading));
    tarotReadingRepository = module.get(getRepositoryToken(TarotReading));
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
          pendulum: {
            used: 0,
            limit: 1,
            canUse: true,
            resetAt: null,
            period: 'lifetime',
          },
        });

        // Verify resetAt is a valid ISO date
        expect(() => new Date(result.dailyCard.resetAt)).not.toThrow();
      });

      it('should check anonymous usage via fingerprint when fingerprint is provided', async () => {
        const fingerprint = 'abc123def456';

        // Mock: anonymous user has already used daily card (reading exists)
        // BUG-CAP-001: Now uses createQueryBuilder instead of findOne
        mockQueryBuilder.getOne.mockResolvedValue({
          id: 1,
          anonymousFingerprint: fingerprint,
          readingDate: new Date(),
        } as DailyReading);

        const result = await service.getCapabilities(null, fingerprint);

        expect(dailyReadingRepository.createQueryBuilder).toHaveBeenCalledWith(
          'daily_reading',
        );
        expect(result.dailyCard.used).toBe(1);
        expect(result.dailyCard.canUse).toBe(false);
        expect(result.canCreateDailyReading).toBe(false);
      });

      it('should allow daily card if anonymous user has not used it', async () => {
        const fingerprint = 'abc123def456';

        // Mock: anonymous user has NOT used daily card (no reading found)
        mockQueryBuilder.getOne.mockResolvedValue(null);

        const result = await service.getCapabilities(null, fingerprint);

        expect(result.dailyCard.used).toBe(0);
        expect(result.dailyCard.canUse).toBe(true);
        expect(result.canCreateDailyReading).toBe(true);
      });

      it('should not call user services when userId is null', async () => {
        mockQueryBuilder.getOne.mockResolvedValue(null);

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
        planConfigService.getPendulumLimit.mockResolvedValue({
          limit: 3,
          period: 'monthly',
        });
        // No daily reading found (hasn't used daily card)
        // BUG-CAP-001: Now uses createQueryBuilder
        mockQueryBuilder.getOne.mockResolvedValue(null);
        // No tarot readings used
        tarotReadingRepository.count.mockResolvedValue(0);

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
          pendulum: {
            used: 0,
            limit: 3,
            canUse: true,
            resetAt: expect.any(String),
            period: 'monthly',
          },
        });

        expect(usersService.findById).toHaveBeenCalledWith(1);
        expect(planConfigService.findByPlanType).toHaveBeenCalledWith(
          UserPlan.FREE,
        );
        // Should check daily_reading table using createQueryBuilder
        expect(dailyReadingRepository.createQueryBuilder).toHaveBeenCalledWith(
          'daily_reading',
        );
        // Should check tarot_reading table (not usageLimitsService)
        expect(tarotReadingRepository.count).toHaveBeenCalled();
      });

      it('should return canUse: false when daily card limit is reached', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        // Daily reading exists (already used today)
        // BUG-CAP-001: Now uses createQueryBuilder
        mockQueryBuilder.getOne.mockResolvedValue({
          id: 1,
          userId: 1,
          readingDate: new Date(),
        } as DailyReading);
        tarotReadingRepository.count.mockResolvedValue(0);

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
        mockQueryBuilder.getOne.mockResolvedValue(null);
        // Tarot reading used once (limit = 1)
        tarotReadingRepository.count.mockResolvedValue(1);

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
        // BUG-CAP-001: Now uses createQueryBuilder
        mockQueryBuilder.getOne.mockResolvedValue({
          id: 1,
          userId: 1,
          readingDate: new Date(),
        } as DailyReading);
        tarotReadingRepository.count.mockResolvedValue(0);

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
        planConfigService.getPendulumLimit.mockResolvedValue({
          limit: 1,
          period: 'daily',
        });
        // Premium user has used daily card multiple times (but unlimited)
        // BUG-CAP-001: Now uses createQueryBuilder
        mockQueryBuilder.getOne.mockResolvedValue({
          id: 5,
          userId: 1,
          readingDate: new Date(),
        } as DailyReading);
        tarotReadingRepository.count.mockResolvedValue(1);

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
          pendulum: {
            used: 0,
            limit: 1,
            canUse: true,
            resetAt: expect.any(String),
            period: 'daily',
          },
        });
      });

      it('should handle premium user reaching limited tarot readings', async () => {
        usersService.findById.mockResolvedValue(premiumUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          premiumPlanConfig as any,
        );
        mockQueryBuilder.getOne.mockResolvedValue(null);
        tarotReadingRepository.count.mockResolvedValue(3); // Limit reached

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

    describe('Daily Card Date Comparison (BUG-CAP-001)', () => {
      it('should allow daily card creation when last reading was yesterday', async () => {
        // This test verifies the fix for BUG-CAP-001:
        // User has a daily reading from YESTERDAY, should be able to create TODAY
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );

        // Simulate: no reading found for today (yesterday's reading should NOT match)
        // The createQueryBuilder with string date comparison should return null
        mockQueryBuilder.getOne.mockResolvedValue(null);
        tarotReadingRepository.count.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        // User should be able to create daily reading
        expect(result.canCreateDailyReading).toBe(true);
        expect(result.dailyCard.canUse).toBe(true);
        expect(result.dailyCard.used).toBe(0);
      });

      it('should use createQueryBuilder with string date comparison for DATE column', async () => {
        // This test ensures the query uses createQueryBuilder with string comparison
        // The fix uses getTodayUTCDateString() format: 'YYYY-MM-DD'
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );
        mockQueryBuilder.getOne.mockResolvedValue(null);
        tarotReadingRepository.count.mockResolvedValue(0);

        await service.getCapabilities(1);

        // Verify createQueryBuilder was called instead of findOne
        expect(dailyReadingRepository.createQueryBuilder).toHaveBeenCalledWith(
          'daily_reading',
        );
        // Verify the query chain was called correctly
        expect(mockQueryBuilder.where).toHaveBeenCalledWith(
          'daily_reading.user_id = :userId',
          { userId: 1 },
        );
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'daily_reading.reading_date = :date',
          expect.objectContaining({ date: expect.any(String) }),
        );
        expect(mockQueryBuilder.getOne).toHaveBeenCalled();
      });

      it('should block daily card creation when reading exists for today', async () => {
        usersService.findById.mockResolvedValue(mockUser as any);
        planConfigService.findByPlanType.mockResolvedValue(
          mockPlanConfig as any,
        );

        // Today's reading exists
        mockQueryBuilder.getOne.mockResolvedValue({
          id: 1,
          userId: 1,
          readingDate: new Date(), // Today
        } as DailyReading);
        tarotReadingRepository.count.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        expect(result.canCreateDailyReading).toBe(false);
        expect(result.dailyCard.canUse).toBe(false);
        expect(result.dailyCard.used).toBe(1);
      });
    });

    describe('resetAt calculation', () => {
      it('should return next midnight UTC', async () => {
        // No fingerprint provided, so no query is made
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
        mockQueryBuilder.getOne.mockResolvedValue(null);
        tarotReadingRepository.count.mockResolvedValue(0);

        const result = await service.getCapabilities(1);

        // Both features should have the same reset time
        expect(result.dailyCard.resetAt).toBe(result.tarotReadings.resetAt);
      });
    });
  });
});
