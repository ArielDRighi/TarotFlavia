import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AIUsageService } from './ai-usage.service';
import {
  AIUsageLog,
  AIProvider,
  AIUsageStatus,
} from './entities/ai-usage-log.entity';

describe('AIUsageService', () => {
  let service: AIUsageService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    count: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIUsageService,
        {
          provide: getRepositoryToken(AIUsageLog),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<AIUsageService>(AIUsageService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createLog', () => {
    it('should create a usage log with all fields', async () => {
      const logData = {
        userId: 1,
        readingId: 10,
        provider: AIProvider.GROQ,
        modelUsed: 'llama-3.1-70b',
        promptTokens: 100,
        completionTokens: 200,
        totalTokens: 300,
        costUsd: 0,
        durationMs: 5000,
        status: AIUsageStatus.SUCCESS,
        errorMessage: null,
        fallbackUsed: false,
      };

      const savedLog = { id: 'uuid-123', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.createLog(logData);

      expect(mockRepository.create).toHaveBeenCalledWith(logData);
      expect(mockRepository.save).toHaveBeenCalledWith(logData);
      expect(result).toEqual(savedLog);
    });

    it('should create a log with error status', async () => {
      const logData = {
        userId: 1,
        readingId: null,
        provider: AIProvider.OPENAI,
        modelUsed: 'gpt-4o-mini',
        promptTokens: 50,
        completionTokens: 0,
        totalTokens: 50,
        costUsd: 0.0075,
        durationMs: 30000,
        status: AIUsageStatus.ERROR,
        errorMessage: 'Rate limit exceeded',
        fallbackUsed: true,
      };

      const savedLog = { id: 'uuid-456', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.createLog(logData);

      expect(result.status).toBe(AIUsageStatus.ERROR);
      expect(result.errorMessage).toBe('Rate limit exceeded');
      expect(result.fallbackUsed).toBe(true);
    });

    it('should create a log with cached status', async () => {
      const logData = {
        userId: 2,
        readingId: 20,
        provider: AIProvider.GROQ,
        modelUsed: 'llama-3.1-70b',
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        costUsd: 0,
        durationMs: 50,
        status: AIUsageStatus.CACHED,
        errorMessage: null,
        fallbackUsed: false,
      };

      const savedLog = { id: 'uuid-789', ...logData, createdAt: new Date() };
      mockRepository.create.mockReturnValue(logData);
      mockRepository.save.mockResolvedValue(savedLog);

      const result = await service.createLog(logData);

      expect(result.status).toBe(AIUsageStatus.CACHED);
      expect(result.totalTokens).toBe(0);
      expect(result.costUsd).toBe(0);
    });
  });

  describe('calculateCost', () => {
    it('should calculate $0 for Groq provider', () => {
      const cost = service.calculateCost(AIProvider.GROQ, 1000, 2000);
      expect(cost).toBe(0);
    });

    it('should calculate cost for DeepSeek provider', () => {
      const cost = service.calculateCost(AIProvider.DEEPSEEK, 1000000, 1000000);
      // 1M input tokens * $0.14 + 1M output tokens * $0.28 = $0.42
      expect(cost).toBeCloseTo(0.42, 2);
    });

    it('should calculate cost for OpenAI provider', () => {
      const cost = service.calculateCost(AIProvider.OPENAI, 1000000, 1000000);
      // 1M input tokens * $0.15 + 1M output tokens * $0.60 = $0.75
      expect(cost).toBeCloseTo(0.75, 2);
    });

    it('should calculate $0 for Gemini provider', () => {
      const cost = service.calculateCost(AIProvider.GEMINI, 1000, 2000);
      expect(cost).toBe(0);
    });

    it('should handle small token counts correctly', () => {
      const cost = service.calculateCost(AIProvider.DEEPSEEK, 100, 200);
      // 100 * 0.14/1M + 200 * 0.28/1M = 0.000014 + 0.000056 = 0.00007
      expect(cost).toBeCloseTo(0.00007, 6);
    });
  });

  describe('getStatistics', () => {
    it('should return statistics grouped by provider', async () => {
      const mockStats = [
        {
          provider: AIProvider.GROQ,
          totalCalls: '150',
          successCalls: '145',
          errorCalls: '3',
          cachedCalls: '2',
          totalTokens: '450000',
          totalCost: '0',
          avgDuration: '5000',
        },
        {
          provider: AIProvider.DEEPSEEK,
          totalCalls: '50',
          successCalls: '48',
          errorCalls: '2',
          cachedCalls: '0',
          totalTokens: '150000',
          totalCost: '0.021',
          avgDuration: '8000',
        },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const result = await service.getStatistics(startDate, endDate);

      expect(result).toHaveLength(2);
      expect(result[0].provider).toBe(AIProvider.GROQ);
      expect(result[0].totalCalls).toBe(150);
      expect(result[0].errorRate).toBeCloseTo(2, 1);
      expect(result[1].provider).toBe(AIProvider.DEEPSEEK);
      expect(result[1].totalCost).toBeCloseTo(0.021, 3);
    });

    it('should calculate error rate correctly', async () => {
      const mockStats = [
        {
          provider: AIProvider.OPENAI,
          totalCalls: '100',
          successCalls: '94',
          errorCalls: '6',
          cachedCalls: '0',
          totalTokens: '300000',
          totalCost: '0.225',
          avgDuration: '15000',
        },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getStatistics();

      expect(result[0].errorRate).toBe(6);
      expect(result[0].totalCalls).toBe(100);
    });

    it('should calculate cache hit rate correctly', async () => {
      const mockStats = [
        {
          provider: AIProvider.GROQ,
          totalCalls: '200',
          successCalls: '180',
          errorCalls: '0',
          cachedCalls: '20',
          totalTokens: '540000',
          totalCost: '0',
          avgDuration: '4500',
        },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getStatistics();

      expect(result[0].cacheHitRate).toBe(10);
    });

    it('should calculate fallback rate correctly', async () => {
      const mockFallbackCount = 15;
      mockRepository.count.mockResolvedValue(mockFallbackCount);

      const mockStats = [
        {
          provider: AIProvider.GROQ,
          totalCalls: '150',
          successCalls: '145',
          errorCalls: '5',
          cachedCalls: '0',
          totalTokens: '450000',
          totalCost: '0',
          avgDuration: '5000',
        },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const result = await service.getStatistics();

      expect(result[0].fallbackRate).toBe(10);
    });
  });

  describe('getByProvider', () => {
    it('should return logs filtered by provider', async () => {
      const mockLogs = [
        {
          id: 'uuid-1',
          provider: AIProvider.GROQ,
          modelUsed: 'llama-3.1-70b',
          totalTokens: 300,
        },
        {
          id: 'uuid-2',
          provider: AIProvider.GROQ,
          modelUsed: 'llama-3.1-70b',
          totalTokens: 500,
        },
      ];

      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getByProvider(AIProvider.GROQ);

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { provider: AIProvider.GROQ },
        order: { createdAt: 'DESC' },
        take: 100,
      });
      expect(result).toHaveLength(2);
    });
  });

  describe('getByDateRange', () => {
    it('should return logs within date range', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-31');
      const mockLogs = [
        { id: 'uuid-1', createdAt: new Date('2025-01-15') },
        { id: 'uuid-2', createdAt: new Date('2025-01-20') },
      ];

      mockRepository.find.mockResolvedValue(mockLogs);

      const result = await service.getByDateRange(startDate, endDate);

      expect(mockRepository.find).toHaveBeenCalled();
      expect(result).toHaveLength(2);
    });
  });

  describe('shouldAlert', () => {
    it('should return true when Groq calls exceed threshold', async () => {
      mockRepository.count.mockResolvedValue(12500);

      const shouldAlert = await service.shouldAlert('groqRateLimit');

      expect(shouldAlert).toBe(true);
    });

    it('should return false when Groq calls are below threshold', async () => {
      mockRepository.count.mockResolvedValue(10000);

      const shouldAlert = await service.shouldAlert('groqRateLimit');

      expect(shouldAlert).toBe(false);
    });

    it('should return true when error rate exceeds 5%', async () => {
      const mockStats = [
        {
          provider: AIProvider.OPENAI,
          totalCalls: '100',
          successCalls: '93',
          errorCalls: '7',
          cachedCalls: '0',
          totalTokens: '300000',
          totalCost: '0.225',
          avgDuration: '15000',
        },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const shouldAlert = await service.shouldAlert('highErrorRate');

      expect(shouldAlert).toBe(true);
    });

    it('should return true when fallback rate exceeds 10%', async () => {
      mockRepository.count.mockResolvedValueOnce(20).mockResolvedValueOnce(150);

      const shouldAlert = await service.shouldAlert('highFallbackRate');

      expect(shouldAlert).toBe(true);
    });

    it('should return true when daily cost exceeds threshold', async () => {
      const mockStats = [
        {
          provider: AIProvider.OPENAI,
          totalCalls: '1000',
          successCalls: '990',
          errorCalls: '10',
          cachedCalls: '0',
          totalTokens: '3000000',
          totalCost: '2.5',
          avgDuration: '15000',
        },
      ];

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockStats),
      };

      mockRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const shouldAlert = await service.shouldAlert('highDailyCost');

      expect(shouldAlert).toBe(true);
    });
  });
});
