import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import type { Server } from 'http';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

interface AIHealthBlock {
  status: 'up' | 'down';
  configured: boolean;
  available: boolean;
  primary?: unknown;
  fallback?: unknown;
  timestamp?: unknown;
  circuitBreakers?: unknown;
}

interface HealthBody {
  status: string;
  info: Record<string, unknown>;
  error: Record<string, unknown>;
  details: Record<string, unknown> & { ai: AIHealthBlock };
}

describe('Health (E2E)', () => {
  let app: INestApplication;
  let httpServer: Server;

  /**
   * T-IA-004: `/health` dejó de devolver 200 cuando ningún proveedor de IA
   * responde —esa era justamente la mentira que hizo que el incidente del
   * 26-ago-2026 lo reportara un usuario y no el monitoreo—. En CI no hay
   * proveedores reales (la key de DeepSeek es de mentira), así que el 503 es
   * una respuesta legítima. Lo que se verifica acá es la coherencia del
   * contrato, no un código fijo.
   */
  const getHealth = async (path: string): Promise<HealthBody> => {
    const response = await request(httpServer).get(path);

    expect([200, 503]).toContain(response.status);

    return response.body as HealthBody;
  };

  // Increase timeout for health checks (AI providers can be slow in CI)
  jest.setTimeout(30000);

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    httpServer = app.getHttpServer();
  }, 30000); // Increase timeout for health checks in CI

  afterAll(async () => {
    await app.close();
  });

  describe('/health (GET)', () => {
    it('should return a coherent report', async () => {
      const body = await getHealth('/api/v1/health');

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('info');
      expect(body).toHaveProperty('details');
    });

    it('should check database', async () => {
      const body = await getHealth('/api/v1/health');

      expect(body.details).toHaveProperty('database');
      expect((body.details.database as { status: string }).status).toBe('up');
    });

    it('should check memory', async () => {
      const body = await getHealth('/api/v1/health');

      expect(body.details).toHaveProperty('memory_heap');
      expect(body.details).toHaveProperty('memory_rss');
    });

    it('should check disk', async () => {
      const body = await getHealth('/api/v1/health');

      expect(body.details).toHaveProperty('disk');
    });

    it('should check AI providers', async () => {
      const body = await getHealth('/api/v1/health');

      expect(body.details).toHaveProperty('ai');
    });

    it('should tie the ai status to availability, not to having an API key', async () => {
      const body = await getHealth('/api/v1/health');
      const ai = body.details.ai;

      expect(typeof ai.configured).toBe('boolean');
      expect(typeof ai.available).toBe('boolean');
      expect(ai.status).toBe(ai.available ? 'up' : 'down');
    });

    it('should not report ok while the AI is down', async () => {
      const body = await getHealth('/api/v1/health');

      if (!body.details.ai.available) {
        expect(body.status).toBe('error');
        expect(body.error).toHaveProperty('ai');
      }
    });
  });

  describe('/health/ready (GET)', () => {
    it('should return ok status when services are ready', async () => {
      const response = await request(httpServer)
        .get('/api/v1/health/ready')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect((response.body as { status: string }).status).toBe('ok');
    });

    it('should check critical services only', async () => {
      const response = await request(httpServer)
        .get('/api/v1/health/ready')
        .expect(200);

      const body = response.body as {
        details: { database: unknown; ai: unknown };
      };
      expect(body.details).toHaveProperty('database');
      expect(body.details).toHaveProperty('ai');
    });

    /**
     * La readiness gobierna el ruteo de tráfico: la IA NUNCA la bloquea —ni
     * caída ni sin credenciales—, porque sacar la instancia de rotación
     * convertiría una degradación en una caída total y reiniciar no revive un
     * modelo decomisionado. Sigue en `up`, pero declara la degradación. La
     * alarma la levanta GET /health (T-IA-004).
     */
    it('should keep serving traffic with the AI down, flagging the degradation', async () => {
      const response = await request(httpServer)
        .get('/api/v1/health/ready')
        .expect(200);

      const ai = (
        response.body as {
          details: { ai: AIHealthBlock & { degraded: boolean } };
        }
      ).details.ai;

      expect(ai.status).toBe('up');
      expect(ai.degraded).toBe(!ai.available);
    });
  });

  describe('/health/live (GET)', () => {
    it('should return ok status', async () => {
      const response = await request(httpServer)
        .get('/api/v1/health/live')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect((response.body as { status: string }).status).toBe('ok');
      expect(response.body).toHaveProperty('timestamp');
    });

    it('should return timestamp in ISO format', async () => {
      const response = await request(httpServer)
        .get('/api/v1/health/live')
        .expect(200);

      const timestamp = (response.body as { timestamp: string }).timestamp;
      expect(new Date(timestamp).toISOString()).toBe(timestamp);
    });
  });

  describe('/health/details (GET)', () => {
    it('should return detailed health information', async () => {
      const body = await getHealth('/api/v1/health/details');

      expect(body).toHaveProperty('status');
      expect(body).toHaveProperty('info');
      expect(body).toHaveProperty('details');
    });

    it('should include all component details', async () => {
      const body = await getHealth('/api/v1/health/details');

      expect(body.details).toHaveProperty('database');
      expect(body.details).toHaveProperty('memory_heap');
      expect(body.details).toHaveProperty('memory_rss');
      expect(body.details).toHaveProperty('disk');
      expect(body.details).toHaveProperty('ai');
    });

    it('should include AI provider details', async () => {
      const body = await getHealth('/api/v1/health/details');

      expect(body.details.ai).toHaveProperty('primary');
      expect(body.details.ai).toHaveProperty('fallback');
      expect(body.details.ai).toHaveProperty('timestamp');
    });

    it('should include circuit breaker stats if available', async () => {
      const body = await getHealth('/api/v1/health/details');

      if (body.details.ai.circuitBreakers) {
        expect(body.details.ai.circuitBreakers).toBeDefined();
      }
    });

    it('should tie the ai status to availability, not to having an API key', async () => {
      const body = await getHealth('/api/v1/health/details');
      const ai = body.details.ai;

      expect(ai.status).toBe(ai.available ? 'up' : 'down');
    });
  });

  describe('performance', () => {
    it('/health should respond within 30 seconds', async () => {
      const startTime = Date.now();

      await getHealth('/api/v1/health');

      const responseTime = Date.now() - startTime;
      // Relaxed for CI environment (AI provider latency)
      expect(responseTime).toBeLessThan(30000);
    });

    it('/health/ready should respond within 15 seconds', async () => {
      const startTime = Date.now();

      await request(httpServer).get('/api/v1/health/ready').expect(200);

      const responseTime = Date.now() - startTime;
      // Relaxed for CI environment
      expect(responseTime).toBeLessThan(15000);
    });

    it('/health/live should respond within 100ms', async () => {
      const startTime = Date.now();

      await request(httpServer).get('/api/v1/health/live').expect(200);

      const responseTime = Date.now() - startTime;
      expect(responseTime).toBeLessThan(100);
    });
  });
});
