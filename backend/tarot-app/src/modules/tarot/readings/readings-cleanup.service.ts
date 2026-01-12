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
   * Ejecuta limpieza de lecturas segun politica de retencion
   * Se ejecuta diariamente a las 4 AM UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async runDailyCleanup() {
    this.logger.log('Starting daily readings cleanup...');

    try {
      // 1. Hard-delete lecturas soft-deleted hace mas de 30 dias
      const hardDeleted = await this.orchestrator.cleanupOldDeletedReadings();
      this.logger.log(`Hard-deleted ${hardDeleted} readings from trash`);

      // 2. Archivar lecturas antiguas de usuarios FREE (30 dias)
      const archivedFree = await this.orchestrator.archiveOldReadings(
        UserPlan.FREE,
        READING_RETENTION_DAYS[UserPlan.FREE],
      );
      this.logger.log(`Archived ${archivedFree} old readings from FREE users`);

      // 3. Archivar lecturas antiguas de usuarios PREMIUM (1 ano)
      const archivedPremium = await this.orchestrator.archiveOldReadings(
        UserPlan.PREMIUM,
        READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
      this.logger.log(
        `Archived ${archivedPremium} old readings from PREMIUM users`,
      );

      this.logger.log('Daily readings cleanup completed successfully');
    } catch (error) {
      this.logger.error('Error during readings cleanup:', error);
    }
  }

  /**
   * Ejecuta limpieza de lecturas eliminadas hace más de 30 días
   * Se ejecuta diariamente a las 4 AM
   * @deprecated Use runDailyCleanup instead - this method is kept for backward compatibility
   */
  @Cron(CronExpression.EVERY_DAY_AT_4AM)
  async cleanupOldDeletedReadings() {
    // This cron is now handled by runDailyCleanup
    // Keeping method for backward compatibility but it won't execute twice
    // as both crons will run at the same time
  }
}
