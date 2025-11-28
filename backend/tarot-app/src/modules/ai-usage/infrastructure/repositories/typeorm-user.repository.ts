import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { User, UserPlan } from '../../../users/entities/user.entity';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { AI_MONTHLY_QUOTAS } from '../../constants/ai-usage.constants';

@Injectable()
export class TypeOrmUserRepository implements IUserRepository {
  private readonly logger = new Logger(TypeOrmUserRepository.name);

  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async findById(id: number): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  async incrementAIRequestsMonth(userId: number): Promise<void> {
    await this.repository.increment({ id: userId }, 'aiRequestsUsedMonth', 1);
    this.logger.debug(`Incremented AI requests for user ${userId}`);
  }

  async resetMonthlyAIRequests(): Promise<void> {
    await this.repository.update({}, { aiRequestsUsedMonth: 0 });
    this.logger.log('Monthly AI requests reset for all users');
  }

  async findUsersApproachingQuota(): Promise<User[]> {
    const quota = AI_MONTHLY_QUOTAS[UserPlan.FREE];
    const threshold = Math.floor(quota.hardLimit * 0.8);

    return this.repository.find({
      where: {
        plan: UserPlan.FREE,
        aiRequestsUsedMonth: MoreThanOrEqual(threshold),
      },
    });
  }

  updateQuotaWarning(userId: number, warned: boolean): Promise<void> {
    // Note: quotaWarningTriggered field needs to be added to User entity
    // For now, we'll just log it
    this.logger.debug(
      `Quota warning for user ${userId}: ${warned} (field not yet in entity)`,
    );
    return Promise.resolve();
  }
}
