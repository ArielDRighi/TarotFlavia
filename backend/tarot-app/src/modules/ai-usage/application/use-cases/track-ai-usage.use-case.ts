import { Injectable, Inject, Logger } from '@nestjs/common';
import {
  IAIUsageLogRepository,
  CreateAIUsageLogDto,
} from '../../domain/interfaces/ai-usage-log-repository.interface';
import { AI_USAGE_LOG_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { AIUsageLog } from '../../entities/ai-usage-log.entity';

/**
 * Use case: Track AI Usage
 * Creates a log entry for each AI API call
 */
@Injectable()
export class TrackAIUsageUseCase {
  private readonly logger = new Logger(TrackAIUsageUseCase.name);

  constructor(
    @Inject(AI_USAGE_LOG_REPOSITORY)
    private readonly aiUsageLogRepo: IAIUsageLogRepository,
  ) {}

  async execute(data: CreateAIUsageLogDto): Promise<AIUsageLog> {
    this.logger.debug(
      `Tracking AI usage: ${data.provider} - ${data.modelUsed} - ${data.status}`,
    );

    return this.aiUsageLogRepo.createLog(data);
  }
}
