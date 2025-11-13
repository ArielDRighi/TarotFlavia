/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Health (E2E)', () => {
  let app: INestApplication;
  let httpServer: any;

  // Increase timeout for health checks (AI providers can be slow in CI)
  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer();
  }, 30000); // Increase timeout for health checks in CI

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return ok status', async () => {
      const response = await request(httpServer).get('/health').expect(200);

      expect(response.body).toHaveProperty('status');
      expect((response.body as { status: string }).status).toBe('ok');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('details');
    });

    it('should check database', async () => {
      const response = await request(httpServer).get('/health').expect(200);

      const body = response.body as {
        details: { database: { status: string } };
      };
      expect(body.details).toHaveProperty('database');
      expect(body.details.database.status).toBe('up');
    });

    it('should check memory', async () => {
      const response = await request(httpServer).get('/health').expect(200);

      const body = response.body as {
        details: { memory_heap: unknown; memory_rss: unknown };
      };
      expect(body.details).toHaveProperty('memory_heap');
      expect(body.details).toHaveProperty('memory_rss');
    });

    it('should check disk', async () => {
      const response = await request(httpServer).get('/health').expect(200);

      const body = response.body as { details: { disk: unknown } };
      expect(body.details).toHaveProperty('disk');
    });

    it('should check AI providers', async () => {
      const response = await request(httpServer).get('/health').expect(200);

      const body = response.body as { details: { ai: unknown } };
      expect(body.details).toHaveProperty('ai');
    });
  });

  describe('/health/ready (GET)', () => {
    it('should return ok status when services are ready', async () => {
      const response = await request(httpServer)
        .get('/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect((response.body as { status: string }).status).toBe('ok');
    });

    it('should check critical services only', async () => {
      const response = await request(httpServer)
        .get('/health/ready')
        .expect(200);

      const body = response.body as {
        details: { database: unknown; ai: unknown };
      };
      expect(body.details).toHaveProperty('database');
      expect(body.details).toHaveProperty('ai');
    });
  });

  describe('/health/live (GET)', () => {
    it('should return ok status', async () => {
      const response = await request(httpServer)
        .get('/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect((response.body as { status: string }).status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return timestamp in ISO format', async () => {
      const response = await request(httpServer)
        .get('/health/live')
        .expect(200);

      const timestamp = (response.body as { timestamp: string }).timestamp;
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('/health/details (GET)', () => {
    it('should return detailed health information', async () => {
      const response = await request(httpServer)
        .get('/health/details')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('info');
      expect(response.body).toHaveProperty('details');
    });

    it('should include all component details', async () => {
      const response = await request(httpServer)
        .get('/health/details')
        .expect(200);

      const body = response.body as {
        details: {
          database: unknown;
          memory_heap: unknown;
          memory_rss: unknown;
          disk: unknown;
          ai: unknown;
        };
      };
      expect(body.details).toHaveProperty('database');
      expect(body.details).toHaveProperty('memory_heap');
      expect(body.details).toHaveProperty('memory_rss');
      expect(body.details).toHaveProperty('disk');
      expect(body.details).toHaveProperty('ai');
    });

    it('should include AI provider details', async () => {
      const response = await request(httpServer)
        .get('/health/details')
        .expect(200);

      const aiDetails = (
        response.body as {
          details: {
            ai: { primary: unknown; fallback: unknown; timestamp: unknown };
          };
        }
      ).details.ai;
      expect(aiDetails).toHaveProperty('primary');
      expect(aiDetails).toHaveProperty('fallback');
      expect(aiDetails).toHaveProperty('timestamp');
    });

    it('should include circuit breaker stats if available', async () => {
      const response = await request(httpServer)
        .get('/health/details')
        .expect(200);

      const aiDetails = (
        response.body as {
          details: { ai: { circuitBreakers?: unknown } };
        }
      ).details.ai;
      if (aiDetails.circuitBreakers) {
        expect(aiDetails.circuitBreakers).toBeDefined();
      }
    });
  });

  describe('performance', () => {
    it('/health should respond within 10 seconds', async () => {
      const startTime = Date.now();

      await request(httpServer).get('/health').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(10000);
    });

    it('/health/ready should respond within 5 seconds', async () => {
      const startTime = Date.now();

      await request(httpServer).get('/health/ready').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(5000);
    });

    it('/health/live should respond within 100ms', async () => {
      const startTime = Date.now();

      await request(httpServer).get('/health/live').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });
  });
});
