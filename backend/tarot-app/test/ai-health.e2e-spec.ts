/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from '../src/modules/health/health.module';

describe('AI Health (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        HealthModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('GET /health/ai', () => {
    it('should return 200 with health status when Groq is configured', () => {
      // Set test environment variable
      process.env.GROQ_API_KEY = 'gsk_test_key_12345';
      process.env.GROQ_MODEL = 'llama-3.1-70b-versatile';

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
        });
    });

    it('should work with only Groq configured (no fallbacks)', () => {
      process.env.GROQ_API_KEY = 'gsk_test_key_12345';
      process.env.GROQ_MODEL = 'llama-3.1-70b-versatile';
      delete process.env.OPENAI_API_KEY;
      delete process.env.DEEPSEEK_API_KEY;

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.provider).toBe('groq');
          expect(res.body.fallback).toHaveLength(0);
        });
    });

    it('should include OpenAI in fallback when configured', () => {
      process.env.GROQ_API_KEY = 'gsk_test_key_12345';
      process.env.OPENAI_API_KEY = 'sk-test_key_12345';
      process.env.OPENAI_MODEL = 'gpt-4o-mini';

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.provider).toBe('groq');
          const openaiProvider = res.body.fallback.find(
            (p: any) => p.provider === 'openai',
          );
          expect(openaiProvider).toBeDefined();
          expect(openaiProvider.configured).toBe(true);
        });
    });

    it('should include DeepSeek in fallback when configured', () => {
      process.env.GROQ_API_KEY = 'gsk_test_key_12345';
      process.env.DEEPSEEK_API_KEY = 'sk-deepseek_test_12345';
      process.env.DEEPSEEK_MODEL = 'deepseek-chat';

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.provider).toBe('groq');
          const deepseekProvider = res.body.fallback.find(
            (p: any) => p.provider === 'deepseek',
          );
          expect(deepseekProvider).toBeDefined();
          expect(deepseekProvider.configured).toBe(true);
        });
    });

    it('should report error status when Groq API key is invalid format', () => {
      process.env.GROQ_API_KEY = 'invalid_key_format';

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.status).toBe('error');
          expect(res.body.primary.error).toContain('Invalid API key format');
        });
    });

    it('should include response time metrics when provider is healthy', () => {
      process.env.GROQ_API_KEY = 'gsk_test_key_12345';

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          if (res.body.primary.status === 'ok') {
            expect(res.body.primary.responseTime).toBeDefined();
            expect(typeof res.body.primary.responseTime).toBe('number');
          }
        });
    });

    it('should include model information for each provider', () => {
      process.env.GROQ_API_KEY = 'gsk_test_key_12345';
      process.env.GROQ_MODEL = 'llama-3.1-70b-versatile';
      process.env.OPENAI_API_KEY = 'sk-test_key_12345';
      process.env.OPENAI_MODEL = 'gpt-4o-mini';

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.model).toBe('llama-3.1-70b-versatile');

          const openaiProvider = res.body.fallback.find(
            (p: any) => p.provider === 'openai',
          );
          if (openaiProvider) {
            expect(openaiProvider.model).toBe('gpt-4o-mini');
          }
        });
    });

    it('should handle all providers being unconfigured', () => {
      delete process.env.GROQ_API_KEY;
      delete process.env.OPENAI_API_KEY;
      delete process.env.DEEPSEEK_API_KEY;

      return request(app.getHttpServer())
        .get('/health/ai')
        .expect(200)
        .expect((res) => {
          expect(res.body.primary.configured).toBe(false);
          expect(res.body.primary.status).toBe('error');
        });
    });
  });
});
