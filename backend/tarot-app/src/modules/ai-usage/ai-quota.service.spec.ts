import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateQueryBuilder } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { AIQuotaService } from './ai-quota.service';
import { User, UserPlan } from '../users/entities/user.entity';
import { Logger } from '@nestjs/common';
import { UserRole } from '../../common/enums/user-role.enum';
import { EmailService } from '../email/email.service';

describe('AIQuotaService', () => {
  let service: AIQuotaService;
  let userRepository: jest.Mocked<Repository<User>>;

  const createMockUser = (overrides: Partial<User> = {}): User => {
    const user = new User();
    Object.assign(user, {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed',
      plan: UserPlan.FREE,
      roles: [UserRole.CONSUMER],
      isAdmin: false,
      profilePicture: '',
      planStartedAt: new Date(),
      planExpiresAt: null,
      subscriptionStatus: null,
      stripeCustomerId: null,
      readings: [],
      lastLogin: null,
      bannedAt: null,
      banReason: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      aiRequestsUsedMonth: 0,
      aiCostUsdMonth: 0,
      aiTokensUsedMonth: 0,
      aiProviderUsed: null,
      quotaWarningSent: false,
      aiUsageResetAt: null,
      ...overrides,
    });
    return user;
  };

  beforeEach(async () => {
    const mockUpdateQueryBuilder = {
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      setParameters: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      execute: jest.fn().mockResolvedValue({ affected: 1 }),
    } as unknown as UpdateQueryBuilder<User>;

    const mockRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      createQueryBuilder: jest.fn(() => mockUpdateQueryBuilder),
    };

    const mockEmailService = {
      sendQuotaWarning: jest.fn(),
      sendQuotaLimitReached: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn((key: string) => {
        if (key === 'AI_QUOTA_FREE_MONTHLY') return 100;
        if (key === 'AI_QUOTA_PREMIUM_MONTHLY') return -1;
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIQuotaService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: EmailService,
          useValue: mockEmailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AIQuotaService>(AIQuotaService);
    userRepository = module.get(getRepositoryToken(User));

    // Suppress logger output during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkMonthlyQuota', () => {
    it('should return true when FREE user has not exceeded quota', async () => {
      const user = createMockUser({ aiRequestsUsedMonth: 50 });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.checkMonthlyQuota(1);

      expect(result).toBe(true);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should return false when FREE user has exceeded quota', async () => {
      const user = createMockUser({ aiRequestsUsedMonth: 100 });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.checkMonthlyQuota(1);

      expect(result).toBe(false);
    });

    it('should return true for PREMIUM user regardless of usage', async () => {
      const user = createMockUser({
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 1000,
      });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.checkMonthlyQuota(1);

      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.checkMonthlyQuota(999)).rejects.toThrow(
        'User with ID 999 not found',
      );
    });
  });

  describe('getRemainingQuota', () => {
    it('should return correct remaining quota for FREE user', async () => {
      const user = createMockUser({ aiRequestsUsedMonth: 30 });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getRemainingQuota(1);

      expect(result.quotaLimit).toBe(100);
      expect(result.requestsUsed).toBe(30);
      expect(result.requestsRemaining).toBe(70);
      expect(result.percentageUsed).toBe(30);
      expect(result.plan).toBe(UserPlan.FREE);
    });

    it('should return unlimited for PREMIUM user', async () => {
      const user = createMockUser({
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 500,
      });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getRemainingQuota(1);

      expect(result.quotaLimit).toBe(-1);
      expect(result.requestsRemaining).toBe(-1);
      expect(result.percentageUsed).toBe(0);
    });

    it('should include reset date in response', async () => {
      const user = createMockUser();
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getRemainingQuota(1);

      expect(result.resetDate).toBeInstanceOf(Date);
      expect(result.resetDate.getDate()).toBe(1); // First day of next month
    });
  });

  describe('trackMonthlyUsage', () => {
    it('should increment usage counters atomically with parameterized queries', async () => {
      const user = createMockUser();
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      const queryBuilder = userRepository.createQueryBuilder();
      expect(queryBuilder.update).toHaveBeenCalled();
      expect(queryBuilder.setParameters).toHaveBeenCalledWith({
        requests: 1,
        tokens: 1500,
        cost: 0.005,
      });
      expect(queryBuilder.where).toHaveBeenCalledWith('id = :id', { id: 1 });
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('should log warning for invalid AI provider', async () => {
      const user = createMockUser();
      userRepository.findOne.mockResolvedValue(user);
      const loggerSpy = jest.spyOn(service['logger'], 'warn');

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'invalid-provider');

      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Invalid AI provider "invalid-provider"'),
      );
    });

    it('should not send warning if user is PREMIUM', async () => {
      const user = createMockUser({
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 1000,
      });
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should send warning when FREE user reaches 80% quota', async () => {
      // User already has 80 requests after the atomic update (79 + 1 = 80)
      const user = createMockUser({
        aiRequestsUsedMonth: 80, // This is the value AFTER the atomic increment
        quotaWarningSent: false,
      });
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          quotaWarningSent: true,
        }),
      );
    });

    it('should not send duplicate warning', async () => {
      const user = createMockUser({
        aiRequestsUsedMonth: 85,
        quotaWarningSent: true,
      });
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      expect(userRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('resetMonthlyQuotas', () => {
    it('should reset all users counters', async () => {
      const affectedRows = 150;
      const queryBuilder = userRepository.createQueryBuilder();
      (queryBuilder.execute as jest.Mock).mockResolvedValue({
        affected: affectedRows,
      });

      await service.resetMonthlyQuotas();

      expect(queryBuilder.update).toHaveBeenCalled();
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('should set aiUsageResetAt to start of current month', async () => {
      const queryBuilder = userRepository.createQueryBuilder();

      await service.resetMonthlyQuotas();

      expect(queryBuilder.execute).toHaveBeenCalled();
    });
  });
});
