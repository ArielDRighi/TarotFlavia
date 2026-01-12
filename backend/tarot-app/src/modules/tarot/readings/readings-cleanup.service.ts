import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ReadingsOrchestratorService } from './application/services/readings-orchestrator.service';
import { UserPlan } from '../../users/entities/user.entity';
import { READING_RETENTION_DAYS } from './readings.constants';

@Injectable()
export class ReadingsCleanupService {
  private readonly logger = new Logger(ReadingsCleanupService.name);

  constructor(private readonly orchestrator: ReadingsOrchestratorService) {}

  /**
   * Ejecuta limpieza de lecturas según política de retención
   * Se ejecuta diariamente a las 4 AM UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async runDailyCleanup() {
    this.logger.log('Starting daily readings cleanup...');

    // 1. Hard-delete lecturas soft-deleted hace más de 30 días
    try {
      const hardDeleted = await this.orchestrator.cleanupOldDeletedReadings();
      this.logger.log(`Hard-deleted ${hardDeleted} readings from trash`);
    } catch (error) {
      this.logger.error('Error during hard-delete cleanup:', error);
    }

    // 2. Archivar lecturas antiguas de usuarios FREE (30 días)
    try {
      const archivedFree = await this.orchestrator.archiveOldReadings(
        UserPlan.FREE,
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      this.logger.log(`Archived ${archivedFree} old readings from FREE users`);
    } catch (error) {
      this.logger.error('Error archiving FREE user readings:', error);
    }

    // 3. Archivar lecturas antiguas de usuarios PREMIUM (1 año)
    try {
      const archivedPremium = await this.orchestrator.archiveOldReadings(
        UserPlan.PREMIUM,
        READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
      this.logger.log(
        `Archived ${archivedPremium} old readings from PREMIUM users`,
      );
    } catch (error) {
      this.logger.error('Error archiving PREMIUM user readings:', error);
    }

    this.logger.log('Daily readings cleanup completed successfully');
  }

  /**
   * @deprecated Use runDailyCleanup instead - this method is kept for backward compatibility
   *             and is no longer scheduled as a cron job.
   */
  async cleanupOldDeletedReadings() {
    // This logic is now handled by runDailyCleanup.
    // Method kept for backward compatibility, but it is not scheduled anymore.
    await this.runDailyCleanup();
  }
}
