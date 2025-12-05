import { User } from '../../../users/entities/user.entity';

/**
 * Repository interface for User operations needed by AI Usage module
 * Follows Repository Pattern from ADR-003
 */
export interface IUserRepository {
  /**
   * Find a user by ID
   */
  findById(id: number): Promise<User | null>;

  /**
   * Increment AI requests counter for current month
   */
  incrementAIRequestsMonth(userId: number): Promise<void>;

  /**
   * Reset AI requests counter for all users (monthly cron)
   */
  resetMonthlyAIRequests(): Promise<void>;

  /**
   * Get users who are approaching their quota limit (80%)
   */
  findUsersApproachingQuota(): Promise<User[]>;

  /**
   * Update user's warning flag
   */
  updateQuotaWarning(userId: number, warned: boolean): Promise<void>;
}
