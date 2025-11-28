import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  AIUsageLog,
  AIProvider,
  AIUsageStatus,
} from '../../entities/ai-usage-log.entity';
import {
  IAIUsageLogRepository,
  CreateAIUsageLogDto,
  AIUsageStatistics,
} from '../../domain/interfaces/ai-usage-log-repository.interface';
import { startOfMonth } from 'date-fns';

@Injectable()
export class TypeOrmAIUsageLogRepository implements IAIUsageLogRepository {
  private readonly logger = new Logger(TypeOrmAIUsageLogRepository.name);

  constructor(
    @InjectRepository(AIUsageLog)
    private readonly repository: Repository<AIUsageLog>,
  ) {}

  async createLog(data: CreateAIUsageLogDto): Promise<AIUsageLog> {
    const log = this.repository.create(data);
    const savedLog = await this.repository.save(log);
    this.logger.log(
      `AI usage logged: ${data.provider} - ${data.modelUsed} - ${data.status}`,
    );
    return savedLog;
  }

  async getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageStatistics[]> {
    const queryBuilder = this.repository.createQueryBuilder('log');

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
      .addSelect('AVG(log.duration_ms)', 'avgDuration')
      .groupBy('log.provider');

    if (startDate && endDate) {
      queryBuilder.where('log.created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.where('log.created_at >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.where('log.created_at <= :endDate', { endDate });
    }

    const results = await queryBuilder.getRawMany();

    return results.map((row) => {
      const totalCalls = parseInt(row.totalCalls, 10);
      const errorCalls = parseInt(row.errorCalls, 10);
      const cachedCalls = parseInt(row.cachedCalls, 10);
      const successCalls = parseInt(row.successCalls, 10);
      const fallbackCalls = 0;

      return {
        provider: row.provider,
        totalCalls,
        successCalls,
        errorCalls,
        cachedCalls,
        totalTokens: parseInt(row.totalTokens || 0, 10),
        totalCost: parseFloat(row.totalCost || 0),
        avgDuration: parseFloat(row.avgDuration || 0),
        errorRate: totalCalls > 0 ? (errorCalls / totalCalls) * 100 : 0,
        cacheHitRate: totalCalls > 0 ? (cachedCalls / totalCalls) * 100 : 0,
        fallbackRate: totalCalls > 0 ? (fallbackCalls / totalCalls) * 100 : 0,
      };
    });
  }

  async getTotalRequestsByUserThisMonth(userId: number): Promise<number> {
    const startOfCurrentMonth = startOfMonth(new Date());
    const count = await this.repository.count({
      where: {
        userId,
        createdAt: Between(startOfCurrentMonth, new Date()) as any,
        status: AIUsageStatus.SUCCESS,
      },
    });
    return count;
  }

  async findByUser(
    userId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageLog[]> {
    const query: any = { userId };

    if (startDate && endDate) {
      query.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      query.createdAt = Between(startDate, new Date());
    }

    return this.repository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  async findByProvider(
    provider: AIProvider,
    startDate?: Date,
    endDate?: Date,
  ): Promise<AIUsageLog[]> {
    const query: any = { provider };

    if (startDate && endDate) {
      query.createdAt = Between(startDate, endDate);
    } else if (startDate) {
      query.createdAt = Between(startDate, new Date());
    }

    return this.repository.find({
      where: query,
      order: { createdAt: 'DESC' },
    });
  }

  async deleteOlderThan(date: Date): Promise<number> {
    const result = await this.repository
      .createQueryBuilder()
      .delete()
      .where('created_at < :date', { date })
      .execute();

    return result.affected || 0;
  }
}
