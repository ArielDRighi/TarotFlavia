import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserPlan } from '../../modules/users/entities/user.entity';
import { UsersService } from '../../modules/users/users.service';

export interface PlanLimits {
  requestsPerHour: number;
  requestsPerMinute: number;
  regenerationsPerReading: number;
}

export interface RateLimitStatus {
  plan: string;
  limits: PlanLimits;
  usage: {
    requestsThisHour: number;
    requestsThisMinute: number;
    remaining: {
      hour: number;
      minute: number;
    };
  };
  resetAt: {
    hour: number | null;
    minute: number | null;
  };
}

/**
 * Service to manage rate limiting status and plan-based limits
 */
@Injectable()
export class RateLimitService {
  private readonly logger = new Logger(RateLimitService.name);

  constructor(private readonly usersService: UsersService) {}

  /**
   * Get rate limit configuration for a specific plan
   */
  getPlanLimits(plan: UserPlan, isAdmin: boolean): PlanLimits {
    if (isAdmin) {
      return {
        requestsPerHour: Infinity,
        requestsPerMinute: Infinity,
        regenerationsPerReading: Infinity,
      };
    }

    switch (plan) {
      case UserPlan.PREMIUM:
        return {
          requestsPerHour: 300,
          requestsPerMinute: 200,
          regenerationsPerReading: 3,
        };
      case UserPlan.FREE:
      default:
        return {
          requestsPerHour: 60,
          requestsPerMinute: 100,
          regenerationsPerReading: 0,
        };
    }
  }

  /**
   * Get current rate limit status for a user
   * @param userId - User ID
   */
  async getRateLimitStatus(userId: number): Promise<RateLimitStatus> {
    const user = await this.usersService.findById(userId);

    if (!user) {
      throw new NotFoundException(`User ${userId} not found`);
    }

    const isAdmin = user.isAdmin || false;
    const plan = isAdmin ? 'ADMIN' : user.plan;
    const limits = this.getPlanLimits(user.plan, isAdmin);

    // If admin, return unlimited status
    if (isAdmin) {
      return {
        plan,
        limits,
        usage: {
          requestsThisHour: 0,
          requestsThisMinute: 0,
          remaining: {
            hour: Infinity,
            minute: Infinity,
          },
        },
        resetAt: {
          hour: null,
          minute: null,
        },
      };
    }

    // Get usage from throttler storage
    // TODO: Implement actual usage tracking
    // For now, return 0 usage (MVP version - shows limits only)
    const requestsThisHour = 0;
    const requestsThisMinute = 0;

    // Calculate reset times
    const nextHour = new Date();
    nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);

    const nextMinute = new Date();
    nextMinute.setMinutes(nextMinute.getMinutes() + 1, 0, 0);

    return {
      plan,
      limits,
      usage: {
        requestsThisHour,
        requestsThisMinute,
        remaining: {
          hour: Math.max(0, limits.requestsPerHour - requestsThisHour),
          minute: Math.max(0, limits.requestsPerMinute - requestsThisMinute),
        },
      },
      resetAt: {
        hour: nextHour.getTime(),
        minute: nextMinute.getTime(),
      },
    };
  }
}
