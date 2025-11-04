import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AIHealthService } from './ai-health.service';
import { AIProviderService } from '../tarot/interpretations/ai-provider.service';

describe('AIHealthService', () => {
  let service: AIHealthService;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockAIProviderService = {
    getCircuitBreakerStats: jest.fn().mockReturnValue([]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AIHealthService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: AIProviderService,
          useValue: mockAIProviderService,
        },
      ],
    }).compile();

    service = module.get<AIHealthService>(AIHealthService);

    // Suppress logs during tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  describe('checkGroqHealth', () => {
    it('should detect valid Groq API key', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_validkey123';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      const result = await service.checkGroqHealth();

      expect(result.provider).toBe('groq');
      expect(result.configured).toBe(true);
      expect(result.model).toBe('llama-3.1-70b-versatile');
    });

    it('should detect invalid Groq API key format', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'invalid_key';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      const result = await service.checkGroqHealth();

      expect(result.provider).toBe('groq');
      expect(result.configured).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid API key format');
    });

    it('should detect missing Groq API key', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      const result = await service.checkGroqHealth();

      expect(result.provider).toBe('groq');
      expect(result.configured).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toContain('API key not configured');
    });

    it('should handle API connection timeout', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_validkey123';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      // Mock a timeout scenario
      jest
        .spyOn(service as any, 'testGroqConnection')
        .mockRejectedValue(new Error('Request timeout'));

      const result = await service.checkGroqHealth();

      expect(result.status).toBe('error');
      expect(result.error).toContain('timeout');
    });

    it('should handle 401 unauthorized error', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_invalidkey';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      jest.spyOn(service as any, 'testGroqConnection').mockRejectedValue({
        response: { status: 401 },
        message: 'Unauthorized',
      });

      const result = await service.checkGroqHealth();

      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid API key');
    });

    it('should handle 429 rate limit error', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_validkey123';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      jest.spyOn(service as any, 'testGroqConnection').mockRejectedValue({
        response: { status: 429 },
        message: 'Rate limit exceeded',
      });

      const result = await service.checkGroqHealth();

      expect(result.status).toBe('error');
      expect(result.error).toContain('Rate limit');
    });

    it('should handle 500 server error', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_validkey123';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      jest.spyOn(service as any, 'testGroqConnection').mockRejectedValue({
        response: { status: 500 },
        message: 'Internal server error',
      });

      const result = await service.checkGroqHealth();

      expect(result.status).toBe('error');
      expect(result.error).toContain('Server error');
    });
  });

  describe('checkDeepSeekHealth', () => {
    it('should return not configured when API key is missing', async () => {
      mockConfigService.get.mockImplementation(() => undefined);

      const result = await service.checkDeepSeekHealth();

      expect(result.provider).toBe('deepseek');
      expect(result.configured).toBe(false);
      expect(result.status).toBe('not_configured');
    });

    it('should detect valid DeepSeek API key', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'DEEPSEEK_API_KEY') return 'sk-deepseek123';
        if (key === 'DEEPSEEK_MODEL') return 'deepseek-chat';
        return undefined;
      });

      const result = await service.checkDeepSeekHealth();

      expect(result.provider).toBe('deepseek');
      expect(result.configured).toBe(true);
      expect(result.model).toBe('deepseek-chat');
    });
  });

  describe('checkOpenAIHealth', () => {
    it('should return not configured when API key is missing', async () => {
      mockConfigService.get.mockImplementation(() => undefined);

      const result = await service.checkOpenAIHealth();

      expect(result.provider).toBe('openai');
      expect(result.configured).toBe(false);
      expect(result.status).toBe('not_configured');
    });

    it('should detect valid OpenAI API key', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'sk-openai123';
        if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
        return undefined;
      });

      const result = await service.checkOpenAIHealth();

      expect(result.provider).toBe('openai');
      expect(result.configured).toBe(true);
      expect(result.model).toBe('gpt-4o-mini');
    });

    it('should handle invalid OpenAI API key format', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'OPENAI_API_KEY') return 'invalid_key';
        if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
        return undefined;
      });

      const result = await service.checkOpenAIHealth();

      expect(result.configured).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toContain('Invalid API key format');
    });
  });

  describe('checkAllProviders', () => {
    it('should check all configured providers', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_validkey123';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        if (key === 'OPENAI_API_KEY') return 'sk-openai123';
        if (key === 'OPENAI_MODEL') return 'gpt-4o-mini';
        return undefined;
      });

      const result = await service.checkAllProviders();

      expect(result.primary).toBeDefined();
      expect(result.primary.provider).toBe('groq');
      expect(result.fallback).toHaveLength(1);
      expect(result.fallback[0].provider).toBe('openai');
    });

    it('should identify only Groq as primary when no fallbacks configured', async () => {
      mockConfigService.get.mockImplementation((key: string) => {
        if (key === 'GROQ_API_KEY') return 'gsk_validkey123';
        if (key === 'GROQ_MODEL') return 'llama-3.1-70b-versatile';
        return undefined;
      });

      const result = await service.checkAllProviders();

      expect(result.primary.provider).toBe('groq');
      expect(result.fallback).toHaveLength(0);
    });

    it('should handle all providers being unconfigured', async () => {
      mockConfigService.get.mockImplementation(() => undefined);

      const result = await service.checkAllProviders();

      expect(result.primary.configured).toBe(false);
      expect(result.primary.status).toBe('error');
    });
  });

  describe('Provider timeouts', () => {
    it('should respect Groq timeout of 10s', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const timeout = (service as any).GROQ_TIMEOUT as number;
      expect(timeout).toBe(10000);
    });

    it('should respect DeepSeek timeout of 15s', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const timeout = (service as any).DEEPSEEK_TIMEOUT as number;
      expect(timeout).toBe(15000);
    });

    it('should respect OpenAI timeout of 30s', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const timeout = (service as any).OPENAI_TIMEOUT as number;
      expect(timeout).toBe(30000);
    });
  });
});
