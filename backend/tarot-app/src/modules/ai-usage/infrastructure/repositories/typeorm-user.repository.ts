import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
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
    const user = await this.repository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
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
    const users = await this.repository.find({
      where: { plan: UserPlan.FREE },
    });

    // Filter users who have reached 80% of their quota
    return users.filter((user) => {
      const quota = AI_MONTHLY_QUOTAS[user.plan];
      const percentageUsed = (user.aiRequestsUsedMonth / quota.hardLimit) * 100;
      return percentageUsed >= 80;
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
