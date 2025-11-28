import { Injectable, Inject, Logger, ForbiddenException } from '@nestjs/common';
import { IUserRepository } from '../../domain/interfaces/user-repository.interface';
import { USER_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { UserPlan } from '../../../users/entities/user.entity';
import { AI_MONTHLY_QUOTAS } from '../../constants/ai-usage.constants';

export interface QuotaInfo {
  quotaLimit: number;
  requestsUsed: number;
  requestsRemaining: number;
  percentageUsed: number;
  resetDate: Date;
  warningTriggered: boolean;
  plan: UserPlan;
}

/**
 * Use case: Check User Quota
 * Verifies if user has remaining AI quota for the current month
 */
@Injectable()
export class CheckUserQuotaUseCase {
  private readonly logger = new Logger(CheckUserQuotaUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: IUserRepository,
  ) {}

  /**
   * Check if user has quota available
   * @throws ForbiddenException if quota exceeded
   */
  async execute(userId: number): Promise<boolean> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    // PREMIUM and PROFESSIONAL users have unlimited quota
    if (user.plan === UserPlan.PREMIUM || user.plan === UserPlan.PROFESSIONAL) {
      return true;
    }

    const quota = AI_MONTHLY_QUOTAS[user.plan];
    const hasQuotaAvailable = user.aiRequestsUsedMonth < quota.hardLimit;

    if (!hasQuotaAvailable) {
      this.logger.warn(
        `User ${userId} has exceeded monthly quota: ${user.aiRequestsUsedMonth}/${quota.hardLimit}`,
      );
      throw new ForbiddenException(
        `Monthly AI quota exceeded. Used ${user.aiRequestsUsedMonth}/${quota.hardLimit} requests.`,
      );
    }

    return true;
  }

  /**
   * Get detailed quota information for a user
   */
  async getQuotaInfo(userId: number): Promise<QuotaInfo> {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new Error(`User ${userId} not found`);
    }

    const quota = AI_MONTHLY_QUOTAS[user.plan];
    const isPremium =
      user.plan === UserPlan.PREMIUM || user.plan === UserPlan.PROFESSIONAL;

    const resetDate = this.getNextMonthStart();
    const requestsUsed = user.aiRequestsUsedMonth;
    const quotaLimit = isPremium ? -1 : quota.hardLimit;
    const requestsRemaining = isPremium ? -1 : quota.hardLimit - requestsUsed;
    const percentageUsed = isPremium
      ? 0
      : (requestsUsed / quota.hardLimit) * 100;

    return {
      quotaLimit,
      requestsUsed,
      requestsRemaining,
      percentageUsed,
      resetDate,
      warningTriggered: false, // TODO: Implement when field is added to User entity
      plan: user.plan,
    };
  }

  private getNextMonthStart(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }
}
