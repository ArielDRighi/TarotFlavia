import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IAIUsageLogRepository,
  AIUsageStatistics,
} from '../../domain/interfaces/ai-usage-log-repository.interface';
import { AI_USAGE_LOG_REPOSITORY } from '../../domain/interfaces/repository.tokens';

/**
 * Use case: Get AI Usage Statistics
 * Retrieves aggregated statistics for AI usage by provider
 */
@Injectable()
export class GetAIUsageStatisticsUseCase {
  private readonly logger = new Logger(GetAIUsageStatisticsUseCase.name);

  constructor(
    @Inject(AI_USAGE_LOG_REPOSITORY)
    private readonly aiUsageLogRepo: IAIUsageLogRepository,
  ) {}

  async execute(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageStatistics[]> {
    const start = startDate?.toISOString() ?? 'beginning';
    const end = endDate?.toISOString() ?? 'now';
    this.logger.debug(`Getting AI usage statistics from ${start} to ${end}`);

    return this.aiUsageLogRepo.getStatistics(startDate, endDate);
  }
}
