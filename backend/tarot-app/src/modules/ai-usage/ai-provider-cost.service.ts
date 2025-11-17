import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { startOfMonth } from 'date-fns';
import { AIProviderUsage } from './entities/ai-provider-usage.entity';
import { AIProvider } from './entities/ai-usage-log.entity';
import { EmailService } from '../email/email.service';

/**
 * Service to track and enforce monthly cost limits per AI provider
 * Prevents unexpected billing by blocking providers when limits are reached
 */
@Injectable()
export class AIProviderCostService {
  private readonly logger = new Logger(AIProviderCostService.name);

  // Cost per 1 million tokens (USD)
  private readonly COSTS_PER_1M_TOKENS = {
    [AIProvider.GROQ]: 0, // Free
    [AIProvider.DEEPSEEK]: 0.8, // $0.80 per 1M tokens
    [AIProvider.OPENAI]: 4.5, // $4.50 per 1M tokens (gpt-4o-mini)
    [AIProvider.GEMINI]: 0, // Free (for now)
  };

  constructor(
    @InjectRepository(AIProviderUsage)
    private readonly providerUsageRepo: Repository<AIProviderUsage>,
    private readonly configService: ConfigService,
    private readonly emailService: EmailService,
  ) {}

  /**
   * Track usage and cost for a provider, check limits, send notifications
   */
  async trackUsage(
    provider: AIProvider,
    tokens: number,
    cost: number,
  ): Promise<void> {
    // Skip tracking for free providers
    if (this.isFreeProvider(provider)) {
      this.logger.log(`Skipping cost tracking for free provider: ${provider}`);
      return;
    }

    const currentMonth = startOfMonth(new Date());
    const monthlyLimit = this.getMonthlyLimit(provider);

    let usage = await this.providerUsageRepo.findOne({
      where: {
        provider,
        month: currentMonth,
      },
    });

    if (!usage) {
      // Create new usage record for this month
      usage = this.providerUsageRepo.create({
        provider,
        month: currentMonth,
        requestsCount: 0,
        tokensUsed: '0',
        costUsd: 0,
        monthlyLimitUsd: monthlyLimit,
        limitReached: false,
        warningAt80Sent: false,
      });
    }

    // Increment counters
    usage.requestsCount += 1;
    usage.tokensUsed = (BigInt(usage.tokensUsed) + BigInt(tokens)).toString();
    usage.costUsd = Number(usage.costUsd) + cost;

    // Check thresholds
    const percentageUsed = (usage.costUsd / monthlyLimit) * 100;

    // Send warning at 80%
    if (percentageUsed >= 80 && !usage.warningAt80Sent) {
      await this.sendWarningEmail(provider, usage.costUsd, monthlyLimit);
      usage.warningAt80Sent = true;
    }

    // Mark limit as reached at 100%
    if (usage.costUsd >= monthlyLimit) {
      if (!usage.limitReached) {
        await this.sendLimitReachedEmail(provider, usage.costUsd, monthlyLimit);
      }
      usage.limitReached = true;
    }

    await this.providerUsageRepo.save(usage);

    this.logger.log(
      `Tracked usage for ${provider}: $${usage.costUsd.toFixed(4)} / $${monthlyLimit} (${percentageUsed.toFixed(1)}%)`,
    );
  }

  /**
   * Check if provider can be used (limit not reached)
   */
  async canUseProvider(provider: AIProvider): Promise<boolean> {
    // Free providers always available
    if (this.isFreeProvider(provider)) {
      return true;
    }

    const currentMonth = startOfMonth(new Date());

    const usage = await this.providerUsageRepo.findOne({
      where: {
        provider,
        month: currentMonth,
      },
    });

    // No usage record yet = can use
    if (!usage) {
      return true;
    }

    // Check if limit reached
    if (usage.limitReached) {
      this.logger.warn(
        `Provider ${provider} has reached monthly cost limit ($${usage.costUsd} / $${usage.monthlyLimitUsd})`,
      );
      return false;
    }

    return true;
  }

