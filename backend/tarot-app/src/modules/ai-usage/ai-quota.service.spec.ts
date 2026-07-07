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
  let mockEmailService: {
    sendQuotaWarningEmail: jest.Mock;
    sendQuotaLimitReachedEmail: jest.Mock;
  };

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

    mockEmailService = {
      sendQuotaWarningEmail: jest.fn(),
      sendQuotaLimitReachedEmail: jest.fn(),
    };

    const mockConfigGet = jest.fn((key: string) => {
      if (key === 'AI_QUOTA_FREE_MONTHLY') return 0;
      if (key === 'AI_QUOTA_PREMIUM_MONTHLY') return -1;
      if (key === 'FRONTEND_URL') return 'http://localhost:3001';
      return undefined;
    });
    const mockConfigService = {
      get: mockConfigGet,
      getOrThrow: mockConfigGet,
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
    it('should return false for FREE user (sin IA: cuota 0)', async () => {
      // T-FBK-006: Free NO consume IA. Aún sin uso previo, no hay cuota disponible.
      const user = createMockUser({ aiRequestsUsedMonth: 0 });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.checkMonthlyQuota(1);

      expect(result).toBe(false);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
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
    it('should return zero remaining quota for FREE user without division-by-zero', async () => {
      // T-FBK-006: Free tiene cuota 0. El porcentaje debe ser 0 (no NaN/Infinity).
      const user = createMockUser({ aiRequestsUsedMonth: 0 });
      userRepository.findOne.mockResolvedValue(user);

      const result = await service.getRemainingQuota(1);

      expect(result.quotaLimit).toBe(0);
      expect(result.requestsUsed).toBe(0);
      expect(result.requestsRemaining).toBe(0);
      expect(result.percentageUsed).toBe(0);
      expect(Number.isFinite(result.percentageUsed)).toBe(true);
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

    it('should NOT send warning email for FREE plan (cuota 0, sin IA)', async () => {
      // T-FBK-006: Free tiene cuota 0. trackMonthlyUsage no debe disparar avisos
      // ni dividir por cero (Free nunca llega acá porque el guard lo bloquea antes,
      // pero se blinda defensivamente).
      const user = createMockUser({
        aiRequestsUsedMonth: 0,
        quotaWarningSent: false,
      });
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      expect(userRepository.save).not.toHaveBeenCalled();
      expect(mockEmailService.sendQuotaWarningEmail).not.toHaveBeenCalled();
    });

    it('should NOT send limit reached email for FREE plan (cuota 0, sin IA)', async () => {
      const user = createMockUser({
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: 0,
        quotaWarningSent: false,
      });
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      expect(
        mockEmailService.sendQuotaLimitReachedEmail,
      ).not.toHaveBeenCalled();
    });

    it('should NOT send limit reached email when PREMIUM user reaches high usage', async () => {
      const user = createMockUser({
        plan: UserPlan.PREMIUM,
        aiRequestsUsedMonth: 10000,
      });
      userRepository.findOne.mockResolvedValue(user);

      await service.trackMonthlyUsage(1, 1, 1500, 0.005, 'groq');

      expect(
        mockEmailService.sendQuotaLimitReachedEmail,
      ).not.toHaveBeenCalled();
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
