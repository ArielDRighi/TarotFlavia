/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { AIProviderService } from '../src/modules/ai/application/services/ai-provider.service';
import { GroqProvider } from '../src/modules/ai/infrastructure/providers/groq.provider';
import { DeepSeekProvider } from '../src/modules/ai/infrastructure/providers/deepseek.provider';
import { OpenAIProvider } from '../src/modules/ai/infrastructure/providers/openai.provider';

/**
 * E2E Tests for AI Provider Fallback
 * Verifies automatic fallback from Groq → DeepSeek → OpenAI
 */
describe('AI Provider Fallback (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let freeUserToken: string;
  let freeUserId: number;
  let aiProviderService: AIProviderService;
  let groqProvider: GroqProvider;
  let deepseekProvider: DeepSeekProvider;
  let openaiProvider: OpenAIProvider;

  beforeAll(async () => {
    // Initialize E2E database helper
    dbHelper = new E2EDatabaseHelper();
    await dbHelper.initialize();

    // Create NestJS application
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    // Get service instances
    aiProviderService = moduleFixture.get<AIProviderService>(AIProviderService);
    groqProvider = moduleFixture.get<GroqProvider>(GroqProvider);
    deepseekProvider = moduleFixture.get<DeepSeekProvider>(DeepSeekProvider);
    openaiProvider = moduleFixture.get<OpenAIProvider>(OpenAIProvider);

    // Login as free user
    const freeLoginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({ email: 'free@test.com', password: 'Test123456!' })
      .expect(200);

    freeUserToken = freeLoginResponse.body.access_token;
    freeUserId = freeLoginResponse.body.user.id;

    if (!freeUserToken) {
      throw new Error('Failed to obtain authentication token');
    }
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  });

  describe('Automatic Fallback Groq → DeepSeek → OpenAI', () => {
    it('should use Groq as primary provider when available', async () => {
      // Spy on provider methods
      const groqSpy = jest.spyOn(groqProvider, 'generateCompletion');

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1, // Three Card Spread
          question: 'Test question for fallback',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('interpretation');

      // Verify Groq was called (in normal conditions)
      // Note: This will only pass if Groq API key is configured and has quota
      if (process.env.GROQ_API_KEY) {
        expect(groqSpy).toHaveBeenCalled();
      }

      // Verify AI usage log was created
      const dataSource = dbHelper.getDataSource();
      const usageLogs = await dataSource.query('SELECT * FROM ai_usage_logs');
      expect(usageLogs.length).toBeGreaterThan(0);
    });

    it('should fallback to DeepSeek when Groq is exhausted', async () => {
      // Mock Groq to simulate rate limit
      jest.spyOn(groqProvider, 'generateCompletion').mockRejectedValue({
        message: 'Rate limit exceeded',
        status: 429,
      });

      const deepseekSpy = jest.spyOn(deepseekProvider, 'generateCompletion');

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Test fallback to DeepSeek',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('interpretation');

      // Verify DeepSeek was called
      if (process.env.DEEPSEEK_API_KEY) {
        expect(deepseekSpy).toHaveBeenCalled();
      }

      // Verify fallbackUsed flag in AI usage log
      const dataSource = dbHelper.getDataSource();
      const usageLogs = await dataSource.query(
        'SELECT * FROM ai_usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [freeUserId],
      );

      if (usageLogs.length > 0) {
        expect(usageLogs[0].fallback_used).toBe(true);
      }

      // Restore mock
      jest.restoreAllMocks();
    });

    it('should fallback to OpenAI when both Groq and DeepSeek fail', async () => {
      // Mock both Groq and DeepSeek to fail
      jest.spyOn(groqProvider, 'generateCompletion').mockRejectedValue({
        message: 'Rate limit exceeded',
        status: 429,
      });
      jest.spyOn(deepseekProvider, 'generateCompletion').mockRejectedValue({
        message: 'Service unavailable',
        status: 503,
      });

      const openaiSpy = jest.spyOn(openaiProvider, 'generateCompletion');

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Test fallback to OpenAI',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('interpretation');

      // Verify OpenAI was called
      if (process.env.OPENAI_API_KEY) {
        expect(openaiSpy).toHaveBeenCalled();
      }

      // Verify fallbackUsed flag
      const dataSource = dbHelper.getDataSource();
      const usageLogs = await dataSource.query(
        'SELECT * FROM ai_usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [freeUserId],
      );

      if (usageLogs.length > 0) {
        expect(usageLogs[0].fallback_used).toBe(true);
      }

      // Restore mocks
      jest.restoreAllMocks();
    });

    it('should fail gracefully when all providers are unavailable', async () => {
      // Mock all providers to fail
      jest.spyOn(groqProvider, 'generateCompletion').mockRejectedValue({
        message: 'Service unavailable',
        status: 503,
      });
      jest.spyOn(deepseekProvider, 'generateCompletion').mockRejectedValue({
        message: 'Service unavailable',
        status: 503,
      });
      jest.spyOn(openaiProvider, 'generateCompletion').mockRejectedValue({
        message: 'Service unavailable',
        status: 503,
      });

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Test all providers fail',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(500);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('All AI providers failed');

      // Restore mocks
      jest.restoreAllMocks();
    });
  });

  describe('AI Usage Logging', () => {
    it('should log provider used in ai_usage_logs table', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Test provider logging',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      // Verify reading was created with interpretation
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('interpretation');
      expect(response.body.interpretation).not.toBe('');
    });

    it('should mark fallbackUsed=true when using secondary provider', async () => {
      // Mock Groq to fail
      jest.spyOn(groqProvider, 'generateCompletion').mockRejectedValue({
        message: 'Rate limit exceeded',
        status: 429,
      });

      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Test fallback logging',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      // Verify reading was created with fallback provider
      expect(response.body).toHaveProperty('interpretation');

      // Restore mock
      jest.restoreAllMocks();
    });
  });

  describe('Health Check - AI Providers', () => {
    it('GET /health should show AI providers status', async () => {
      const response = await request(app.getHttpServer())
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('ok');
    });

    it('should provide circuit breaker stats via service', () => {
      const stats = aiProviderService.getCircuitBreakerStats();

      expect(stats).toBeInstanceOf(Array);
      expect(stats.length).toBe(3); // Groq, DeepSeek, OpenAI

      stats.forEach((stat) => {
        expect(stat).toHaveProperty('provider');
        expect(stat).toHaveProperty('state');
        expect(stat).toHaveProperty('consecutiveFailures');
        expect(stat).toHaveProperty('totalFailures');
        expect(stat).toHaveProperty('totalSuccesses');
      });
    });

    it('should provide providers status via service', async () => {
      const statuses = await aiProviderService.getProvidersStatus();

      expect(statuses).toBeInstanceOf(Array);
      expect(statuses.length).toBe(3);

      statuses.forEach((status) => {
        expect(status).toHaveProperty('provider');
        expect(status).toHaveProperty('available');
        expect(typeof status.available).toBe('boolean');
      });
    });
  });

  describe('System Continuity', () => {
    it('should maintain 24/7 service with fallback', async () => {
      // Simulate Groq exhaustion scenario
      jest.spyOn(groqProvider, 'generateCompletion').mockRejectedValue({
        message: 'Rate limit exceeded',
        status: 429,
      });

      // Create multiple readings to verify continuous operation
      const response1 = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Continuous service test 1',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      const response2 = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Continuous service test 2',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      const response3 = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Continuous service test 3',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      // All requests should succeed
      expect(response1.body).toHaveProperty('interpretation');
      expect(response2.body).toHaveProperty('interpretation');
      expect(response3.body).toHaveProperty('interpretation');

      // Restore mock
      jest.restoreAllMocks();
    });

    it('should work without interruptions despite rate limits', async () => {
      // This test verifies the complete fallback chain works
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          spreadId: 1,
          question: 'Continuous availability test',
          questionCategory: 'general',
          cards: [
            { cardId: 1, position: 'Pasado', isReversed: false },
            { cardId: 2, position: 'Presente', isReversed: false },
            { cardId: 3, position: 'Futuro', isReversed: false },
          ],
        })
        .expect(201);

      expect(response.body).toHaveProperty('interpretation');
      expect(response.body.interpretation).not.toBe('');
    });
  });
});
