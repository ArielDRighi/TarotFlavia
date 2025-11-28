import {
  AIUsageLog,
  AIProvider,
  AIUsageStatus,
} from '../../entities/ai-usage-log.entity';

export interface CreateAIUsageLogDto {
  userId: number | null;
  readingId: number | null;
  provider: AIProvider;
  modelUsed: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  costUsd: number;
  durationMs: number;
  status: AIUsageStatus;
  errorMessage: string | null;
  fallbackUsed: boolean;
}

export interface AIUsageStatistics {
  provider: AIProvider;
  totalCalls: number;
  successCalls: number;
  errorCalls: number;
  cachedCalls: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
  errorRate: number;
  cacheHitRate: number;
  fallbackRate: number;
}

/**
 * Repository interface for AI Usage Log operations
 * Follows Repository Pattern from ADR-003
 */
export interface IAIUsageLogRepository {
  /**
   * Create a new AI usage log entry
   */
  createLog(data: CreateAIUsageLogDto): Promise<AIUsageLog>;

  /**
   * Get statistics for AI usage within a date range
   */
  getStatistics(startDate?: Date, endDate?: Date): Promise<AIUsageStatistics[]>;

  /**
   * Get total AI requests made by a user in current month
   */
  getTotalRequestsByUserThisMonth(userId: number): Promise<number>;

  /**
   * Get logs for a specific user with optional date filtering
   */
  findByUser(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageLog[]>;

  /**
   * Get logs for a specific provider with optional date filtering
   */
  findByProvider(
    provider: AIProvider,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageLog[]>;

  /**
   * Delete old logs (cleanup operation)
   */
  deleteOlderThan(date: Date): Promise<number>;
}
