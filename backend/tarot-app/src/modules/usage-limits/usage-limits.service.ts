import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageLimit, UsageFeature } from './entities/usage-limit.entity';
import { UsersService } from '../users/users.service';
import { PlanConfigService } from '../plan-config/plan-config.service';
import { USAGE_RETENTION_DAYS, USAGE_LIMITS } from './usage-limits.constants';
import {
  getTodayUTCDateString,
  getDateDaysAgoUTCString,
} from '../../common/utils/date.utils';

@Injectable()
export class UsageLimitsService {
  constructor(
    @InjectRepository(UsageLimit)
    private usageLimitRepository: Repository<UsageLimit>,
    private usersService: UsersService,
    private planConfigService: PlanConfigService,
  ) {}

  /**
   * Gets the usage limit for a user and feature based on their plan.
   */
  private async getLimit(
    userId: number,
    feature: UsageFeature,
  ): Promise<number> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (feature === UsageFeature.DAILY_CARD) {
      return this.planConfigService.getDailyCardLimit(user.plan);
    }

    if (feature === UsageFeature.TAROT_READING) {
      return this.planConfigService.getTarotReadingsLimit(user.plan);
    }

    // For other features (ORACLE_QUERY, INTERPRETATION_REGENERATION), fall back to constants
    const limit = USAGE_LIMITS[user.plan]?.[feature];
    if (limit === undefined) {
      throw new BadRequestException(
        `Invalid feature '${feature}' for plan '${user.plan}'`,
      );
    }
    return limit;
  }

  /**
   * Gets the usage record for today.
   */
  private async getTodayUsageRecord(
    userId: number,
    feature: UsageFeature,
  ): Promise<UsageLimit | null> {
    const todayStr = getTodayUTCDateString();
    return this.usageLimitRepository.findOne({
      where: {
        userId,
        feature,
        date: todayStr,
      },
    });
  }

  async checkLimit(userId: number, feature: UsageFeature): Promise<boolean> {
    const limit = await this.getLimit(userId, feature);

    // Unlimited access (-1)
    if (limit === -1) {
      return true;
    }

    const usageRecord = await this.getTodayUsageRecord(userId, feature);
    const currentCount = usageRecord?.count || 0;
    return currentCount < limit;
  }

  async getUsage(userId: number, feature: UsageFeature): Promise<number> {
    const usageRecord = await this.getTodayUsageRecord(userId, feature);
    return usageRecord?.count || 0;
  }

  /**
   * Gets usage for a specific period (daily, monthly, or lifetime)
   */
  async getUsageByPeriod(
    userId: number,
    feature: UsageFeature,
    period: 'daily' | 'monthly' | 'lifetime',
  ): Promise<number> {
    if (period === 'daily') {
      // Para período diario, usar el método existente
      return this.getUsage(userId, feature);
    }

    let startDate: string;
    if (period === 'monthly') {
      // Calcular primer día del mes actual
      const now = new Date();
      const firstDayOfMonth = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0),
      );
      startDate = firstDayOfMonth.toISOString().split('T')[0];
    } else {
      // lifetime: desde el inicio de los tiempos
      startDate = '1970-01-01';
    }

    // Sumar todos los registros desde la fecha de inicio
    const result = await this.usageLimitRepository
      .createQueryBuilder('usage')
      .select('SUM(usage.count)', 'total')
      .where('usage.userId = :userId', { userId })
      .andWhere('usage.feature = :feature', { feature })
      .andWhere('usage.date >= :startDate', { startDate })
      .getRawOne<{ total: string }>();

    return parseInt(result?.total || '0', 10);
  }

  async incrementUsage(
    userId: number,
    feature: UsageFeature,
  ): Promise<UsageLimit> {
    const todayStr = getTodayUTCDateString();

    // First, try to create a new record (if it doesn't exist)
    // This leverages the unique constraint on (userId, feature, date)
    try {
      await this.usageLimitRepository
        .createQueryBuilder()
        .insert()
        .into(UsageLimit)
        .values({
          userId,
          feature,
          date: todayStr,
          count: 0, // Start at 0, will be incremented below
        })
        .orIgnore() // If record exists, do nothing
        .execute();
    } catch {
      // Ignore unique constraint violations (record already exists)
    }

    // Now atomically increment the count
    await this.usageLimitRepository
      .createQueryBuilder()
      .update(UsageLimit)
      .set({ count: () => '"count" + 1' })
      .where('userId = :userId', { userId })
      .andWhere('feature = :feature', { feature })
      .andWhere('date = :date', { date: todayStr })
      .execute();

    // Return the updated record
    const updatedRecord = await this.getTodayUsageRecord(userId, feature);
    if (!updatedRecord) {
      throw new Error('Failed to increment usage - record not found');
    }

    return updatedRecord;
  }

  async getRemainingUsage(
    userId: number,
    feature: UsageFeature,
  ): Promise<number> {
    const limit = await this.getLimit(userId, feature);

    // Unlimited access (-1)
    if (limit === -1) {
      return -1;
    }

    const usageRecord = await this.getTodayUsageRecord(userId, feature);
    const currentCount = usageRecord?.count || 0;
    return Math.max(0, limit - currentCount);
  }

  async cleanOldRecords(): Promise<number> {
    const cutoffDateStr = getDateDaysAgoUTCString(USAGE_RETENTION_DAYS);

    const result = await this.usageLimitRepository
      .createQueryBuilder()
      .delete()
      .where('date < :cutoffDate', { cutoffDate: cutoffDateStr })
      .execute();

    return result.affected || 0;
  }
}
