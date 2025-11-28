import { Injectable, Inject, Logger } from '@nestjs/common';
import { IAIProviderUsageRepository } from '../../domain/interfaces/ai-provider-usage-repository.interface';
import { AI_PROVIDER_USAGE_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { AIProvider } from '../../entities/ai-usage-log.entity';

/**
 * Use case: Track Provider Usage and Costs
 * Updates usage metrics and enforces provider cost limits
 */
@Injectable()
export class TrackProviderUsageUseCase {
  private readonly logger = new Logger(TrackProviderUsageUseCase.name);

  constructor(
    @Inject(AI_PROVIDER_USAGE_REPOSITORY)
    private readonly providerUsageRepo: IAIProviderUsageRepository,
  ) {}

  async execute(
    provider: AIProvider,
    tokens: number,
    cost: number,
  ): Promise<void> {
    const now = new Date();
    const usage = await this.providerUsageRepo.findOrCreate(provider, now);

    const newTokensUsed = (
      BigInt(usage.tokensUsed) + BigInt(tokens)
    ).toString();
    const newCost = usage.costUsd + cost;
    const newRequestsCount = usage.requestsCount + 1;

    await this.providerUsageRepo.updateUsage(
      usage.id,
      newRequestsCount,
      newTokensUsed,
      newCost,
    );

    this.logger.debug(
      `Provider ${provider} usage updated: ${newRequestsCount} requests, ${newTokensUsed} tokens, $${newCost.toFixed(4)}`,
    );
  }
}
