import { Test, TestingModule } from '@nestjs/testing';
import { ServiceUnavailableException } from '@nestjs/common';
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
 * Réplica de `HealthCheckService.check()` de terminus, ejecutor incluido:
 * corre los indicadores en paralelo con `Promise.allSettled`, reparte cada
 * resultado entre `info` y `error` según su `status` (descartando cualquier
 * otro valor, igual que el real) y **lanza `ServiceUnavailableException`**
 * cuando alguno cayó — que es de dónde sale el 503 en producción.
 *
 * El mock anterior devolvía un resultado fijo sin ejecutar los closures, así
 * que la lógica del indicador `ai` —la que mintió en producción— nunca se
 * ejercitaba desde los tests. Y devolver el resultado en vez de lanzarlo
 * dejaba sin aserción justamente el 503 que hace que el monitor se entere.
 *
 * Ver `@nestjs/terminus/dist/health-check/health-check.service.js` y
 * `.../health-check-executor.service.js`.
 */
async function executeIndicators(
  indicators: HealthIndicatorFunction[],
): Promise<HealthCheckResult> {
  const info: Record<string, IndicatorDetail> = {};
  const error: Record<string, IndicatorDetail> = {};

  // `HealthIndicatorFunction` puede devolver el resultado sincrónicamente, así
  // que se normaliza igual que hace el executor real antes de agregarlo.
  const settled = await Promise.allSettled(
    indicators.map((indicator) => Promise.resolve(indicator())),
  );

  for (const outcome of settled) {
    if (outcome.status === 'rejected') {
      throw outcome.reason;
    }

    const details = outcome.value as Record<string, IndicatorDetail>;
    for (const [key, detail] of Object.entries(details)) {
      if (detail.status === 'up') {
        info[key] = detail;
      } else if (detail.status === 'down') {
        error[key] = detail;
      }
    }
  }

  const result: HealthCheckResult = {
    status: Object.keys(error).length > 0 ? 'error' : 'ok',
    info: info as HealthIndicatorResult,
    error: error as HealthIndicatorResult,
    details: { ...info, ...error } as HealthIndicatorResult,
  };

  if (result.status !== 'ok') {
    throw new ServiceUnavailableException(result);
  }

  return result;
}

/** Corre un check que se espera caído y devuelve el cuerpo del 503. */
async function expectServiceUnavailable(
  run: () => Promise<HealthCheckResult>,
): Promise<HealthCheckResult> {
  await expect(run()).rejects.toBeInstanceOf(ServiceUnavailableException);

  try {
    await run();
  } catch (caught) {
    return (
      caught as ServiceUnavailableException
    ).getResponse() as HealthCheckResult;
  }

  throw new Error('Se esperaba un 503 y el check respondió ok');
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

    it('should surface a 503 when an indicator is down', async () => {
      jest
        .spyOn(aiHealthService, 'checkAllProviders')
        .mockResolvedValue(outageSnapshot());

      await expect(controller.check()).rejects.toBeInstanceOf(
        ServiceUnavailableException,
      );
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
      const result = await expectServiceUnavailable(() => controller.check());

      expect(result.status).toBe('error');
      expect(result.error?.ai).toMatchObject({
        status: 'down',
        configured: true,
        available: false,
      });
      expect(result.info?.ai).toBeUndefined();
    });

    it('should surface the provider error so an alert says why', async () => {
      const result = await expectServiceUnavailable(() => controller.check());

      const ai = result.error?.ai as { message?: string } | undefined;
      expect(ai?.message).toContain('groq');
      expect(ai?.message).toContain('llama-3.3-70b-versatile');
      expect(ai?.message).toContain('404');
    });

    it('should fall back to the provider status when there is no error text', async () => {
      jest.spyOn(aiHealthService, 'checkAllProviders').mockResolvedValue(
        aiSnapshot({
          available: false,
          primary: {
            provider: 'groq',
            configured: true,
            status: 'error',
            model: 'openai/gpt-oss-120b',
          },
        }),
      );

      const result = await expectServiceUnavailable(() => controller.check());

      const ai = result.error?.ai as { message?: string } | undefined;
      expect(ai?.message).toBe(
        'No AI provider responded: groq (openai/gpt-oss-120b): error',
      );
    });

    it('should say so plainly when nothing is configured', async () => {
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
        }),
      );

      const result = await expectServiceUnavailable(() => controller.check());

      expect(result.error?.ai).toMatchObject({
        status: 'down',
        configured: false,
        message: 'No AI provider is configured',
      });
    });

    it('should mark ai as down in GET /health/details as well', async () => {
      const result = await expectServiceUnavailable(() =>
        controller.checkDetails(),
      );

      expect(result.status).toBe('error');
      expect(result.error?.ai).toMatchObject({
        status: 'down',
        available: false,
      });
    });

    it('should not let the circuit breaker extras override the verdict', async () => {
      const result = await expectServiceUnavailable(() =>
        controller.checkDetails(),
      );

      // `extras` se spreadea antes que el veredicto: nada accesorio puede
      // devolver el indicador a `up`.
      expect(result.error?.ai).toMatchObject({ status: 'down' });
      expect(result.error?.ai).toHaveProperty('timestamp');
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

    /**
     * Tampoco cae sin credenciales. El check se evalúa continuamente, no solo
     * al arrancar: si alguien rota o borra la key en Railway con la app
     * corriendo, tumbar la readiness apagaría el sitio entero —auth, historial,
     * horóscopos ya generados— por una dependencia sin la que la app degrada.
     * El blast radius es idéntico al de una caída del proveedor, así que la
     * respuesta tiene que ser la misma. La alarma la levanta GET /health.
     */
    it('should keep GET /health/ready serving traffic with no credentials either', async () => {
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

      expect(result.status).toBe('ok');
      expect(result.info?.ai).toMatchObject({
        status: 'up',
        configured: false,
        available: false,
        degraded: true,
        message: 'No AI provider is configured',
      });
    });

    it('should never take the instance out of rotation for the AI', async () => {
      await expect(controller.checkReady()).resolves.toMatchObject({
        status: 'ok',
      });
    });
  });
});
