import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { AIProviderCostService } from './ai-provider-cost.service';
import { AIProviderUsage } from './entities/ai-provider-usage.entity';
import { AIProvider } from './entities/ai-usage-log.entity';
import { EmailService } from '../email/email.service';

describe('AIProviderCostService', () => {
  let service: AIProviderCostService;

  const mockRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockEmailService = {
    sendProviderCostWarningEmail: jest.fn(),
    sendProviderCostLimitReachedEmail: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'DEEPSEEK_MAX_MONTHLY_COST_USD') return 20.0;
      if (key === 'OPENAI_MAX_MONTHLY_COST_USD') return 50.0;
      if (key === 'ADMIN_EMAIL_COST_ALERTS') return 'admin@test.com';
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIProviderCostService,
        {
          provide: getRepositoryToken(AIProviderUsage),
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

    service = module.get<AIProviderCostService>(AIProviderCostService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('trackUsage', () => {
    it('should create new usage record if none exists for current month', async () => {
      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue({
        provider: AIProvider.DEEPSEEK,
        month: new Date('2025-11-01'),
        requestsCount: 1,
        tokensUsed: '1000',
        costUsd: 0.0008,
        monthlyLimitUsd: 20.0,
        limitReached: false,
        warningAt80Sent: false,
      });
      mockRepository.save.mockResolvedValue({
        id: 1,
        provider: AIProvider.DEEPSEEK,
        month: new Date('2025-11-01'),
        requestsCount: 1,
        tokensUsed: '1000',
        costUsd: 0.0008,
        monthlyLimitUsd: 20.0,
        limitReached: false,
        warningAt80Sent: false,
      });

      await service.trackUsage(AIProvider.DEEPSEEK, 1000, 0.0008);

      expect(mockRepository.findOne).toHaveBeenCalled();
      expect(mockRepository.create).toHaveBeenCalled();
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should increment existing usage record', async () => {
      const existingUsage = {
        id: 1,
        provider: AIProvider.DEEPSEEK,
        month: new Date('2025-11-01'),
        requestsCount: 100,
        tokensUsed: '500000',
        costUsd: 0.4,
        monthlyLimitUsd: 20.0,
        limitReached: false,
        warningAt80Sent: false,
      };

      mockRepository.findOne.mockResolvedValue(existingUsage);
      mockRepository.save.mockResolvedValue({
        ...existingUsage,
        requestsCount: 101,
        tokensUsed: '501000',
        costUsd: 0.4008,
      });

      await service.trackUsage(AIProvider.DEEPSEEK, 1000, 0.0008);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          requestsCount: 101,
          tokensUsed: '501000',
        }),
      );
    });

    it('should send warning email at 80% of limit', async () => {
      const existingUsage = {
        id: 1,
        provider: AIProvider.DEEPSEEK,
        month: new Date('2025-11-01'),
        requestsCount: 2000,
        tokensUsed: '19000000',
        costUsd: 15.2, // 76% of $20
        monthlyLimitUsd: 20.0,
        limitReached: false,
        warningAt80Sent: false,
      };

      mockRepository.findOne.mockResolvedValue(existingUsage);
      mockRepository.save.mockResolvedValue({
        ...existingUsage,
        costUsd: 16.0, // 80% exactly
        warningAt80Sent: true,
      });

      await service.trackUsage(AIProvider.DEEPSEEK, 1000000, 0.8);

      expect(
        mockEmailService.sendProviderCostWarningEmail,
      ).toHaveBeenCalledWith(
        'admin@test.com',
        expect.objectContaining({
          provider: 'deepseek',
          currentCost: 16.0,
          monthlyLimit: 20.0,
        }),
      );
    });

    it('should mark limit as reached at 100%', async () => {
      const existingUsage = {
        id: 1,
        provider: AIProvider.DEEPSEEK,
        month: new Date('2025-11-01'),
        requestsCount: 2400,
        tokensUsed: '24000000',
        costUsd: 19.2,
        monthlyLimitUsd: 20.0,
        limitReached: false,
        warningAt80Sent: true,
      };

      mockRepository.findOne.mockResolvedValue(existingUsage);
      mockRepository.save.mockResolvedValue({
        ...existingUsage,
        costUsd: 20.0,
        limitReached: true,
      });

      await service.trackUsage(AIProvider.DEEPSEEK, 1000000, 0.8);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          limitReached: true,
        }),
      );
    });

    it('should not send warning email twice', async () => {
      const existingUsage = {
        id: 1,
        provider: AIProvider.DEEPSEEK,
        month: new Date('2025-11-01'),
        requestsCount: 2000,
        tokensUsed: '20000000',
        costUsd: 16.0, // Already at 80%
        monthlyLimitUsd: 20.0,
        limitReached: false,
        warningAt80Sent: true, // Already sent
      };

      mockRepository.findOne.mockResolvedValue(existingUsage);
      mockRepository.save.mockResolvedValue({
        ...existingUsage,
        costUsd: 17.0, // Now 85%
      });

      await service.trackUsage(AIProvider.DEEPSEEK, 1250000, 1.0);

      expect(
        mockEmailService.sendProviderCostWarningEmail,
      ).not.toHaveBeenCalled();
    });
  });

  describe('canUseProvider', () => {
    it('should return true if Groq (free provider)', async () => {
      const result = await service.canUseProvider(AIProvider.GROQ);
      expect(result).toBe(true);
    });

    it('should return true if limit not reached', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        provider: AIProvider.DEEPSEEK,
        costUsd: 10.0,
        monthlyLimitUsd: 20.0,
        limitReached: false,
      });

      const result = await service.canUseProvider(AIProvider.DEEPSEEK);
      expect(result).toBe(true);
    });

    it('should return false if limit reached', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        provider: AIProvider.DEEPSEEK,
        costUsd: 20.0,
        monthlyLimitUsd: 20.0,
        limitReached: true,
      });

      const result = await service.canUseProvider(AIProvider.DEEPSEEK);
      expect(result).toBe(false);
    });

    it('should return true if no usage record exists yet', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.canUseProvider(AIProvider.DEEPSEEK);
      expect(result).toBe(true);
    });
  });

  describe('getRemainingBudget', () => {
    it('should return remaining budget', async () => {
      mockRepository.findOne.mockResolvedValue({
        id: 1,
        provider: AIProvider.DEEPSEEK,
        costUsd: 12.5,
        monthlyLimitUsd: 20.0,
      });

      const result = await service.getRemainingBudget(AIProvider.DEEPSEEK);
      expect(result).toBe(7.5);
    });

    it('should return full limit if no usage yet', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getRemainingBudget(AIProvider.DEEPSEEK);
      expect(result).toBe(20.0);
    });

    it('should return -1 for Groq (unlimited)', async () => {
      const result = await service.getRemainingBudget(AIProvider.GROQ);
      expect(result).toBe(-1);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost for DeepSeek correctly', () => {
      const cost = service.calculateCost(AIProvider.DEEPSEEK, 1_000_000);
      expect(cost).toBeCloseTo(0.8, 4);
    });

    it('should calculate cost for OpenAI correctly', () => {
      const cost = service.calculateCost(AIProvider.OPENAI, 1_000_000);
      expect(cost).toBeCloseTo(4.5, 4);
    });

    it('should return 0 for Groq', () => {
      const cost = service.calculateCost(AIProvider.GROQ, 1_000_000);
      expect(cost).toBe(0);
    });
  });
});
