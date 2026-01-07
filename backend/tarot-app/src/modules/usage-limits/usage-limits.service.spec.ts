import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UsageLimitsService } from './usage-limits.service';
import { UsageLimit, UsageFeature } from './entities/usage-limit.entity';
import { UsersService } from '../users/users.service';
import { PlanConfigService } from '../plan-config/plan-config.service';
import {
  User,
  UserPlan,
  SubscriptionStatus,
} from '../users/entities/user.entity';

describe('UsageLimitsService', () => {
  let service: UsageLimitsService;

  const mockUsageLimitRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockUsersService = {
    findById: jest.fn(),
  };

  const mockPlanConfigService = {
    getDailyCardLimit: jest.fn(),
    getTarotReadingsLimit: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsageLimitsService,
        {
          provide: getRepositoryToken(UsageLimit),
          useValue: mockUsageLimitRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: PlanConfigService,
          useValue: mockPlanConfigService,
        },
      ],
    }).compile();

    service = module.get<UsageLimitsService>(UsageLimitsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkLimit', () => {
    it('should return true when ANONYMOUS user has not exceeded daily reading limit (1 reading)', async () => {
      const anonymousUser: Partial<User> = {
        id: 1,
        plan: UserPlan.ANONYMOUS,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(anonymousUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(1); // ANONYMOUS plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 0, // Less than 1
      });

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(true);
    });

    it('should return false when ANONYMOUS user has exceeded daily reading limit', async () => {
      const anonymousUser: Partial<User> = {
        id: 1,
        plan: UserPlan.ANONYMOUS,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(anonymousUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(1); // ANONYMOUS plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 1, // Reached limit (1 reading)
      });

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(false);
    });

    it('should return true when FREE user has not exceeded daily reading limit (2 readings)', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2); // FREE plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 1, // Less than 2
      });

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(true);
    });

    it('should return false when FREE user has exceeded daily reading limit', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2); // FREE plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 2, // Reached limit (2 readings)
      });

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(false);
    });

    it('should return true when PREMIUM user has not exceeded daily reading limit (3 readings)', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(3); // PREMIUM plan limit from DB (now limited to 3/day)
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 2, // Less than 3
      });

      const result = await service.checkLimit(2, UsageFeature.TAROT_READING);

      expect(result).toBe(true);
    });

    it('should return false when PREMIUM user has exceeded daily reading limit', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(3); // PREMIUM plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 3, // Reached limit (3 readings)
      });

      const result = await service.checkLimit(2, UsageFeature.TAROT_READING);

      expect(result).toBe(false);
    });

    it('should return true when FREE user has no usage record yet', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2); // FREE plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue(null);

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(true);
    });

    it('should return true for PREMIUM user regeneration feature (unlimited)', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);
      // INTERPRETATION_REGENERATION uses constants fallback (not in DB yet)

      const result = await service.checkLimit(
        2,
        UsageFeature.INTERPRETATION_REGENERATION,
      );

      expect(result).toBe(true);
      expect(mockUsageLimitRepository.findOne).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.checkLimit(999, UsageFeature.TAROT_READING),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.checkLimit(999, UsageFeature.TAROT_READING),
      ).rejects.toThrow('User with ID 999 not found');
    });

    it('should throw BadRequestException for invalid feature', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);

      await expect(
        service.checkLimit(1, 'INVALID_FEATURE' as UsageFeature),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('incrementUsage', () => {
    it('should atomically increment usage count for existing record', async () => {
      const mockInsertQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockUsageLimitRepository.createQueryBuilder
        .mockReturnValueOnce(mockInsertQueryBuilder)
        .mockReturnValueOnce(mockUpdateQueryBuilder);

      const todayMock = new Date();
      todayMock.setUTCHours(0, 0, 0, 0);
      const todayDateString = todayMock.toISOString().split('T')[0];

      const updatedRecord = {
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 3,
        date: todayDateString,
        createdAt: new Date(),
      };

      mockUsageLimitRepository.findOne.mockResolvedValue(updatedRecord);

      const result = await service.incrementUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result.count).toBe(3);
      expect(mockInsertQueryBuilder.orIgnore).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.update).toHaveBeenCalled();
      expect(mockUsageLimitRepository.findOne).toHaveBeenCalled();
    });

    it('should create and increment new record when no existing record found', async () => {
      const mockInsertQueryBuilder = {
        insert: jest.fn().mockReturnThis(),
        into: jest.fn().mockReturnThis(),
        values: jest.fn().mockReturnThis(),
        orIgnore: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({}),
      };

      const mockUpdateQueryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      mockUsageLimitRepository.createQueryBuilder
        .mockReturnValueOnce(mockInsertQueryBuilder)
        .mockReturnValueOnce(mockUpdateQueryBuilder);

      const todayMock = new Date();
      todayMock.setUTCHours(0, 0, 0, 0);
      const todayDateString = todayMock.toISOString().split('T')[0];

      const newRecord = {
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: todayDateString,
        createdAt: new Date(),
      };

      mockUsageLimitRepository.findOne.mockResolvedValue(newRecord);

      const result = await service.incrementUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result.count).toBe(1);
      expect(mockInsertQueryBuilder.insert).toHaveBeenCalled();
      expect(mockUpdateQueryBuilder.set).toHaveBeenCalled();
    });
  });

  describe('getRemainingUsage', () => {
    it('should return correct remaining usage for FREE user', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2); // FREE plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 1,
      });

      const result = await service.getRemainingUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result).toBe(1); // 2 - 1 = 1
    });

    it('should return correct remaining usage for PREMIUM user (limited to 3)', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(3); // PREMIUM plan limit from DB (now 3/day)
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 1,
      });

      const result = await service.getRemainingUsage(
        2,
        UsageFeature.TAROT_READING,
      );

      expect(result).toBe(2); // 3 - 1 = 2
    });

    it('should return -1 (unlimited) for PREMIUM user regeneration feature', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);
      // INTERPRETATION_REGENERATION uses constants fallback (unlimited for PREMIUM)

      const result = await service.getRemainingUsage(
        2,
        UsageFeature.INTERPRETATION_REGENERATION,
      );

      expect(result).toBe(-1); // Unlimited
    });

    it('should return full limit when no usage record exists', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2); // FREE plan limit from DB
      mockUsageLimitRepository.findOne.mockResolvedValue(null);

      const result = await service.getRemainingUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result).toBe(2); // Full FREE limit
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(
        service.getRemainingUsage(999, UsageFeature.TAROT_READING),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid feature', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);

      await expect(
        service.getRemainingUsage(1, 'INVALID_FEATURE' as UsageFeature),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('cleanOldRecords', () => {
    it('should delete records older than retention period', async () => {
      const mockQueryBuilder = {
        delete: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 10 }),
      };

      mockUsageLimitRepository.createQueryBuilder.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.cleanOldRecords();

      expect(result).toBe(10);
      expect(mockQueryBuilder.delete).toHaveBeenCalled();
      expect(mockQueryBuilder.execute).toHaveBeenCalled();
    });
  });

  describe('Daily Limit Validation (TASK-008)', () => {
    describe("Count only today's actions", () => {
      it('should count only actions from today, not yesterday', async () => {
        const freeUser: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };

        // Mock user found
        mockUsersService.findById.mockResolvedValue(freeUser);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2); // FREE plan limit

        // Mock usage record showing 1 reading today
        mockUsageLimitRepository.findOne.mockResolvedValue({
          count: 1, // Only 1 reading today (yesterday's readings don't count)
        });

        const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

        expect(result).toBe(true); // Should allow because only 1 < 2

        // Verify that findOne was called with today's date as string (YYYY-MM-DD format for PostgreSQL DATE)
        const callArgs = mockUsageLimitRepository.findOne.mock.calls[0][0];
        expect(callArgs.where.userId).toBe(1);
        expect(callArgs.where.feature).toBe(UsageFeature.TAROT_READING);
        expect(typeof callArgs.where.date).toBe('string');

        // Verify date is in 'YYYY-MM-DD' format
        const dateArg = callArgs.where.date;
        expect(dateArg).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Verify it's today's date
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const expectedDateString = today.toISOString().split('T')[0];
        expect(dateArg).toBe(expectedDateString);
      });

      it("should return remaining usage based only on today's count", async () => {
        const freeUser: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };

        mockUsersService.findById.mockResolvedValue(freeUser);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2);

        // User has 1 reading today (yesterday's 5 readings don't count)
        mockUsageLimitRepository.findOne.mockResolvedValue({
          count: 1,
        });

        const result = await service.getRemainingUsage(
          1,
          UsageFeature.TAROT_READING,
        );

        expect(result).toBe(1); // 2 - 1 = 1 remaining
      });
    });

    describe('Implicit daily reset', () => {
      it('should allow new actions after midnight UTC (implicit reset)', async () => {
        const freeUser: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };

        mockUsersService.findById.mockResolvedValue(freeUser);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2);

        // No record for today (yesterday's record doesn't matter)
        mockUsageLimitRepository.findOne.mockResolvedValue(null);

        const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

        expect(result).toBe(true); // Should allow because count is 0 today
      });

      it('should return full limit when no record exists for today', async () => {
        const freeUser: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };

        mockUsersService.findById.mockResolvedValue(freeUser);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2);
        mockUsageLimitRepository.findOne.mockResolvedValue(null);

        const result = await service.getRemainingUsage(
          1,
          UsageFeature.TAROT_READING,
        );

        expect(result).toBe(2); // Full limit available
      });
    });

    describe('Separate counters per feature', () => {
      it('should not sum different features together', async () => {
        const freeUser: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };

        mockUsersService.findById.mockResolvedValue(freeUser);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2);

        // User has 2 TAROT_READING today (at limit)
        mockUsageLimitRepository.findOne.mockResolvedValueOnce({
          count: 2,
        });

        const readingResult = await service.checkLimit(
          1,
          UsageFeature.TAROT_READING,
        );
        expect(readingResult).toBe(false); // At limit for readings

        // But ORACLE_QUERY should have separate counter
        mockUsageLimitRepository.findOne.mockResolvedValueOnce({
          count: 0, // No oracle queries today
        });

        const oracleResult = await service.checkLimit(
          1,
          UsageFeature.ORACLE_QUERY,
        );
        expect(oracleResult).toBe(true); // Should allow oracle query
      });
    });

    describe('Separate counters per user', () => {
      it('should not interfere between different users', async () => {
        const userA: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };
        const userB: Partial<User> = {
          id: 2,
          plan: UserPlan.FREE,
        };

        // User A has 2 readings (at limit)
        mockUsersService.findById.mockResolvedValueOnce(userA);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValueOnce(2);
        mockUsageLimitRepository.findOne.mockResolvedValueOnce({
          count: 2,
        });

        const resultA = await service.checkLimit(1, UsageFeature.TAROT_READING);
        expect(resultA).toBe(false);

        // User B has 1 reading (still has quota)
        mockUsersService.findById.mockResolvedValueOnce(userB);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValueOnce(2);
        mockUsageLimitRepository.findOne.mockResolvedValueOnce({
          count: 1,
        });

        const resultB = await service.checkLimit(2, UsageFeature.TAROT_READING);
        expect(resultB).toBe(true);
      });
    });

    describe('UTC date handling', () => {
      it('should use UTC timezone for date calculations', async () => {
        const freeUser: Partial<User> = {
          id: 1,
          plan: UserPlan.FREE,
        };

        mockUsersService.findById.mockResolvedValue(freeUser);
        mockPlanConfigService.getTarotReadingsLimit.mockResolvedValue(2);
        mockUsageLimitRepository.findOne.mockResolvedValue({ count: 1 });

        await service.checkLimit(1, UsageFeature.TAROT_READING);

        // Verify the date passed to repository is a UTC string in 'YYYY-MM-DD' format
        const callArgs = mockUsageLimitRepository.findOne.mock.calls[0][0];
        const dateArg = callArgs.where.date;

        // Should be a string in 'YYYY-MM-DD' format
        expect(typeof dateArg).toBe('string');
        expect(dateArg).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Should match today's date in UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const expectedDateString = today.toISOString().split('T')[0];
        expect(dateArg).toBe(expectedDateString);
      });

      it("should increment usage for today's date in UTC", async () => {
        const mockInsertQueryBuilder = {
          insert: jest.fn().mockReturnThis(),
          into: jest.fn().mockReturnThis(),
          values: jest.fn().mockReturnThis(),
          orIgnore: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({}),
        };

        const mockUpdateQueryBuilder = {
          update: jest.fn().mockReturnThis(),
          set: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          execute: jest.fn().mockResolvedValue({ affected: 1 }),
        };

        mockUsageLimitRepository.createQueryBuilder
          .mockReturnValueOnce(mockInsertQueryBuilder)
          .mockReturnValueOnce(mockUpdateQueryBuilder);

        const todayMock = new Date();
        todayMock.setUTCHours(0, 0, 0, 0);
        const todayDateString = todayMock.toISOString().split('T')[0];

        mockUsageLimitRepository.findOne.mockResolvedValue({
          id: 1,
          userId: 1,
          feature: UsageFeature.TAROT_READING,
          count: 1,
          date: todayDateString,
          createdAt: new Date(),
        });

        await service.incrementUsage(1, UsageFeature.TAROT_READING);

        // Verify insert was called with UTC date as string in 'YYYY-MM-DD' format
        const insertValues = mockInsertQueryBuilder.values.mock.calls[0][0];
        expect(typeof insertValues.date).toBe('string');
        expect(insertValues.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);

        // Verify it's today's date in UTC
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const expectedDateString = today.toISOString().split('T')[0];
        expect(insertValues.date).toBe(expectedDateString);
      });
    });
  });
});
