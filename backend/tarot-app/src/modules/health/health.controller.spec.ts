import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from './health.controller';
import {
  HealthCheckService,
  HealthCheckResult,
  HealthIndicatorFunction,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';
import { MemoryHealthIndicator } from '@nestjs/terminus';
import { DiskHealthIndicator } from '@nestjs/terminus';
import { AIHealthService, AIHealthCheckResult } from './ai-health.service';
import { DatabaseHealthService } from './database-health.service';

/**
 * NOTA TÉCNICA: TypeScript Language Server muestra errores de tipo "error typed"
 * en este archivo debido a un bug conocido con decoradores experimentales en tsconfig.
 * Sin embargo, los tests ejecutan correctamente (verificar con: npm test).
 *
 * El problema está documentado en:
 * - https://github.com/microsoft/TypeScript/issues/7342
 * - https://github.com/nestjs/nest/issues/1228
 *
 * Los errores son FALSOS POSITIVOS del análisis estático y no afectan la ejecución real.
 */

type IndicatorDetail = { status: 'up' | 'down' } & Record<string, unknown>;

/**
 * Réplica del `HealthCheckExecutor` de terminus: reparte cada indicador entre
 * `info` y `error` según su `status` y marca la corrida como `error` si alguno
 * cayó. El mock anterior devolvía un resultado fijo sin ejecutar los closures,
 * así que la lógica del indicador `ai` —la que mintió en producción— nunca se
 * ejercitaba desde los tests.
 */
async function executeIndicators(
  indicators: HealthIndicatorFunction[],
): Promise<HealthCheckResult> {
  const info: Record<string, IndicatorDetail> = {};
  const error: Record<string, IndicatorDetail> = {};

  for (const indicator of indicators) {
    const outcome = (await indicator()) as Record<string, IndicatorDetail>;
    for (const [key, detail] of Object.entries(outcome)) {
      if (detail.status === 'up') {
        info[key] = detail;
      } else {
        error[key] = detail;
      }
    }
  }

  return {
    status: Object.keys(error).length > 0 ? 'error' : 'ok',
    info: info as HealthIndicatorResult,
    error: error as HealthIndicatorResult,
    details: { ...info, ...error } as HealthIndicatorResult,
  };
}

function aiSnapshot(
  overrides: Partial<AIHealthCheckResult> = {},
): AIHealthCheckResult {
  return {
    configured: true,
    available: true,
    primary: {
      provider: 'groq',
      configured: true,
      status: 'ok',
      model: 'openai/gpt-oss-120b',
    },
    fallback: [],
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

/** El estado real del incidente: key presente, modelo decomisionado. */
function outageSnapshot(): AIHealthCheckResult {
  return aiSnapshot({
    configured: true,
    available: false,
    primary: {
      provider: 'groq',
      configured: true,
      status: 'error',
      model: 'llama-3.3-70b-versatile',
      error:
        '404 The model `llama-3.3-70b-versatile` does not exist or you do not have access to it.',
    },
    fallback: [],
  });
}

describe('HealthController', () => {
  let controller: HealthController;
  let healthCheckService: HealthCheckService;
  let aiHealthService: AIHealthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: {
            check: jest.fn(executeIndicators),
          },
        },
        {
          provide: TypeOrmHealthIndicator,
          useValue: {
            pingCheck: jest
              .fn()
              .mockResolvedValue({ database: { status: 'up' } }),
          },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest
              .fn()
              .mockResolvedValue({ memory_heap: { status: 'up' } }),
            checkRSS: jest
              .fn()
              .mockResolvedValue({ memory_rss: { status: 'up' } }),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: {
            checkStorage: jest
              .fn()
              .mockResolvedValue({ disk: { status: 'up' } }),
          },
        },
        {
          provide: AIHealthService,
          useValue: {
            checkAllProviders: jest.fn().mockResolvedValue(aiSnapshot()),
          },
        },
        {
          provide: DatabaseHealthService,
          useValue: {
            getHealthStatus: jest.fn().mockReturnValue({
              status: 'up',
              metrics: {
                active: 3,
                idle: 7,
                waiting: 0,
                max: 10,
                min: 2,
                total: 10,
                utilizationPercent: 30,
                timestamp: new Date().toISOString(),
              },
            }),
            getPoolMetrics: jest.fn().mockReturnValue({
              active: 3,
              idle: 7,
              waiting: 0,
              max: 10,
              min: 2,
              total: 10,
              utilizationPercent: 30,
              timestamp: new Date().toISOString(),
            }),
          },
        },
      ],
    }).compile();

    controller = module.get(HealthController);
    healthCheckService = module.get(HealthCheckService);
    aiHealthService = module.get(AIHealthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('check (GET /health)', () => {
    it('should return general health check', async () => {
      const result = await controller.check();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call health check service with indicators', async () => {
      await controller.check();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
          expect.any(Function),
        ]),
      );
    });

    it('should report ai as up when a provider actually answers', async () => {
      const result = await controller.check();

      expect(result.info?.ai).toMatchObject({
        status: 'up',
        configured: true,
        available: true,
      });
    });
  });

  describe('checkReady (GET /health/ready)', () => {
    it('should return readiness check', async () => {
      const result = await controller.checkReady();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(healthCheckService.check).toHaveBeenCalled();
    });

    it('should call health check service with critical services only', async () => {
      await controller.checkReady();

      expect(healthCheckService.check).toHaveBeenCalledWith(
        expect.arrayContaining([expect.any(Function), expect.any(Function)]),
      );
    });
  });

  describe('checkLive (GET /health/live)', () => {
    it('should return liveness check', () => {
      const result = controller.checkLive();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
    });

    it('should return simple response without calling external services', () => {
      const result = controller.checkLive();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String) as string,
      });
    });
  });

  describe('checkDetails (GET /health/details)', () => {
    it('should return detailed health check', async () => {
      const result = await controller.checkDetails();

      expect(result).toBeDefined();
      expect(result.status).toBe('ok');
      expect(result.info).toBeDefined();
      expect(result.details).toBeDefined();
    });

    it('should include all component details', async () => {
      const result = await controller.checkDetails();

      expect(result.details).toHaveProperty('database');
      expect(result.details).toHaveProperty('memory_heap');
      expect(result.details).toHaveProperty('memory_rss');
      expect(result.details).toHaveProperty('disk');
      expect(result.details).toHaveProperty('ai');
    });
  });

  describe('error handling', () => {
    it('should return error status when database is down', async () => {
      const errorResult: HealthCheckResult = {
        status: 'error',
        info: {},
        error: {
          database: { status: 'down', message: 'Connection refused' },
        },
        details: {
          database: { status: 'down', message: 'Connection refused' },
        },
      };

      jest.spyOn(healthCheckService, 'check').mockResolvedValue(errorResult);

      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error).toHaveProperty('database');
    });
  });

  /**
   * T-IA-004: durante el incidente del 26-ago-2026 `/health` devolvió
   * `"status": "ok"` con `ai.status: "up"` mientras la IA estaba caída,
   * porque el indicador se calculaba sobre `configured` (¿hay API key?)
   * en lugar de sobre si algún proveedor respondía. Ningún monitor externo
   * podía detectar la caída: la reportó un usuario.
   */
  describe('el health no puede mentir sobre la IA (T-IA-004)', () => {
    beforeEach(() => {
      jest
        .spyOn(aiHealthService, 'checkAllProviders')
        .mockResolvedValue(outageSnapshot());
    });

    it('should mark ai as down in GET /health when no provider answers', async () => {
      const result = await controller.check();

      expect(result.status).toBe('error');
      expect(result.error?.ai).toMatchObject({
        status: 'down',
        configured: true,
        available: false,
      });
      expect(result.info?.ai).toBeUndefined();
    });

    it('should surface the provider error so an alert says why', async () => {
      const result = await controller.check();

      const ai = result.error?.ai as { message?: string } | undefined;
      expect(ai?.message).toContain('groq');
      expect(ai?.message).toContain('llama-3.3-70b-versatile');
    });

    it('should mark ai as down in GET /health/details as well', async () => {
      const result = await controller.checkDetails();

      expect(result.status).toBe('error');
      expect(result.error?.ai).toMatchObject({
        status: 'down',
        available: false,
      });
    });

    it('should keep ai up in GET /health when a fallback still answers', async () => {
      jest.spyOn(aiHealthService, 'checkAllProviders').mockResolvedValue(
        aiSnapshot({
          available: true,
          primary: {
            provider: 'groq',
            configured: true,
            status: 'error',
            error: 'Rate limit exceeded (too many requests)',
          },
          fallback: [
            {
              provider: 'deepseek',
              configured: true,
              status: 'ok',
              model: 'deepseek-v4-flash',
            },
          ],
        }),
      );

      const result = await controller.check();

      expect(result.status).toBe('ok');
      expect(result.info?.ai).toMatchObject({ status: 'up', available: true });
    });

    /**
     * Decisión deliberada: la readiness gobierna el ruteo de tráfico. Sacar la
     * instancia de rotación porque un proveedor externo se cayó convierte una
     * degradación (tarot sin IA) en una caída total del sitio, y reiniciar el
     * contenedor no revive un modelo decomisionado. La readiness sigue en `up`
     * pero deja de mentir: expone `available` y `degraded`.
     */
    it('should keep GET /health/ready serving traffic but flag the degradation', async () => {
      const result = await controller.checkReady();

      expect(result.status).toBe('ok');
      expect(result.info?.ai).toMatchObject({
        status: 'up',
        configured: true,
        available: false,
        degraded: true,
      });
    });

    it('should fail GET /health/ready when AI is not configured at all', async () => {
      jest.spyOn(aiHealthService, 'checkAllProviders').mockResolvedValue(
        aiSnapshot({
          configured: false,
          available: false,
          primary: {
            provider: 'groq',
            configured: false,
            status: 'error',
            error: 'API key not configured',
          },
          fallback: [],
        }),
      );

      const result = await controller.checkReady();

      expect(result.status).toBe('error');
      expect(result.error?.ai).toMatchObject({
        status: 'down',
        configured: false,
      });
    });
  });
});
