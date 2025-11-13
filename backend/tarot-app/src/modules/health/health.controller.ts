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

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: TypeOrmHealthIndicator,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
    private readonly aiHealthService: AIHealthService,
  ) {}

  /**
   * Get the disk path appropriate for the OS
   * Windows: C:\ (or current drive)
   * Linux/Mac: /
   */
  private getDiskPath(): string {
    if (process.platform === 'win32') {
      // Extract drive letter from current working directory (e.g., "D:\project" -> "D:\")
      const cwd = process.cwd();
      const driveLetter = cwd.charAt(0);
      return `${driveLetter}:\\`;
    }
    return '/';
  }

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'General health check (liveness probe)',
    description: 'Returns the health status of all system components',
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
      // Database check with 5s timeout
      () => this.db.pingCheck('database', { timeout: 5000 }),

      // Memory checks - warn if > 1GB
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),

      // Disk check - warn if < 10% free space
      () =>
        this.disk.checkStorage('disk', {
          path: this.getDiskPath(),
          thresholdPercent: 0.9,
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
      () => this.db.pingCheck('database', { timeout: 5000 }),

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
    summary: 'Detailed health check',
    description:
      'Returns detailed information about all system components. For admin/monitoring use.',
  })
  @ApiResponse({
    status: 200,
    description: 'Detailed health information',
  })
  async checkDetails(): Promise<HealthCheckResult> {
    return this.health.check([
      () => this.db.pingCheck('database', { timeout: 5000 }),
      () => this.memory.checkHeap('memory_heap', 1024 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 1024 * 1024 * 1024),
      () =>
        this.disk.checkStorage('disk', {
          path: this.getDiskPath(),
          thresholdPercent: 0.9,
        }),
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
            circuitBreakers: aiHealth.circuitBreakers,
            timestamp: aiHealth.timestamp,
          },
        };
      },
    ]);
  }
}
