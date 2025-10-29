import { Test, TestingModule } from '@nestjs/testing';
import { AIHealthController } from './ai-health.controller';
import { AIHealthService } from './ai-health.service';

describe('AIHealthController', () => {
  let controller: AIHealthController;

  const mockAIHealthService = {
    checkAllProviders: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AIHealthController],
      providers: [
        {
          provide: AIHealthService,
          useValue: mockAIHealthService,
        },
      ],
    }).compile();

    controller = module.get<AIHealthController>(AIHealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('GET /health/ai', () => {
    it('should return health status of all providers', async () => {
      const mockHealth = {
        primary: {
          provider: 'groq',
          configured: true,
          status: 'ok' as const,
          model: 'llama-3.1-70b-versatile',
          responseTime: 150,
        },
        fallback: [],
        timestamp: new Date().toISOString(),
      };

      mockAIHealthService.checkAllProviders.mockResolvedValue(mockHealth);

      const result = await controller.checkHealth();

      expect(result).toEqual(mockHealth);
      expect(mockAIHealthService.checkAllProviders).toHaveBeenCalled();
    });

    it('should return primary and fallback providers when configured', async () => {
      const mockHealth = {
        primary: {
          provider: 'groq',
          configured: true,
          status: 'ok' as const,
          model: 'llama-3.1-70b-versatile',
        },
        fallback: [
          {
            provider: 'openai',
            configured: true,
            status: 'ok' as const,
            model: 'gpt-4o-mini',
          },
        ],
        timestamp: new Date().toISOString(),
      };

      mockAIHealthService.checkAllProviders.mockResolvedValue(mockHealth);

      const result = await controller.checkHealth();

      expect(result.primary.provider).toBe('groq');
      expect(result.fallback).toHaveLength(1);
      expect(result.fallback[0].provider).toBe('openai');
    });

    it('should handle errors from service', async () => {
      const mockHealth = {
        primary: {
          provider: 'groq',
          configured: false,
          status: 'error' as const,
          error: 'API key not configured',
        },
        fallback: [],
        timestamp: new Date().toISOString(),
      };

      mockAIHealthService.checkAllProviders.mockResolvedValue(mockHealth);

      const result = await controller.checkHealth();

      expect(result.primary.status).toBe('error');
      expect(result.primary.error).toBeDefined();
    });
  });
});
