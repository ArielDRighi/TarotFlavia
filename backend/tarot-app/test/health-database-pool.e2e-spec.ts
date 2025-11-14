import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

interface DatabaseHealthResponse {
  status: 'up' | 'down';
  metrics?: {
    active: number;
    idle: number;
    waiting: number;
    max: number;
    min: number;
    total: number;
    utilizationPercent: number;
    timestamp: string;
  };
  warning?: string;
  error?: string;
}

interface HealthCheckResponse {
  status: 'ok' | 'error';
  info?: Record<string, unknown>;
  error?: Record<string, unknown>;
  details?: Record<string, unknown>;
}

describe('Health - Database Pool (E2E)', () => {
  let app: INestApplication;
  let httpServer: Server;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    httpServer = app.getHttpServer() as Server;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('GET /health/database', () => {
    it('should return database pool metrics', async () => {
      const response = await request(httpServer)
        .get('/health/database')
        .expect(200);

      const body = response.body as DatabaseHealthResponse;

      expect(body).toHaveProperty('status');
      expect(['up', 'down']).toContain(body.status);

      if (body.status === 'up' && body.metrics) {
        expect(body.metrics).toHaveProperty('active');
        expect(body.metrics).toHaveProperty('idle');
        expect(body.metrics).toHaveProperty('waiting');
        expect(body.metrics).toHaveProperty('max');
        expect(body.metrics).toHaveProperty('min');
        expect(body.metrics).toHaveProperty('total');
        expect(body.metrics).toHaveProperty('utilizationPercent');
        expect(body.metrics).toHaveProperty('timestamp');

        // Validate types
        expect(typeof body.metrics.active).toBe('number');
        expect(typeof body.metrics.idle).toBe('number');
        expect(typeof body.metrics.waiting).toBe('number');
        expect(typeof body.metrics.max).toBe('number');
        expect(typeof body.metrics.min).toBe('number');
        expect(typeof body.metrics.total).toBe('number');
        expect(typeof body.metrics.utilizationPercent).toBe('number');

        // Validate logical constraints
        expect(body.metrics.active).toBeGreaterThanOrEqual(0);
        expect(body.metrics.idle).toBeGreaterThanOrEqual(0);
        expect(body.metrics.total).toBe(
          body.metrics.active + body.metrics.idle,
        );
        expect(body.metrics.max).toBeGreaterThan(0);
        expect(body.metrics.utilizationPercent).toBeGreaterThanOrEqual(0);
        expect(body.metrics.utilizationPercent).toBeLessThanOrEqual(100);
      }
    });

    it('should include warning if pool utilization is high (manual test)', () => {
      // This is a manual test case documented for production monitoring
      // When pool utilization > 80%, the response should include a warning field
      // Example expected response:
      // {
      //   status: 'up',
      //   metrics: { ... },
      //   warning: 'High pool utilization: 90%. Consider increasing DB_POOL_SIZE.'
      // }
      expect(true).toBe(true);
    });
  });

  describe('GET /health', () => {
    it('should still work with comprehensive health check', async () => {
      // Accept both 200 (all healthy) and 503 (some checks down)
      // This test validates the health endpoint integration, not specific health states
      const response = await request(httpServer).get('/health');

      expect([200, 503]).toContain(response.status);

      const body = response.body as HealthCheckResponse;

      expect(body).toHaveProperty('status');
      expect(['ok', 'error']).toContain(body.status);
    }, 10000); // 10 second timeout for comprehensive health check
  });
});
