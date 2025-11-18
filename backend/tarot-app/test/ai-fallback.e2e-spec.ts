/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { E2EDatabaseHelper } from './helpers/e2e-database.helper';
import { AIProviderService } from '../src/modules/ai/application/services/ai-provider.service';

/**
 * E2E Tests for AI Provider Fallback
 * Verifies the AI provider system works correctly in production
 *
 * Note: These tests verify real behavior without mocking.
 * For testing fallback scenarios with mocks, see unit tests in ai-provider.service.spec.ts
 */
describe('AI Provider Fallback (e2e)', () => {
  let app: INestApplication<App>;
  let dbHelper: E2EDatabaseHelper;
  let freeUserToken: string;
  let freeUserId: number;
  let aiProviderService: AIProviderService;

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
  }, 30000);

  afterEach(async () => {
    // Clean up readings and usage limits after each test to reset usage constraints
    const ds = dbHelper.getDataSource();
    await ds.query('DELETE FROM tarot_reading WHERE "userId" = $1', [
      freeUserId,
    ]);
    await ds.query('DELETE FROM usage_limit WHERE user_id = $1', [freeUserId]);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
    if (dbHelper) {
      await dbHelper.close();
    }
  }, 30000);

  describe('AI Provider Integration', () => {
    it('should successfully generate interpretation with available provider', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          predefinedQuestionId: 1,
          deckId: 1,
          spreadId: 1,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('interpretation');
      expect(response.body.interpretation).not.toBe('');

      // Verify AI usage log was created
      const dataSource = dbHelper.getDataSource();
      const usageLogs = await dataSource.query(
        'SELECT * FROM ai_usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [freeUserId],
      );

      expect(usageLogs.length).toBeGreaterThan(0);
      expect(usageLogs[0]).toHaveProperty('provider');
      expect(usageLogs[0]).toHaveProperty('prompt_tokens');
      expect(usageLogs[0]).toHaveProperty('completion_tokens');
      expect(['groq', 'deepseek', 'openai']).toContain(usageLogs[0].provider);
    }, 30000);

    it('should log complete usage information in ai_usage_logs', async () => {
      const response = await request(app.getHttpServer())
        .post('/readings')
        .set('Authorization', `Bearer ${freeUserToken}`)
        .send({
          predefinedQuestionId: 1,
          deckId: 1,
          spreadId: 1,
          cardIds: [1, 2, 3],
          cardPositions: [
            { cardId: 1, position: 'pasado', isReversed: false },
            { cardId: 2, position: 'presente', isReversed: false },
            { cardId: 3, position: 'futuro', isReversed: false },
          ],
          generateInterpretation: true,
        })
        .expect(201);

      // Verify reading was created with interpretation
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('interpretation');

      // Verify usage log has all required fields
      const dataSource = dbHelper.getDataSource();
      const usageLogs = await dataSource.query(
        'SELECT * FROM ai_usage_logs WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
        [freeUserId],
      );

      expect(usageLogs.length).toBeGreaterThan(0);
      const log = usageLogs[0];
      expect(log).toHaveProperty('provider');
      expect(log).toHaveProperty('model_used');
      expect(log).toHaveProperty('prompt_tokens');
      expect(log).toHaveProperty('completion_tokens');
      expect(log).toHaveProperty('total_tokens');
      expect(log).toHaveProperty('cost_usd');
      expect(log).toHaveProperty('fallback_used');
      expect(typeof log.fallback_used).toBe('boolean');
    }, 30000);
  });

  describe('Health Check - AI Providers', () => {
    it('GET /health should show system status', async () => {
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
        expect(['closed', 'open', 'half-open']).toContain(stat.state);
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
    it('should maintain continuous service availability', async () => {
      // Create multiple readings to verify system stability
      const promises: Array<request.Test> = [];
      for (let i = 0; i < 3; i++) {
        promises.push(
          request(app.getHttpServer())
            .post('/readings')
            .set('Authorization', `Bearer ${freeUserToken}`)
            .send({
              predefinedQuestionId: 1,
              deckId: 1,
              spreadId: 1,
              cardIds: [1, 2, 3],
              cardPositions: [
                { cardId: 1, position: 'pasado', isReversed: false },
                { cardId: 2, position: 'presente', isReversed: false },
                { cardId: 3, position: 'futuro', isReversed: false },
              ],
              generateInterpretation: true,
            })
            .expect(201),
        );
      }

      const responses = await Promise.all(promises);

      // All requests should succeed
      responses.forEach((response) => {
        expect(response.body).toHaveProperty('interpretation');
        expect(response.body.interpretation).not.toBe('');
      });
    }, 30000);
  });
});
