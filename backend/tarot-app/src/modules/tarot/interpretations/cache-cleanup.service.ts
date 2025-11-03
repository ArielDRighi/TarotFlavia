import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InterpretationCacheService } from './interpretation-cache.service';

@Injectable()
export class CacheCleanupService {
  private readonly logger = new Logger(CacheCleanupService.name);

  constructor(private readonly cacheService: InterpretationCacheService) {}

  /**
   * Ejecuta limpieza de cachés expirados diariamente a las 3 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async cleanExpiredCache() {
    this.logger.log('Starting expired cache cleanup...');

    try {
      const deletedCount = await this.cacheService.cleanExpiredCache();
      this.logger.log(
        `Expired cache cleanup completed. Deleted ${deletedCount} entries.`,
      );
    } catch (error) {
      this.logger.error('Error during expired cache cleanup:', error);
    }
  }

  /**
   * Ejecuta limpieza de cachés poco usados cada domingo a las 4 AM
   */
  @Cron(CronExpression.EVERY_WEEK)
  async cleanUnusedCache() {
    this.logger.log('Starting unused cache cleanup...');

    try {
      const deletedCount = await this.cacheService.cleanUnusedCache();
      this.logger.log(
        `Unused cache cleanup completed. Deleted ${deletedCount} entries.`,
      );
    } catch (error) {
      this.logger.error('Error during unused cache cleanup:', error);
    }
  }

  /**
   * Log de estadísticas del caché cada 6 horas
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async logCacheStats() {
    try {
      const stats = await this.cacheService.getCacheStats();
      this.logger.log(
        `Cache stats - Total: ${stats.total}, Expired: ${stats.expired}, Avg Hits: ${stats.avgHits.toFixed(2)}`,
      );
    } catch (error) {
      this.logger.error('Error logging cache stats:', error);
    }
  }
}
