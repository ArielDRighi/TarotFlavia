import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AIUsageLog,
  AIProvider,
  AIUsageStatus,
} from './entities/ai-usage-log.entity';

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

const COST_PER_MILLION_TOKENS = {
  [AIProvider.GROQ]: { input: 0, output: 0 },
  [AIProvider.DEEPSEEK]: { input: 0.14, output: 0.28 },
  [AIProvider.OPENAI]: { input: 0.15, output: 0.6 },
  [AIProvider.GEMINI]: { input: 0, output: 0 },
};

const ALERT_THRESHOLDS = {
  groqDailyLimit: 12000,
  errorRatePercent: 5,
  fallbackRatePercent: 10,
  dailyCostUsd: 2.0,
};

@Injectable()
export class AIUsageService {
  private readonly logger = new Logger(AIUsageService.name);

  constructor(
    @InjectRepository(AIUsageLog)
    private readonly aiUsageLogRepository: Repository<AIUsageLog>,
  ) {}

  async createLog(data: CreateAIUsageLogDto): Promise<AIUsageLog> {
    const log = this.aiUsageLogRepository.create(data);
    const savedLog = await this.aiUsageLogRepository.save(log);
    this.logger.log(
      `AI usage logged: ${data.provider} - ${data.modelUsed} - ${data.status}`,
    );
    return savedLog;
  }

  calculateCost(
    provider: AIProvider,
    promptTokens: number,
    completionTokens: number,
  ): number {
    const pricing = COST_PER_MILLION_TOKENS[provider];
    const inputCost = (promptTokens / 1000000) * pricing.input;
    const outputCost = (completionTokens / 1000000) * pricing.output;
    return inputCost + outputCost;
  }

  async getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageStatistics[]> {
    const queryBuilder = this.aiUsageLogRepository.createQueryBuilder('log');

    queryBuilder
      .select('log.provider', 'provider')
      .addSelect('COUNT(*)', 'totalCalls')
      .addSelect(
        "COUNT(CASE WHEN log.status = 'success' THEN 1 END)",
        'successCalls',
      )
      .addSelect(
        "COUNT(CASE WHEN log.status = 'error' THEN 1 END)",
        'errorCalls',
      )
      .addSelect(
        "COUNT(CASE WHEN log.status = 'cached' THEN 1 END)",
        'cachedCalls',
      )
      .addSelect('SUM(log.total_tokens)', 'totalTokens')
      .addSelect('SUM(log.cost_usd)', 'totalCost')
      .addSelect('AVG(log.duration_ms)', 'avgDuration');

    if (startDate && endDate) {
      queryBuilder.where('log.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    }

    queryBuilder
      .addSelect(
        'COUNT(CASE WHEN log.fallback_used = true THEN 1 END)',
        'fallbackCalls',
      )
      .groupBy('log.provider');

    const rawStats = await queryBuilder.getRawMany<{
      provider: string;
      totalCalls: string;
      successCalls: string;
      errorCalls: string;
      cachedCalls: string;
      fallbackCalls: string;
      totalTokens: string;
      totalCost: string;
      avgDuration: string;
    }>();

    return rawStats.map((stat) => {
      const totalCalls = parseInt(stat.totalCalls, 10);
      const errorCalls = parseInt(stat.errorCalls, 10);
      const cachedCalls = parseInt(stat.cachedCalls, 10);
      const fallbackCalls = parseInt(stat.fallbackCalls || '0', 10);

      return {
        provider: stat.provider as AIProvider,
        totalCalls,
        successCalls: parseInt(stat.successCalls, 10),
        errorCalls,
        cachedCalls,
        totalTokens: parseInt(stat.totalTokens || '0', 10),
        totalCost: parseFloat(stat.totalCost || '0'),
        avgDuration: parseFloat(stat.avgDuration || '0'),
        errorRate: totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0,
        cacheHitRate: totalCalls > 0 ? (cachedCalls / totalCalls) * 100 : 0,
        fallbackRate: totalCalls > 0 ? (fallbackCalls / totalCalls) * 100 : 0,
      };
    });
  }

  async getByProvider(provider: AIProvider): Promise<AIUsageLog[]> {
    return this.aiUsageLogRepository.find({
      where: { provider },
      order: { createdAt: 'DESC' },
      take: 100,
    });
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<AIUsageLog[]> {
    return this.aiUsageLogRepository.find({
      where: {
        createdAt: Between(startDate, endDate),
      },
      order: { createdAt: 'DESC' },
    });
  }

  async shouldAlert(alertType: string): Promise<boolean> {
    const now = new Date();
    const startOfDay = new Date(now.setHours(0, 0, 0, 0));
    const endOfDay = new Date(now.setHours(23, 59, 59, 999));

    switch (alertType) {
      case 'groqRateLimit': {
        const groqCallsToday = await this.aiUsageLogRepository.count({
          where: {
            provider: AIProvider.GROQ,
            createdAt: Between(startOfDay, endOfDay),
          },
        });
        return groqCallsToday > ALERT_THRESHOLDS.groqDailyLimit;
      }

      case 'highErrorRate': {
        const stats = await this.getStatistics(startOfDay, endOfDay);
        const hasHighErrorRate = stats.some(
          (stat) => stat.errorRate > ALERT_THRESHOLDS.errorRatePercent,
        );
        return hasHighErrorRate;
      }

      case 'highFallbackRate': {
        const fallbackCount = await this.aiUsageLogRepository.count({
          where: {
            fallbackUsed: true,
            createdAt: Between(startOfDay, endOfDay),
          },
        });
        const totalCount = await this.aiUsageLogRepository.count({
          where: {
            createdAt: Between(startOfDay, endOfDay),
          },
        });
        if (totalCount === 0) {
          return false;
        }
        const fallbackRate = (fallbackCount / totalCount) * 100;
        return fallbackRate > ALERT_THRESHOLDS.fallbackRatePercent;
      }

      case 'highDailyCost': {
        const stats = await this.getStatistics(startOfDay, endOfDay);
        const totalCost = stats.reduce((sum, stat) => sum + stat.totalCost, 0);
        return totalCost > ALERT_THRESHOLDS.dailyCostUsd;
      }

      default:
        return false;
    }
  }
}
