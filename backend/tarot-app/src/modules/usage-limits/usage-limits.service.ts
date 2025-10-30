import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageLimit, UsageFeature } from './entities/usage-limit.entity';
import { UsersService } from '../users/users.service';
import { USAGE_LIMITS, USAGE_RETENTION_DAYS } from './usage-limits.constants';

@Injectable()
export class UsageLimitsService {
  constructor(
    @InjectRepository(UsageLimit)
    private usageLimitRepository: Repository<UsageLimit>,
    private usersService: UsersService,
  ) {}

  async checkLimit(userId: number, feature: UsageFeature): Promise<boolean> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const limit = USAGE_LIMITS[user.plan]?.[feature];
    if (limit === undefined) {
      throw new Error('Invalid feature for this plan');
    }

    // Premium users have unlimited access
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

    const usageRecord = await this.usageLimitRepository.findOne({
      where: {
        userId,
        feature,
        date: today,
      },
    });

    if (usageRecord) {
      usageRecord.count += 1;
      return await this.usageLimitRepository.save(usageRecord);
    } else {
      const newRecord = this.usageLimitRepository.create({
        userId,
        feature,
        date: today,
        count: 1,
      });
      return await this.usageLimitRepository.save(newRecord);
    }
  }

  async getRemainingUsage(
    userId: number,
    feature: UsageFeature,
  ): Promise<number> {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const limit = USAGE_LIMITS[user.plan]?.[feature];
    if (limit === undefined) {
      throw new Error('Invalid feature for this plan');
    }

    // Premium users have unlimited access
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
