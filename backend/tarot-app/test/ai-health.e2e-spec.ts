/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigService } from '@nestjs/config';
import { AIHealthService } from '../src/modules/health/ai-health.service';
import { AIHealthController } from '../src/modules/health/ai-health.controller';
import { AIProviderService } from '../src/modules/ai/application/services/ai-provider.service';

describe('AI Health (e2e)', () => {
  let app: INestApplication;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      const config: Record<string, string> = {
        GROQ_API_KEY: 'gsk_test_key_12345',
        GROQ_MODEL: 'llama-3.1-70b-versatile',
        OPENAI_API_KEY: '',
        OPENAI_MODEL: '',
        DEEPSEEK_API_KEY: '',
        DEEPSEEK_MODEL: '',
      };
      return config[key] || '';
    }),
  };

  const mockAIProviderService = {
    getCircuitBreakerStats: jest.fn().mockReturnValue([
      {
        provider: 'groq',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 10,
        lastFailureTime: null,
      },
      {
        provider: 'deepseek',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 5,
        lastFailureTime: null,
      },
      {
        provider: 'openai',
        state: 'CLOSED',
        failureCount: 0,
        successCount: 3,
        lastFailureTime: null,
      },
    ]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AIHealthController],
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

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('GET /health/ai', () => {
    it('should return 200 with health status when Groq is configured', () => {
      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('primary');
          expect(res.body).toHaveProperty('fallback');
          expect(res.body).toHaveProperty('timestamp');
          expect(res.body.primary.provider).toBe('groq');
          expect(res.body.primary.configured).toBe(true);
          expect(Array.isArray(res.body.fallback)).toBe(true);
          // Should have circuit breaker stats
          expect(res.body).toHaveProperty('circuitBreakers');
          expect(Array.isArray(res.body.circuitBreakers)).toBe(true);
        });
    });

    it('should work with only Groq configured (no fallbacks)', () => {
      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.provider).toBe('groq');
          expect(res.body.fallback).toHaveLength(0);
        });
    });

    it('should include circuit breaker stats', () => {
      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('circuitBreakers');
          expect(Array.isArray(res.body.circuitBreakers)).toBe(true);
          expect(res.body.circuitBreakers.length).toBeGreaterThan(0);

          const groqBreaker = res.body.circuitBreakers.find(
            (cb: any) => cb.provider === 'groq',
          );
          expect(groqBreaker).toBeDefined();
          expect(groqBreaker.state).toBe('CLOSED');
        });
    });

    it('should include model information for configured provider', () => {
      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.model).toBe('llama-3.1-70b-versatile');
        });
    });
  });
});
