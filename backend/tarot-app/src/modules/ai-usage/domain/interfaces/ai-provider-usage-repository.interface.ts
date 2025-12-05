import { AIProviderUsage } from '../../entities/ai-provider-usage.entity';
import { AIProvider } from '../../entities/ai-usage-log.entity';

/**
 * Repository interface for AI Provider Usage operations
 * Follows Repository Pattern from ADR-003
 */
export interface IAIProviderUsageRepository {
  /**
   * Find or create provider usage record for current month
   */
  findOrCreate(provider: AIProvider, month: Date): Promise<AIProviderUsage>;

  /**
   * Update usage statistics for a provider
   */
  updateUsage(
    id: number,
    requestsCount: number,
    tokensUsed: string,
    costUsd: number,
  ): Promise<AIProviderUsage>;

  /**
   * Check if provider has reached its monthly limit
   */
  hasReachedLimit(provider: AIProvider, month: Date): Promise<boolean>;

  /**
   * Get current month usage for a provider
   */
  getCurrentMonthUsage(provider: AIProvider): Promise<AIProviderUsage | null>;

  /**
   * Get all provider usages for a specific month
   */
  findByMonth(month: Date): Promise<AIProviderUsage[]>;

  /**
   * Reset monthly limits (admin operation)
   */
  resetMonthlyLimits(): Promise<void>;
}