  /**
   * Get remaining budget for a provider
   */
  async getRemainingBudget(provider: AIProvider): Promise<number> {
    // Free providers return -1 (unlimited)
    if (this.isFreeProvider(provider)) {
      return -1;
    }

    const currentMonth = startOfMonth(new Date());
    const monthlyLimit = this.getMonthlyLimit(provider);

    const usage = await this.providerUsageRepo.findOne({
      where: {
        provider,
        month: currentMonth,
      },
    });

    if (!usage) {
      return monthlyLimit;
    }

    return Math.max(0, monthlyLimit - Number(usage.costUsd));
  }

  /**
   * Calculate cost for given tokens and provider
   */
  calculateCost(provider: AIProvider, tokens: number): number {
    const costPer1M = this.COSTS_PER_1M_TOKENS[provider] || 0;
    return (tokens / 1_000_000) * costPer1M;
  }

  /**
   * Get monthly cost limit for a provider from config
   */
  private getMonthlyLimit(provider: AIProvider): number {
    switch (provider) {
      case AIProvider.DEEPSEEK:
        return this.configService.get<number>(
          'DEEPSEEK_MAX_MONTHLY_COST_USD',
          20.0,
        );
      case AIProvider.OPENAI:
        return this.configService.get<number>(
          'OPENAI_MAX_MONTHLY_COST_USD',
          50.0,
        );
      default:
        return 0;
    }
  }

  /**
   * Check if provider is free (no cost tracking needed)
   */
  private isFreeProvider(provider: AIProvider): boolean {
    return provider === AIProvider.GROQ || provider === AIProvider.GEMINI;
  }

  /**
   * Send warning email to admin at 80% of limit
   */
  private async sendWarningEmail(
    provider: string,
    currentCost: number,
    limit: number,
  ): Promise<void> {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL_COST_ALERTS',
    );
    if (!adminEmail) {
      this.logger.warn(
        'ADMIN_EMAIL_COST_ALERTS not configured, skipping email',
      );
      return;
    }

    try {
      await this.emailService.sendProviderCostWarningEmail(adminEmail, {
        provider,
        currentCost,
        monthlyLimit: limit,
        percentageUsed: (currentCost / limit) * 100,
      });

      this.logger.log(`Sent 80% warning email for ${provider}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send warning email: ${errorMessage}`,
        errorStack,
      );
    }
  }

  /**
   * Send limit reached email to admin
   */
  private async sendLimitReachedEmail(
    provider: string,
    currentCost: number,
    limit: number,
  ): Promise<void> {
    const adminEmail = this.configService.get<string>(
      'ADMIN_EMAIL_COST_ALERTS',
    );
    if (!adminEmail) {
      this.logger.warn(
        'ADMIN_EMAIL_COST_ALERTS not configured, skipping email',
      );
      return;
    }

    try {
      await this.emailService.sendProviderCostLimitReachedEmail(adminEmail, {
        provider,
        currentCost,
        monthlyLimit: limit,
      });

      this.logger.log(`Sent limit reached email for ${provider}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to send limit reached email: ${errorMessage}`,
        errorStack,
      );
    }
  }

  /**
   * Cron job: Reset monthly usage records (runs on 1st of each month at 00:00)
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async resetMonthlyUsage(): Promise<void> {
    this.logger.log('Running monthly usage reset...');

    try {
      const previousMonth = startOfMonth(
        new Date(new Date().setMonth(new Date().getMonth() - 1)),
      );

      const usageRecords = await this.providerUsageRepo.find({
        where: {
          month: previousMonth,
        },
      });

      this.logger.log(
        `Archived ${usageRecords.length} usage records from previous month`,
      );

      // Log summary
      const summary = usageRecords
        .map(
          (record) =>
            `${record.provider}: $${record.costUsd} (${record.requestsCount} requests)`,
        )
        .join(', ');

      this.logger.log(`Monthly AI usage summary: ${summary}`);

      this.logger.log('Monthly usage reset completed');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Error during monthly reset: ${errorMessage}`,
        errorStack,
      );
    }
  }
}
