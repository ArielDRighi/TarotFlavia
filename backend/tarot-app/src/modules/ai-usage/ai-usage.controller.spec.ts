import { Test, TestingModule } from '@nestjs/testing';
import { AIUsageController } from './ai-usage.controller';
import { AIUsageService } from './ai-usage.service';
import { AIProvider } from './entities/ai-usage-log.entity';

describe('AIUsageController', () => {
  let controller: AIUsageController;

  const mockStatistics = [
    {
      provider: AIProvider.GROQ,
      totalCalls: 1200,
      successCalls: 1180,
      errorCalls: 15,
      cachedCalls: 5,
      totalTokens: 450000,
      totalCost: 0,
      avgDuration: 3500,
      errorRate: 1.25,
      cacheHitRate: 0.42,
      fallbackRate: 0.83,
    },
    {
      provider: AIProvider.DEEPSEEK,
      totalCalls: 300,
      successCalls: 295,
      errorCalls: 3,
      cachedCalls: 2,
      totalTokens: 120000,
      totalCost: 0.025,
      avgDuration: 5000,
      errorRate: 1.0,
      cacheHitRate: 0.67,
      fallbackRate: 0.33,
    },
  ];

  const mockAIUsageService = {
    getStatistics: jest.fn(),
    shouldAlert: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIUsageController],
      providers: [
        {
          provide: AIUsageService,
          useValue: mockAIUsageService,
        },
      ],
    }).compile();

    controller = module.get<AIUsageController>(AIUsageController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getStatistics', () => {
    it('should return statistics with alerts', async () => {
      mockAIUsageService.getStatistics.mockResolvedValue(mockStatistics);
      mockAIUsageService.shouldAlert.mockResolvedValue(false);

      const result = await controller.getStatistics();

      expect(mockAIUsageService.getStatistics).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
      expect(mockAIUsageService.shouldAlert).toHaveBeenCalledTimes(4);
      expect(mockAIUsageService.shouldAlert).toHaveBeenCalledWith(
        'groqRateLimit',
      );
      expect(mockAIUsageService.shouldAlert).toHaveBeenCalledWith(
        'highErrorRate',
      );
      expect(mockAIUsageService.shouldAlert).toHaveBeenCalledWith(
        'highFallbackRate',
      );
      expect(mockAIUsageService.shouldAlert).toHaveBeenCalledWith(
        'highDailyCost',
      );

      expect(result).toEqual({
        statistics: mockStatistics,
        groqCallsToday: 1200,
        groqRateLimitAlert: false,
        highErrorRateAlert: false,
        highFallbackRateAlert: false,
        highDailyCostAlert: false,
      });
    });

    it('should return statistics with date filters', async () => {
      const startDate = '2025-11-01T00:00:00.000Z';
      const endDate = '2025-11-30T23:59:59.999Z';

      mockAIUsageService.getStatistics.mockResolvedValue(mockStatistics);
      mockAIUsageService.shouldAlert.mockResolvedValue(false);

      await controller.getStatistics(startDate, endDate);

      expect(mockAIUsageService.getStatistics).toHaveBeenCalledWith(
        new Date(startDate),
        new Date(endDate),
      );
    });

    it('should return alerts when thresholds are exceeded', async () => {
      mockAIUsageService.getStatistics.mockResolvedValue(mockStatistics);
      mockAIUsageService.shouldAlert
        .mockResolvedValueOnce(true) // groqRateLimit
        .mockResolvedValueOnce(false) // highErrorRate
        .mockResolvedValueOnce(true) // highFallbackRate
        .mockResolvedValueOnce(false); // highDailyCost

      const result = await controller.getStatistics();

      expect(result.groqRateLimitAlert).toBe(true);
      expect(result.highErrorRateAlert).toBe(false);
      expect(result.highFallbackRateAlert).toBe(true);
      expect(result.highDailyCostAlert).toBe(false);
    });

    it('should handle empty statistics gracefully', async () => {
      mockAIUsageService.getStatistics.mockResolvedValue([]);
      mockAIUsageService.shouldAlert.mockResolvedValue(false);

      const result = await controller.getStatistics();

      expect(result.groqCallsToday).toBe(0);
      expect(result.statistics).toEqual([]);
    });

    it('should calculate groqCallsToday from statistics', async () => {
      const statsWithGroq = [
        {
          ...mockStatistics[0],
          provider: AIProvider.GROQ,
          totalCalls: 12500,
        },
      ];

      mockAIUsageService.getStatistics.mockResolvedValue(statsWithGroq);
      mockAIUsageService.shouldAlert.mockResolvedValue(false);

      const result = await controller.getStatistics();

      expect(result.groqCallsToday).toBe(12500);
    });
  });
});
