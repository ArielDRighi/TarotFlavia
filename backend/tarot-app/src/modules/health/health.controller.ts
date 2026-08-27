import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
  HealthIndicatorResult,
} from '@nestjs/terminus';
import {
  AIHealthCheckResult,
  AIHealthService,
  AIProviderHealth,
} from './ai-health.service';
import { DatabaseHealthService } from './database-health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  // Health check thresholds
  private readonly DATABASE_TIMEOUT_MS = 5000; // 5 seconds
  private readonly MEMORY_THRESHOLD_BYTES = 2 * 1024 * 1024 * 1024; // 2GB (increased for CI stability)
  private readonly DISK_THRESHOLD_PERCENT = 0.9; // Alert when disk is 90% full

  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly aiHealthService: AIHealthService,
    private readonly databaseHealthService: DatabaseHealthService,
  ) {}

  /**
   * Get the disk path appropriate for the OS
   * Windows: C:\ (or current drive)
   * Linux/Mac: /
   */
  private getDiskPath(): string {
    if (process.platform === 'win32') {
      // Extract drive letter from current working directory using regex
      // Handles standard paths like "D:\project" and provides fallback for edge cases
      const cwd = process.cwd();
      const match = cwd.match(/^([A-Za-z]):/);
      return match ? `${match[1]}:\\` : 'C:\\';
    }
    return '/';
  }

  /**
   * Indicador `ai` para los endpoints de diagnóstico (`/health`, `/health/details`).
   *
   * T-IA-004: hasta el incidente del 26-ago-2026 el `status` se derivaba de
   * `configured` —o sea, de si había una API key en el entorno—, así que
   * `/health` devolvió `"ok"` con Groq respondiendo 404 a todas las llamadas y
   * ningún monitor externo se enteró: la caída la reportó un usuario. Ahora el
   * `status` sale de `available`, que es verdadero solo si algún proveedor
   * respondió efectivamente la sonda.
   */
  private buildAIIndicator(
    aiHealth: AIHealthCheckResult,
    extras: Record<string, unknown> = {},
  ): HealthIndicatorResult<'ai'> {
    return {
      ai: {
        // `extras` va primero a propósito: ningún dato accesorio puede pisar el
        // veredicto del indicador, que es justamente lo que este PR arregla.
        ...extras,
        status: aiHealth.available ? 'up' : 'down',
        configured: aiHealth.configured,
        available: aiHealth.available,
        primary: aiHealth.primary,
        fallback: aiHealth.fallback,
        ...this.buildAIMessage(aiHealth),
      },
    };
  }

  /**
   * `message` con la causa de la caída, para que la alerta del monitor llegue
   * con el motivo y no solo con un 503. Vacío mientras haya IA disponible.
   */
  private buildAIMessage(aiHealth: AIHealthCheckResult): { message?: string } {
    if (aiHealth.available) {
      return {};
    }

    if (!aiHealth.configured) {
      return { message: 'No AI provider is configured' };
    }

    const reasons = [aiHealth.primary, ...aiHealth.fallback]
      .map((provider) => this.describeProvider(provider))
      .join('; ');

    return { message: `No AI provider responded: ${reasons}` };
  }

  private describeProvider(provider: AIProviderHealth): string {
    const model = provider.model ? ` (${provider.model})` : '';
    const reason = provider.error ?? provider.status;

    return `${provider.provider}${model}: ${reason}`;
  }

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Comprehensive health check',
    description:
      'Performs detailed health checks of all system components (database, memory, disk, AI). Suitable for monitoring and diagnostics. Use /health/live for liveness probes and /health/ready for readiness probes.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['ok', 'error'] },
        info: { type: 'object' },
        error: { type: 'object' },
        details: { type: 'object' },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description:
      'A component is down. This includes the AI: `ai.status` is `down` whenever no provider answers, even if API keys are configured (T-IA-004).',
  })
  async check(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database check with timeout
      () =>
        this.db.pingCheck('database', { timeout: this.DATABASE_TIMEOUT_MS }),

      // Memory checks
      () => this.memory.checkHeap('memory_heap', this.MEMORY_THRESHOLD_BYTES),
      () => this.memory.checkRSS('memory_rss', this.MEMORY_THRESHOLD_BYTES),

      // Disk check
      () =>
        this.disk.checkStorage('disk', {
          path: this.getDiskPath(),
          thresholdPercent: this.DISK_THRESHOLD_PERCENT,
        }),

      // AI providers check - `down` si ningún proveedor responde (T-IA-004)
      async () =>
        this.buildAIIndicator(await this.aiHealthService.checkAllProviders()),
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description:
      'Returns OK only if all critical services are ready. Used by Kubernetes readiness probe. The AI never blocks readiness: it is an external dependency the app degrades gracefully without, and evicting the instance would turn a degradation into a full outage. The degradation is reported with `degraded: true`. To alert on the AI, monitor GET /health.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
  })
  @ApiResponse({
    status: 503,
    description: 'Application is not ready',
  })
  async checkReady(): Promise<HealthCheckResult> {
    return this.health.check([
      // Critical: Database must be available
      () =>
        this.db.pingCheck('database', { timeout: this.DATABASE_TIMEOUT_MS }),

      // AI providers: la readiness gobierna el ruteo de tráfico, así que la IA
      // NUNCA la bloquea. Es una dependencia externa sin la cual la app degrada
      // (el resto del sitio funciona) y sacar la instancia de rotación
      // convertiría esa degradación en una caída total; reiniciar el contenedor
      // tampoco revive un modelo decomisionado ni repone una credencial que
      // alguien borró en Railway.
      //
      // Lo que sí cambia respecto del incidente es que deja de esconderlo:
      // `available`, `degraded` y `message` dicen la verdad. La alarma la
      // levanta GET /health, que sí devuelve 503 (T-IA-004).
      async () => {
        const aiHealth = await this.aiHealthService.checkAllProviders();

        return {
          ai: {
            status: 'up' as const,
            configured: aiHealth.configured,
            available: aiHealth.available,
            degraded: !aiHealth.available,
            ...this.buildAIMessage(aiHealth),
          },
        };
      },
    ]);
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description:
      'Returns OK if the application is alive. Used by Kubernetes liveness probe.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
  })
  checkLive(): { status: string; timestamp: string } {
    // Simple check - if we can respond, we're alive
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('details')
  @HealthCheck()
  @ApiOperation({
    summary: 'Detailed health check with circuit breaker info',
    description:
      'Returns comprehensive health information including circuit breaker statistics. Intended for admin dashboards and monitoring systems. Note: Exposes system metrics - consider adding authentication in production.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information including circuit breakers',
  })
  @ApiResponse({
    status: 503,
    description:
      'A component is down, the AI included whenever no provider answers (T-IA-004).',
  })
  async checkDetails(): Promise<HealthCheckResult> {
    return this.health.check([
      // Database check with timeout
      () =>
        this.db.pingCheck('database', { timeout: this.DATABASE_TIMEOUT_MS }),

      // Memory checks
      () => this.memory.checkHeap('memory_heap', this.MEMORY_THRESHOLD_BYTES),
      () => this.memory.checkRSS('memory_rss', this.MEMORY_THRESHOLD_BYTES),

      // Disk check
      () =>
        this.disk.checkStorage('disk', {
          path: this.getDiskPath(),
          thresholdPercent: this.DISK_THRESHOLD_PERCENT,
        }),

      // AI providers check with circuit breaker details
      async () => {
        const aiHealth = await this.aiHealthService.checkAllProviders();

        return this.buildAIIndicator(aiHealth, {
          // Include circuit breaker stats for detailed monitoring
          circuitBreakers: aiHealth.circuitBreakers,
          timestamp: aiHealth.timestamp,
        });
      },
    ]);
  }

  @Get('database')
  @ApiOperation({
    summary: 'Database connection pool metrics',
    description:
      'Returns detailed metrics about the PostgreSQL connection pool including active connections, idle connections, pool utilization percentage, and configuration. Useful for monitoring database load and optimizing pool settings.',
  })
  @ApiResponse({
    status: 200,
    description: 'Database pool metrics and health status',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['up', 'down'] },
        metrics: {
          type: 'object',
          properties: {
            active: {
              type: 'number',
              description: 'Number of active connections',
            },
            idle: { type: 'number', description: 'Number of idle connections' },
            waiting: {
              type: 'number',
              description: 'Number of requests waiting for connection',
            },
            max: { type: 'number', description: 'Maximum pool size' },
            min: { type: 'number', description: 'Minimum pool size' },
            total: {
              type: 'number',
              description: 'Total connections (active + idle)',
            },
            utilizationPercent: {
              type: 'number',
              description: 'Pool utilization percentage',
            },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        warning: {
          type: 'string',
          description: 'Warning message if pool utilization is high',
        },
        error: {
          type: 'string',
          description: 'Error message when database is down',
        },
      },
    },
  })
  checkDatabase() {
    return this.databaseHealthService.getHealthStatus();
  }
}
