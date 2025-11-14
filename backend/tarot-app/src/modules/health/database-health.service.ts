import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

/**
 * Interface for node-postgres pool internal structure
 * These properties are not exposed in TypeORM types but exist in pg pool
 */
interface PgPoolOptions {
  max: number;
  min: number;
  idleTimeoutMillis?: number;
  connectionTimeoutMillis?: number;
}

interface PgPool {
  _clients: unknown[];
  _idle: unknown[];
  waitingCount: number;
  options: PgPoolOptions;
}

interface TypeOrmDriverWithPool {
  master: PgPool;
}

export interface PoolMetrics {
  active: number;
  idle: number;
  waiting: number;
  max: number;
  min: number;
  total: number;
  utilizationPercent: number;
  timestamp: string;
}

export interface DatabaseHealthStatus {
  status: 'up' | 'down';
  metrics?: PoolMetrics;
  warning?: string;
  error?: string;
}

@Injectable()
export class DatabaseHealthService {
  private readonly logger = new Logger(DatabaseHealthService.name);
  private readonly HIGH_UTILIZATION_THRESHOLD = 80; // Warn if pool > 80% used

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Get current database connection pool metrics
   *
   * Note: This method accesses internal pg pool properties not exposed in TypeORM types.
   * We use type assertions to safely access these properties.
   */
  getPoolMetrics(): PoolMetrics {
    try {
      // Access PostgreSQL pool via TypeORM DataSource with proper typing
      const driver = this.dataSource.driver as unknown as TypeOrmDriverWithPool;
      const pool: PgPool | undefined = driver?.master;

      if (!pool) {
        this.logger.warn('Database pool not available');
        return this.getEmptyMetrics();
      }

      // Extract pool metrics with type-safe access
      // PostgreSQL node-postgres pool exposes:
      // - _clients: all clients (active + idle)
      // - _idle: idle clients
      // - waitingCount: requests waiting for connection
      const totalClients: number = pool._clients?.length ?? 0;
      const idleClients: number = pool._idle?.length ?? 0;
      const activeClients: number = totalClients - idleClients;
      const waitingCount: number = pool.waitingCount ?? 0;
      const maxConnections: number = pool.options?.max ?? 10;
      const minConnections: number = pool.options?.min ?? 2;

      const utilizationPercent: number = Math.round(
        (totalClients / maxConnections) * 100,
      );

      const metrics: PoolMetrics = {
        active: activeClients,
        idle: idleClients,
        waiting: waitingCount,
        max: maxConnections,
        min: minConnections,
        total: totalClients,
        utilizationPercent,
        timestamp: new Date().toISOString(),
      };

      // Log warning if pool utilization is high
      if (utilizationPercent > this.HIGH_UTILIZATION_THRESHOLD) {
        this.logger.warn(
          `Pool utilization is high: ${utilizationPercent}% (${totalClients}/${maxConnections} connections)`,
        );
        this.logger.warn(
          `Consider increasing DB_POOL_SIZE from ${maxConnections} to ${Math.ceil(maxConnections * 1.5)} for better performance`,
        );
      }

      return metrics;
    } catch (error) {
      this.logger.error('Error getting pool metrics', error);
      return this.getEmptyMetrics();
    }
  }

  /**
   * Get database health status with pool metrics
   */
  getHealthStatus(): DatabaseHealthStatus {
    try {
      if (!this.dataSource.isInitialized) {
        return {
          status: 'down',
          error: 'Database connection not initialized',
        };
      }

      const metrics = this.getPoolMetrics();

      const response: DatabaseHealthStatus = {
        status: 'up',
        metrics,
      };

      // Add warning if utilization is high
      if (metrics.utilizationPercent > this.HIGH_UTILIZATION_THRESHOLD) {
        response.warning = `High pool utilization: ${metrics.utilizationPercent}%. Consider increasing DB_POOL_SIZE.`;
      }

      return response;
    } catch (error) {
      this.logger.error('Error checking database health', error);
      return {
        status: 'down',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get empty metrics as fallback
   */
  private getEmptyMetrics(): PoolMetrics {
    return {
      active: 0,
      idle: 0,
      waiting: 0,
      max: 0,
      min: 0,
      total: 0,
      utilizationPercent: 0,
      timestamp: new Date().toISOString(),
    };
  }
}
