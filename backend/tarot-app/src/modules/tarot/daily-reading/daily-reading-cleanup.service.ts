import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, IsNull } from 'typeorm';
import { DailyReading } from './entities/daily-reading.entity';
import { UserPlan } from '../../users/entities/user.entity';
import { DAILY_READING_RETENTION_DAYS } from '../readings/readings.constants';

@Injectable()
export class DailyReadingCleanupService {
  private readonly logger = new Logger(DailyReadingCleanupService.name);

  constructor(
    @InjectRepository(DailyReading)
    private readonly dailyReadingRepo: Repository<DailyReading>,
  ) {}

  /**
   * Limpia cartas del dia antiguas según política de retención
   * Se ejecuta diariamente a las 5 AM UTC (despues de readings cleanup)
   */
  @Cron(CronExpression.EVERY_DAY_AT_5AM)
  async cleanupOldDailyReadings() {
    this.logger.log('Starting daily readings retention cleanup...');

    try {
      // 1. Limpiar lecturas de usuarios anonimos (solo mantener las del dia)
      const anonymousDeleted = await this.cleanupAnonymous();
      this.logger.log(
        `Deleted ${anonymousDeleted} old anonymous daily readings`,
      );

      // 2. Limpiar lecturas de usuarios FREE (30 días)
      const freeDeleted = await this.cleanupByUserPlan(
        UserPlan.FREE,
        DAILY_READING_RETENTION_DAYS[UserPlan.FREE],
      );
      this.logger.log(`Deleted ${freeDeleted} old FREE user daily readings`);

      // 3. Limpiar lecturas de usuarios PREMIUM (1 año)
      const premiumDeleted = await this.cleanupByUserPlan(
        UserPlan.PREMIUM,
        DAILY_READING_RETENTION_DAYS[UserPlan.PREMIUM],
      );
      this.logger.log(
        `Deleted ${premiumDeleted} old PREMIUM user daily readings`,
      );

      this.logger.log('Daily readings retention cleanup completed');
    } catch (error) {
      this.logger.error('Error during daily readings cleanup:', error);
    }
  }

  private async cleanupAnonymous(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1);

    const result = await this.dailyReadingRepo.delete({
      userId: IsNull(),
      readingDate: LessThan(cutoffDate),
    });

    return result.affected || 0;
  }

  private async cleanupByUserPlan(
    plan: UserPlan,
    retentionDays: number,
  ): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const result = await this.dailyReadingRepo
      .createQueryBuilder('daily')
      .leftJoin('daily.user', 'user')
      .delete()
      .where('user.plan = :plan', { plan })
      .andWhere('daily.readingDate < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
