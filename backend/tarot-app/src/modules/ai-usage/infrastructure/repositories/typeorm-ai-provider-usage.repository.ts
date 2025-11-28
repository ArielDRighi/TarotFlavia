import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIProviderUsage } from '../../entities/ai-provider-usage.entity';
import { AIProvider } from '../../entities/ai-usage-log.entity';
import { IAIProviderUsageRepository } from '../../domain/interfaces/ai-provider-usage-repository.interface';
import { startOfMonth } from 'date-fns';

@Injectable()
export class TypeOrmAIProviderUsageRepository
  implements IAIProviderUsageRepository
{
  private readonly logger = new Logger(TypeOrmAIProviderUsageRepository.name);

  constructor(
    @InjectRepository(AIProviderUsage)
    private readonly repository: Repository<AIProviderUsage>,
  ) {}

  async findOrCreate(
    provider: AIProvider,
    month: Date,
  ): Promise<AIProviderUsage> {
    const monthStart = startOfMonth(month);

    let usage = await this.repository.findOne({
      where: { provider, month: monthStart as any },
    });

    if (!usage) {
      usage = this.repository.create({
        provider,
        month: monthStart,
        requestsCount: 0,
        tokensUsed: '0',
        costUsd: 0,
        monthlyLimitUsd: this.getDefaultLimit(provider),
        limitReached: false,
      });
      usage = await this.repository.save(usage);
      this.logger.log(
        `Created new usage record for ${provider} - ${monthStart.toISOString()}`,
      );
    }

    return usage;
  }

  async updateUsage(
    id: number,
    requestsCount: number,
    tokensUsed: string,
    costUsd: number,
  ): Promise<AIProviderUsage> {
    await this.repository.update(id, {
      requestsCount,
      tokensUsed,
      costUsd,
    });

    const updated = await this.repository.findOne({ where: { id } });
    if (!updated) {
      throw new Error(`AIProviderUsage with ID ${id} not found after update`);
    }

    return updated;
  }

  async hasReachedLimit(provider: AIProvider, month: Date): Promise<boolean> {
    const usage = await this.getCurrentMonthUsage(provider);
    if (!usage) {
      return false;
    }

    return usage.costUsd >= usage.monthlyLimitUsd || usage.limitReached;
  }

  async getCurrentMonthUsage(
    provider: AIProvider,
  ): Promise<AIProviderUsage | null> {
    const monthStart = startOfMonth(new Date());

    return this.repository.findOne({
      where: { provider, month: monthStart as any },
    });
  }

  async findByMonth(month: Date): Promise<AIProviderUsage[]> {
    const monthStart = startOfMonth(month);

    return this.repository.find({
      where: { month: monthStart as any },
      order: { provider: 'ASC' },
    });
  }

  async resetMonthlyLimits(): Promise<void> {
    await this.repository.update(
      {},
      {
        requestsCount: 0,
        tokensUsed: '0',
        costUsd: 0,
        limitReached: false,
      },
    );

    this.logger.log('Monthly limits reset for all providers');
  }

  private getDefaultLimit(provider: AIProvider): number {
    // Default monthly limits in USD
    const limits = {
      [AIProvider.GROQ]: 0, // Free
      [AIProvider.DEEPSEEK]: 10,
      [AIProvider.OPENAI]: 50,
      [AIProvider.GEMINI]: 0, // Free
    };

    return limits[provider] || 0;
  }
}
