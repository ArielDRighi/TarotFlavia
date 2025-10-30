import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UsageLimitsService } from './usage-limits.service';
import { UsageLimit, UsageFeature } from './entities/usage-limit.entity';
import { UsersService } from '../users/users.service';
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
      ],
    }).compile();

    service = module.get<UsageLimitsService>(UsageLimitsService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('checkLimit', () => {
    it('should return true when FREE user has not exceeded daily reading limit', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 2, // Less than 3 (FREE_DAILY_READINGS)
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
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 3, // Reached limit (FREE_DAILY_READINGS)
      });

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(false);
    });

    it('should return true when PREMIUM user always has unlimited access', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);

      const result = await service.checkLimit(2, UsageFeature.TAROT_READING);

      expect(result).toBe(true);
      expect(mockUsageLimitRepository.findOne).not.toHaveBeenCalled();
    });

    it('should return true when FREE user has no usage record yet', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
        subscriptionStatus: undefined,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockUsageLimitRepository.findOne.mockResolvedValue(null);

      const result = await service.checkLimit(1, UsageFeature.TAROT_READING);

      expect(result).toBe(true);
    });
  });

  describe('incrementUsage', () => {
    it('should increment usage count correctly for existing record', async () => {
      const existingRecord = {
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 2,
        date: new Date('2023-10-30'),
      };

      mockUsageLimitRepository.findOne.mockResolvedValue(existingRecord);
      mockUsageLimitRepository.save.mockResolvedValue({
        ...existingRecord,
        count: 3,
      });

      const result = await service.incrementUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result.count).toBe(3);
      expect(mockUsageLimitRepository.save).toHaveBeenCalledWith({
        ...existingRecord,
        count: 3,
      });
    });

    it('should create new record when no existing record found', async () => {
      mockUsageLimitRepository.findOne.mockResolvedValue(null);
      mockUsageLimitRepository.create.mockReturnValue({
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: new Date(),
      });
      mockUsageLimitRepository.save.mockResolvedValue({
        id: 1,
        userId: 1,
        feature: UsageFeature.TAROT_READING,
        count: 1,
        date: new Date(),
      });

      const result = await service.incrementUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result.count).toBe(1);
      expect(mockUsageLimitRepository.create).toHaveBeenCalled();
      expect(mockUsageLimitRepository.save).toHaveBeenCalled();
    });
  });

  describe('getRemainingUsage', () => {
    it('should return correct remaining usage for FREE user', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockUsageLimitRepository.findOne.mockResolvedValue({
        count: 2,
      });

      const result = await service.getRemainingUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result).toBe(1); // 3 - 2 = 1
    });

    it('should return -1 (unlimited) for PREMIUM user', async () => {
      const premiumUser: Partial<User> = {
        id: 2,
        plan: UserPlan.PREMIUM,
        subscriptionStatus: SubscriptionStatus.ACTIVE,
      };

      mockUsersService.findById.mockResolvedValue(premiumUser);

      const result = await service.getRemainingUsage(
        2,
        UsageFeature.TAROT_READING,
      );

      expect(result).toBe(-1);
    });

    it('should return full limit when no usage record exists', async () => {
      const freeUser: Partial<User> = {
        id: 1,
        plan: UserPlan.FREE,
      };

      mockUsersService.findById.mockResolvedValue(freeUser);
      mockUsageLimitRepository.findOne.mockResolvedValue(null);

      const result = await service.getRemainingUsage(
        1,
        UsageFeature.TAROT_READING,
      );

      expect(result).toBe(3); // FREE_DAILY_READINGS
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
});
