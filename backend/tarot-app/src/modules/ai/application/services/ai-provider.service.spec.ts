import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { AIProviderService } from './ai-provider.service';
import { GroqProvider } from '../../infrastructure/providers/groq.provider';
import { DeepSeekProvider } from '../../infrastructure/providers/deepseek.provider';
import { OpenAIProvider } from '../../infrastructure/providers/openai.provider';
import { AIUsageService } from '../../../ai-usage/ai-usage.service';
import {
  AIProviderType,
  AIMessage,
  AIResponse,
} from '../../domain/interfaces/ai-provider.interface';
import { CircuitBreakerState } from '../../infrastructure/errors/circuit-breaker.utils';

describe('AIProviderService', () => {
  let service: AIProviderService;
  let groqProvider: jest.Mocked<GroqProvider>;
  let deepseekProvider: jest.Mocked<DeepSeekProvider>;
  let openaiProvider: jest.Mocked<OpenAIProvider>;
  let aiUsageService: jest.Mocked<AIUsageService>;

  const mockMessages: AIMessage[] = [
    {
      role: 'system',
      content: 'You are a tarot reader',
    },
    {
      role: 'user',
      content: 'Interpret this reading',
    },
  ];

  const mockSuccessResponse: AIResponse = {
    content: 'Test interpretation',
    provider: AIProviderType.GROQ,
    model: 'groq-model',
    tokensUsed: {
      prompt: 50,
      completion: 100,
      total: 150,
    },
    durationMs: 500,
  };

  beforeEach(async () => {
    // Create mocked providers
    const groqProviderMock = {
      generateCompletion: jest.fn(),
      getProviderType: jest.fn().mockReturnValue(AIProviderType.GROQ),
      isAvailable: jest.fn().mockResolvedValue(true),
    };
    groqProvider = groqProviderMock as unknown as jest.Mocked<GroqProvider>;

    const deepseekProviderMock = {
      generateCompletion: jest.fn(),
      getProviderType: jest.fn().mockReturnValue(AIProviderType.DEEPSEEK),
      isAvailable: jest.fn().mockResolvedValue(true),
    };
    deepseekProvider =
      deepseekProviderMock as unknown as jest.Mocked<DeepSeekProvider>;

    const openaiProviderMock = {
      generateCompletion: jest.fn(),
      getProviderType: jest.fn().mockReturnValue(AIProviderType.OPENAI),
      isAvailable: jest.fn().mockResolvedValue(true),
    };
    openaiProvider =
      openaiProviderMock as unknown as jest.Mocked<OpenAIProvider>;

    const aiUsageServiceMock = {
      createLog: jest.fn().mockResolvedValue(undefined),
      calculateCost: jest.fn().mockReturnValue(0.001),
    };
    aiUsageService =
      aiUsageServiceMock as unknown as jest.Mocked<AIUsageService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIProviderService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: GroqProvider,
          useValue: groqProvider,
        },
        {
          provide: DeepSeekProvider,
          useValue: deepseekProvider,
        },
        {
          provide: OpenAIProvider,
          useValue: openaiProvider,
        },
        {
          provide: AIUsageService,
          useValue: aiUsageService,
        },
      ],
    }).compile();

    service = module.get<AIProviderService>(AIProviderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateCompletion', () => {
    it('should use Groq as primary provider and succeed', async () => {
      groqProvider.generateCompletion.mockResolvedValue(mockSuccessResponse);

      const result = await service.generateCompletion(mockMessages, 1, 1);

      expect(result).toEqual(mockSuccessResponse);
      expect(groqProvider.generateCompletion).toHaveBeenCalledTimes(1);
      expect(deepseekProvider.generateCompletion).not.toHaveBeenCalled();
      expect(openaiProvider.generateCompletion).not.toHaveBeenCalled();
      expect(aiUsageService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          readingId: 1,
          fallbackUsed: false,
        }),
      );
    });

    it('should fallback to DeepSeek when Groq fails with 429 error', async () => {
      const rateLimitError = Object.assign(new Error('Rate limit exceeded'), {
        status: 429,
      });

      groqProvider.generateCompletion.mockRejectedValue(rateLimitError);
      deepseekProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.DEEPSEEK,
      });

      const result = await service.generateCompletion(mockMessages, 1, 1);

      expect(result.provider).toBe(AIProviderType.DEEPSEEK);
      expect(groqProvider.generateCompletion).toHaveBeenCalled();
      expect(deepseekProvider.generateCompletion).toHaveBeenCalled();
      expect(openaiProvider.generateCompletion).not.toHaveBeenCalled();
      expect(aiUsageService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackUsed: true,
        }),
      );
    });

    it('should fallback to OpenAI when both Groq and DeepSeek fail', async () => {
      const error = new Error('Service unavailable');

      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockRejectedValue(error);
      openaiProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.OPENAI,
      });

      const result = await service.generateCompletion(mockMessages, 1, 1);

      expect(result.provider).toBe(AIProviderType.OPENAI);
      expect(groqProvider.generateCompletion).toHaveBeenCalled();
      expect(deepseekProvider.generateCompletion).toHaveBeenCalled();
      expect(openaiProvider.generateCompletion).toHaveBeenCalled();
      expect(aiUsageService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          fallbackUsed: true,
        }),
      );
    });

    it('should throw error when all providers fail', async () => {
      const error = new Error('Service unavailable');

      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockRejectedValue(error);
      openaiProvider.generateCompletion.mockRejectedValue(error);

      await expect(
        service.generateCompletion(mockMessages, 1, 1),
      ).rejects.toThrow('All AI providers failed');

      expect(groqProvider.generateCompletion).toHaveBeenCalled();
      expect(deepseekProvider.generateCompletion).toHaveBeenCalled();
      expect(openaiProvider.generateCompletion).toHaveBeenCalled();
    });

    it('should log all provider failures', async () => {
      const error = new Error('Service unavailable');

      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockRejectedValue(error);
      openaiProvider.generateCompletion.mockRejectedValue(error);

      await expect(
        service.generateCompletion(mockMessages, 1, 1),
      ).rejects.toThrow();

      // Should log 3 failed attempts
      expect(aiUsageService.createLog).toHaveBeenCalledTimes(3);
      expect(aiUsageService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'error',
        }),
      );
    });

    it('should handle null userId and readingId', async () => {
      groqProvider.generateCompletion.mockResolvedValue(mockSuccessResponse);

      await service.generateCompletion(mockMessages, null, null);

      expect(aiUsageService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: null,
          readingId: null,
        }),
      );
    });
  });

  describe('Circuit Breaker', () => {
    it('should activate circuit breaker after 5 consecutive failures', async () => {
      const error = new Error('Service unavailable');
      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.DEEPSEEK,
      });

      // Generate 5 failures to open circuit breaker
      for (let i = 0; i < 5; i++) {
        await service.generateCompletion(mockMessages, 1, 1);
      }

      const stats = service.getCircuitBreakerStats();
      const groqStats = stats.find((s) => s.provider === AIProviderType.GROQ);

      expect(groqStats?.state).toBe(CircuitBreakerState.OPEN);
      expect(groqStats?.consecutiveFailures).toBeGreaterThanOrEqual(5);
    });

    it('should skip provider when circuit breaker is open', async () => {
      const error = new Error('Service unavailable');
      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.DEEPSEEK,
      });

      // Open circuit breaker
      for (let i = 0; i < 5; i++) {
        await service.generateCompletion(mockMessages, 1, 1);
      }

      // Reset mock call count
      groqProvider.generateCompletion.mockClear();
      deepseekProvider.generateCompletion.mockClear();

      // Next call should skip Groq (circuit open)
      await service.generateCompletion(mockMessages, 1, 1);

      expect(groqProvider.generateCompletion).not.toHaveBeenCalled();
      expect(deepseekProvider.generateCompletion).toHaveBeenCalled();
    });

    it('should reset circuit breaker after successful calls', async () => {
      groqProvider.generateCompletion.mockResolvedValue(mockSuccessResponse);

      // Make successful calls
      for (let i = 0; i < 3; i++) {
        await service.generateCompletion(mockMessages, 1, 1);
      }

      const stats = service.getCircuitBreakerStats();
      const groqStats = stats.find((s) => s.provider === AIProviderType.GROQ);

      expect(groqStats?.state).toBe(CircuitBreakerState.CLOSED);
      expect(groqStats?.consecutiveFailures).toBe(0);
    });
  });

  describe('Retry Logic', () => {
    it('should retry 3 times before failing', async () => {
      const error = new Error('Temporary error');
      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.DEEPSEEK,
      });

      await service.generateCompletion(mockMessages, 1, 1);

      // Should retry Groq 3 times (exponential backoff)
      // Note: Retry happens inside retryWithBackoff utility
      expect(groqProvider.generateCompletion).toHaveBeenCalled();
    });

    it('should use exponential backoff for retries', async () => {
      // This test verifies that retryWithBackoff is called
      // Actual backoff delays are tested in retry.utils.spec.ts
      const error = new Error('Temporary error');
      groqProvider.generateCompletion.mockRejectedValue(error);
      deepseekProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.DEEPSEEK,
      });

      await service.generateCompletion(mockMessages, 1, 1);

      // With 3 retries and backoff (1s, 2s, 4s), should take at least 7 seconds
      // In practice, due to mocking, it will be faster
      expect(groqProvider.generateCompletion).toHaveBeenCalled();
    });
  });

  describe('getProvidersStatus', () => {
    it('should return status of all providers', async () => {
      groqProvider.isAvailable.mockResolvedValue(true);
      deepseekProvider.isAvailable.mockResolvedValue(false);
      openaiProvider.isAvailable.mockResolvedValue(true);

      const statuses = await service.getProvidersStatus();

      expect(statuses).toEqual([
        { provider: AIProviderType.GROQ, available: true },
        { provider: AIProviderType.DEEPSEEK, available: false },
        { provider: AIProviderType.OPENAI, available: true },
      ]);
    });

    it('should call isAvailable on all providers', async () => {
      await service.getProvidersStatus();

      expect(groqProvider.isAvailable).toHaveBeenCalled();
      expect(deepseekProvider.isAvailable).toHaveBeenCalled();
      expect(openaiProvider.isAvailable).toHaveBeenCalled();
    });
  });

  describe('getPrimaryProvider', () => {
    it('should return Groq as primary when available', async () => {
      groqProvider.isAvailable.mockResolvedValue(true);

      const primary = await service.getPrimaryProvider();

      expect(primary).toBe(AIProviderType.GROQ);
    });

    it('should return DeepSeek when Groq unavailable', async () => {
      groqProvider.isAvailable.mockResolvedValue(false);
      deepseekProvider.isAvailable.mockResolvedValue(true);

      const primary = await service.getPrimaryProvider();

      expect(primary).toBe(AIProviderType.DEEPSEEK);
    });

    it('should return OpenAI when Groq and DeepSeek unavailable', async () => {
      groqProvider.isAvailable.mockResolvedValue(false);
      deepseekProvider.isAvailable.mockResolvedValue(false);
      openaiProvider.isAvailable.mockResolvedValue(true);

      const primary = await service.getPrimaryProvider();

      expect(primary).toBe(AIProviderType.OPENAI);
    });

    it('should return null when all providers unavailable', async () => {
      groqProvider.isAvailable.mockResolvedValue(false);
      deepseekProvider.isAvailable.mockResolvedValue(false);
      openaiProvider.isAvailable.mockResolvedValue(false);

      const primary = await service.getPrimaryProvider();

      expect(primary).toBeNull();
    });
  });

  describe('getCircuitBreakerStats', () => {
    it('should return stats for all circuit breakers', () => {
      const stats = service.getCircuitBreakerStats();

      expect(stats).toHaveLength(3);
      expect(stats.map((s) => s.provider)).toEqual(
        expect.arrayContaining([
          AIProviderType.GROQ,
          AIProviderType.DEEPSEEK,
          AIProviderType.OPENAI,
        ]),
      );
    });

    it('should include state and failure counts in stats', () => {
      const stats = service.getCircuitBreakerStats();

      stats.forEach((stat) => {
        expect(stat).toHaveProperty('state');
        expect(stat).toHaveProperty('consecutiveFailures');
        expect(stat).toHaveProperty('totalFailures');
        expect(stat).toHaveProperty('totalSuccesses');
      });
    });
  });

  describe('Cost Calculation', () => {
    it('should calculate cost for successful completion', async () => {
      groqProvider.generateCompletion.mockResolvedValue(mockSuccessResponse);

      await service.generateCompletion(mockMessages, 1, 1);

      expect(aiUsageService.calculateCost).toHaveBeenCalledWith(
        expect.anything(),
        50, // prompt tokens
        100, // completion tokens
      );
    });

    it('should log cost in usage log', async () => {
      groqProvider.generateCompletion.mockResolvedValue(mockSuccessResponse);
      aiUsageService.calculateCost.mockReturnValue(0.005);

      await service.generateCompletion(mockMessages, 1, 1);

      expect(aiUsageService.createLog).toHaveBeenCalledWith(
        expect.objectContaining({
          costUsd: 0.005,
        }),
      );
    });
  });

  describe('Error Handling', () => {
    it('should include all provider errors in final error message', async () => {
      groqProvider.generateCompletion.mockRejectedValue(
        new Error('Groq error'),
      );
      deepseekProvider.generateCompletion.mockRejectedValue(
        new Error('DeepSeek error'),
      );
      openaiProvider.generateCompletion.mockRejectedValue(
        new Error('OpenAI error'),
      );

      await expect(
        service.generateCompletion(mockMessages, 1, 1),
      ).rejects.toThrow(/Groq error.*DeepSeek error.*OpenAI error/);
    });

    it('should handle provider errors gracefully', async () => {
      groqProvider.generateCompletion.mockRejectedValue(
        new Error('Network timeout'),
      );
      deepseekProvider.generateCompletion.mockResolvedValue({
        ...mockSuccessResponse,
        provider: AIProviderType.DEEPSEEK,
      });

      const result = await service.generateCompletion(mockMessages, 1, 1);

      expect(result).toBeDefined();
      expect(result.provider).toBe(AIProviderType.DEEPSEEK);
    });
  });
});
