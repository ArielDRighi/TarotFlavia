import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import {
  HealthCheckService,
  HealthCheck,
  TypeOrmHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
  HealthCheckResult,
} from '@nestjs/terminus';
import { AIHealthService } from './ai-health.service';
import { DatabaseHealthService } from './database-health.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  // Health check thresholds
  private readonly DATABASE_TIMEOUT_MS = 5000; // 5 seconds
  private readonly MEMORY_THRESHOLD_BYTES = 1024 * 1024 * 1024; // 1GB
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

      // AI providers check - app funciona en modo degradado sin AI
      async () => {
        const aiHealth = await this.aiHealthService.checkAllProviders();
        // App is healthy even if AI is unavailable (graceful degradation)
        // Only mark as 'down' if AI is required AND completely unavailable
        const isConfigured =
          aiHealth.primary.configured || aiHealth.fallback.length > 0;
        const hasWorkingProvider =
          aiHealth.primary.status === 'ok' ||
          aiHealth.fallback.some((f) => f.status === 'ok');

        return {
          ai: {
            // Report 'up' if configured (even if temporarily unavailable)
            status: isConfigured ? 'up' : 'down',
            available: hasWorkingProvider,
            primary: aiHealth.primary,
            fallback: aiHealth.fallback,
          },
        };
      },
    ]);
  }

  @Get('ready')
  @HealthCheck()
  @ApiOperation({
    summary: 'Readiness check',
    description:
      'Returns OK only if all critical services are ready. Used by Kubernetes readiness probe.',
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

      // AI providers: app can start if configured (even if temporarily unavailable)
      async () => {
        const aiHealth = await this.aiHealthService.checkAllProviders();
        const isConfigured =
          aiHealth.primary.configured || aiHealth.fallback.length > 0;
        const hasWorkingProvider =
          aiHealth.primary.status === 'ok' ||
          aiHealth.fallback.some((f) => f.status === 'ok');

        return {
          ai: {
            // Ready if configured, even if temporarily unavailable
            status: isConfigured ? 'up' : 'down',
            configured: isConfigured,
            available: hasWorkingProvider,
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
        const isConfigured =
          aiHealth.primary.configured || aiHealth.fallback.length > 0;
        const hasWorkingProvider =
          aiHealth.primary.status === 'ok' ||
          aiHealth.fallback.some((f) => f.status === 'ok');

        return {
          ai: {
            status: isConfigured ? 'up' : 'down',
            available: hasWorkingProvider,
            primary: aiHealth.primary,
            fallback: aiHealth.fallback,
            // Include circuit breaker stats for detailed monitoring
            circuitBreakers: aiHealth.circuitBreakers,
            timestamp: aiHealth.timestamp,
          },
        };
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
