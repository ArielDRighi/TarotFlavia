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

@Injectable()
export class UsageLimitsService {
  constructor(
    @InjectRepository(UsageLimit)
    private usageLimitRepository: Repository<UsageLimit>,
    private usersService: UsersService,
    private planConfigService: PlanConfigService,
  ) {}

  async checkLimit(userId: number, feature: UsageFeature): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get limit from database configuration (dynamic)
    let limit: number;
    if (feature === UsageFeature.TAROT_READING) {
      limit = await this.planConfigService.getReadingsLimit(user.plan);
    } else {
      // For other features, fall back to constants for now
      // TODO: Add AI quota and other features to plan-config
      limit = USAGE_LIMITS[user.plan]?.[feature];
      if (limit === undefined) {
        throw new BadRequestException(
          `Invalid feature '${feature}' for plan '${user.plan}'`,
        );
      }
    }

    // Premium/Professional users have unlimited access (-1)
    if (limit === -1) {
      return true;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageRecord = await this.usageLimitRepository.findOne({
      where: {
        userId,
        feature,
        date: today,
      },
    });

    const currentCount = usageRecord?.count || 0;
    return currentCount < limit;
  }

  async incrementUsage(
    userId: number,
    feature: UsageFeature,
  ): Promise<UsageLimit> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
          date: today,
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
      .andWhere('date = :date', { date: today })
      .execute();

    // Return the updated record
    const updatedRecord = await this.usageLimitRepository.findOne({
      where: {
        userId,
        feature,
        date: today,
      },
    });

    if (!updatedRecord) {
      throw new Error('Failed to increment usage - record not found');
    }

    return updatedRecord;
  }

  async getRemainingUsage(
    userId: number,
    feature: UsageFeature,
  ): Promise<number> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get limit from database configuration (dynamic)
    let limit: number;
    if (feature === UsageFeature.TAROT_READING) {
      limit = await this.planConfigService.getReadingsLimit(user.plan);
    } else {
      // For other features, fall back to constants for now
      // TODO: Add AI quota and other features to plan-config
      limit = USAGE_LIMITS[user.plan]?.[feature];
      if (limit === undefined) {
        throw new BadRequestException(
          `Invalid feature '${feature}' for plan '${user.plan}'`,
        );
      }
    }

    // Premium/Professional users have unlimited access (-1)
    if (limit === -1) {
      return -1;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usageRecord = await this.usageLimitRepository.findOne({
      where: {
        userId,
        feature,
        date: today,
      },
    });

    const currentCount = usageRecord?.count || 0;
    return Math.max(0, limit - currentCount);
  }

  async cleanOldRecords(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - USAGE_RETENTION_DAYS);
    cutoffDate.setHours(0, 0, 0, 0);

    const result = await this.usageLimitRepository
      .createQueryBuilder()
      .delete()
      .where('date < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }
}
