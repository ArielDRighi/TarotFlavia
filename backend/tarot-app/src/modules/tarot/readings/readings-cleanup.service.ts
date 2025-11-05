import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReadingsService } from './readings.service';

@Injectable()
export class ReadingsCleanupService {
  private readonly logger = new Logger(ReadingsCleanupService.name);

  constructor(private readonly readingsService: ReadingsService) {}

  /**
   * Ejecuta limpieza de lecturas eliminadas hace más de 30 días
   * Se ejecuta diariamente a las 4 AM
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cleanupOldDeletedReadings() {
    this.logger.log(
      'Starting cleanup of readings deleted more than 30 days ago...',
    );

    try {
      const deletedCount =
        await this.readingsService.cleanupOldDeletedReadings();

      if (deletedCount > 0) {
        this.logger.log(
          `Cleanup completed. Permanently deleted ${deletedCount} reading(s).`,
        );
      } else {
        this.logger.log('Cleanup completed. No readings to delete.');
      }
    } catch (error) {
      this.logger.error('Error during readings cleanup:', error);
    }
  }
}
