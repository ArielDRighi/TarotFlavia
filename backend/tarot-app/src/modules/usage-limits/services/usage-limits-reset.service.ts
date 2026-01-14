import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { UsageLimit } from '../entities/usage-limit.entity';
import { USAGE_RETENTION_DAYS } from '../usage-limits.constants';
import { getDateDaysAgoUTCString } from '../../../common/utils/date.utils';

/**
 * Service responsible for daily reset of usage limits.
 * Removes old usage records (older than USAGE_RETENTION_DAYS) at midnight UTC.
 *
 * This service implements the daily cleanup of usage_limit records,
 * allowing for analytics and historical data while preventing unlimited growth.
 */
@Injectable()
export class UsageLimitsResetService {
  private readonly logger = new Logger(UsageLimitsResetService.name);

  constructor(
    @InjectRepository(UsageLimit)
    private readonly usageLimitRepository: Repository<UsageLimit>,
  ) {}

  /**
   * Cron job that runs every day at midnight UTC.
   * Deletes usage limit records older than USAGE_RETENTION_DAYS (7 days).
   *
   * @cron EVERY_DAY_AT_MIDNIGHT (0 0 * * *)
   * @timezone UTC
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'daily-usage-limits-reset',
    timeZone: 'UTC',
  })
  async handleDailyReset(): Promise<void> {
    this.logger.log('Daily usage limits reset job started');

    try {
      const cutoffDateStr = getDateDaysAgoUTCString(USAGE_RETENTION_DAYS);

      const deleteResult = await this.usageLimitRepository.delete({
        date: LessThan(cutoffDateStr),
      });

      const deletedCount = deleteResult.affected || 0;
      this.logger.log(
        `Deleted ${deletedCount} usage limit records older than ${USAGE_RETENTION_DAYS} days`,
      );
    } catch (error) {
      this.logger.error(
        'Error during daily usage limits reset',
        error instanceof Error ? error.stack : String(error),
      );
      // Don't throw - we don't want to stop the app if cleanup fails
    }
  }

  /**
   * Gets statistics about records that would be deleted.
   * Useful for monitoring and debugging.
   *
   * @returns Object with count of records to delete and retention period
   */
  async getRetentionStats(): Promise<{
    recordsToDelete: number;
    retentionDays: number;
  }> {
    const cutoffDateStr = getDateDaysAgoUTCString(USAGE_RETENTION_DAYS);

    const count = await this.usageLimitRepository.count({
      where: {
        date: LessThan(cutoffDateStr),
      },
    });

    return {
      recordsToDelete: count,
      retentionDays: USAGE_RETENTION_DAYS,
    };
  }
}
