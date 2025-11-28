import { Injectable, Logger } from '@nestjs/common';
import { TrackAIUsageUseCase } from '../use-cases/track-ai-usage.use-case';
import { GetAIUsageStatisticsUseCase } from '../use-cases/get-ai-usage-statistics.use-case';
import {
  CheckUserQuotaUseCase,
  QuotaInfo,
} from '../use-cases/check-user-quota.use-case';
import { TrackProviderUsageUseCase } from '../use-cases/track-provider-usage.use-case';
import { IncrementUserAIRequestsUseCase } from '../use-cases/increment-user-ai-requests.use-case';
import {
  CreateAIUsageLogDto,
  AIUsageStatistics,
} from '../../domain/interfaces/ai-usage-log-repository.interface';
import { AIUsageLog, AIProvider } from '../../entities/ai-usage-log.entity';

/**
 * AI Usage Orchestrator Service
 * Facade pattern that coordinates all AI usage operations
 * Delegates to specific use cases for each operation
 */
@Injectable()
export class AIUsageOrchestratorService {
  private readonly logger = new Logger(AIUsageOrchestratorService.name);

  constructor(
    private readonly trackAIUsageUseCase: TrackAIUsageUseCase,
    private readonly getStatisticsUseCase: GetAIUsageStatisticsUseCase,
    private readonly checkQuotaUseCase: CheckUserQuotaUseCase,
    private readonly trackProviderUsageUseCase: TrackProviderUsageUseCase,
    private readonly incrementUserRequestsUseCase: IncrementUserAIRequestsUseCase,
  ) {}

  /**
   * Track an AI API call with usage details
   */
  async trackUsage(data: CreateAIUsageLogDto): Promise<AIUsageLog> {
    return this.trackAIUsageUseCase.execute(data);
  }

  /**
   * Get aggregated AI usage statistics
   */
  async getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageStatistics[]> {
    return this.getStatisticsUseCase.execute(startDate, endDate);
  }

  /**
   * Check if user has remaining AI quota
   * @throws ForbiddenException if quota exceeded
   */
  async checkUserQuota(userId: number): Promise<boolean> {
    return this.checkQuotaUseCase.execute(userId);
  }

  /**
   * Get detailed quota information for a user
   */
  async getQuotaInfo(userId: number): Promise<QuotaInfo> {
    return this.checkQuotaUseCase.getQuotaInfo(userId);
  }

  /**
   * Track provider-level usage and costs
   */
  async trackProviderUsage(
    provider: AIProvider,
    tokens: number,
    cost: number,
  ): Promise<void> {
    return this.trackProviderUsageUseCase.execute(provider, tokens, cost);
  }

  /**
   * Increment user's AI requests counter
   */
  async incrementUserRequests(userId: number): Promise<void> {
    return this.incrementUserRequestsUseCase.execute(userId);
  }
}
