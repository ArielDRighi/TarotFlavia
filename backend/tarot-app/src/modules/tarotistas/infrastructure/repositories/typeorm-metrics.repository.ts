import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  IMetricsRepository,
  MetricsByPeriod,
  RevenueCalculation,
  TopTarotistasMetrics,
  TarotistaStatistics,
} from '../../domain/interfaces/metrics-repository.interface';
import {
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsQueryDto,
  PlatformMetricsDto,
  MetricsPeriod,
} from '../../application/dto';
import { TarotistaRevenueMetrics } from '../../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../../entities/tarotista.entity';
import { TarotReading } from '../../../tarot/readings/entities/tarot-reading.entity';

/**
 * TypeORM implementation of IMetricsRepository
 * Handles metrics and analytics queries
 */
@Injectable()
export class TypeOrmMetricsRepository implements IMetricsRepository {
  constructor(
    @InjectRepository(TarotistaRevenueMetrics)
    private readonly revenueRepo: Repository<TarotistaRevenueMetrics>,
    @InjectRepository(Tarotista)
    private readonly tarotistaRepo: Repository<Tarotista>,
    @InjectRepository(TarotReading)
    private readonly readingRepo: Repository<TarotReading>,
  ) {}

  async getReadingCountsByTarotista(
    tarotistaId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number> {
    const where: Record<string, unknown> = { tarotistaId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return await this.readingRepo.count({ where });
  }

  getReadingCountsByPeriod(): Promise<MetricsByPeriod[]> {
    // This is a complex aggregation query
    // Implementation will use raw SQL or query builder
    // For now, return empty array to allow compilation
    // TODO: Implement using TypeORM query builder
    return Promise.resolve([]);
  }

  async findRevenueMetrics(
    tarotistaId: number,
  ): Promise<TarotistaRevenueMetrics | null> {
    return await this.revenueRepo.findOne({
      where: { tarotistaId },
      // Note: Add date filtering when implemented
    });
  }

  async upsertRevenueMetrics(
    data: Partial<TarotistaRevenueMetrics>,
  ): Promise<TarotistaRevenueMetrics> {
    const revenue = this.revenueRepo.create(data);
    return await this.revenueRepo.save(revenue);
  }

  async calculateRevenue(
    tarotistaId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueCalculation> {
    const metricsRaw:
      | {
          totalReadings?: string;
          totalRevenueShare?: string;
          totalPlatformFee?: string;
          totalGrossRevenue?: string;
        }
      | undefined = await this.revenueRepo
      .createQueryBuilder('revenue')
      .where('revenue.tarotistaId = :tarotistaId', { tarotistaId })
      .andWhere('revenue.calculationDate >= :start', { start: startDate })
      .andWhere('revenue.calculationDate <= :end', { end: endDate })
      .select('COUNT(DISTINCT revenue.readingId)', 'totalReadings')
      .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenueShare')
      .addSelect('SUM(revenue.platformFeeUsd)', 'totalPlatformFee')
      .addSelect('SUM(revenue.totalRevenueUsd)', 'totalGrossRevenue')
      .getRawOne();

    const totalReadings = parseInt(metricsRaw?.totalReadings ?? '0', 10) || 0;
    const tarotistaEarnings =
      parseFloat(metricsRaw?.totalRevenueShare ?? '0') || 0.0;
    const platformFee = parseFloat(metricsRaw?.totalPlatformFee ?? '0') || 0.0;
    const totalRevenue =
      parseFloat(metricsRaw?.totalGrossRevenue ?? '0') || 0.0;

    return {
      totalReadings,
      totalRevenue,
      platformFee,
      tarotistaEarnings,
      averagePerReading: totalReadings > 0 ? totalRevenue / totalReadings : 0,
    };
  }

  getTopTarotistas(
    _limit: number,
    _metric: 'readings' | 'revenue' | 'rating',
    _period?: { start: Date; end: Date },
  ): Promise<TopTarotistasMetrics[]> {
    // Simple implementation - returns empty for now
    // TODO: Implement full functionality based on metric parameter
    void _limit;
    void _metric;
    void _period;
    return Promise.resolve([]);
  }

  async getTarotistaStatistics(
    tarotistaId: number,
  ): Promise<TarotistaStatistics> {
    const tarotista = await this.tarotistaRepo.findOne({
      where: { id: tarotistaId },
    });

    if (!tarotista) {
      return {
        totalReadings: 0,
        totalRevenue: 0,
        averageRating: 0,
        totalReviews: 0,
        customMeaningsCount: 0,
        subscribersCount: 0,
      };
    }

    // Get reading count
    const totalReadings = await this.readingRepo.count({
      where: { tarotistaId },
    });

    return {
      totalReadings,
      totalRevenue: 0, // TODO: Calculate from revenue metrics
      averageRating: tarotista.ratingPromedio || 0,
      totalReviews: tarotista.totalReviews || 0,
      customMeaningsCount: 0, // TODO: Count from card meanings
      subscribersCount: 0, // TODO: Count from subscriptions
    };
  }

  // ==================== New Metrics Endpoints ====================

  async getTarotistaMetrics(
    dto: MetricsQueryDto,
  ): Promise<TarotistaMetricsDto> {
    const tarotista = await this.tarotistaRepo.findOne({
      where: { id: dto.tarotistaId },
    });

    if (!tarotista) {
      throw new NotFoundException(
        `Tarotista with ID ${dto.tarotistaId} not found`,
      );
    }

    const { start, end } = this.calculatePeriodDates(
      dto.period,
      dto.startDate,
      dto.endDate,
    );

    // Aggregate revenue metrics
    const metricsRaw:
      | {
          totalReadings?: string;
          totalRevenueShare?: string;
          totalPlatformFee?: string;
          totalGrossRevenue?: string;
        }
      | undefined = await this.revenueRepo
      .createQueryBuilder('revenue')
      .where('revenue.tarotistaId = :tarotistaId', {
        tarotistaId: dto.tarotistaId,
      })
      .andWhere('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('COUNT(DISTINCT revenue.readingId)', 'totalReadings')
      .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenueShare')
      .addSelect('SUM(revenue.platformFeeUsd)', 'totalPlatformFee')
      .addSelect('SUM(revenue.totalRevenueUsd)', 'totalGrossRevenue')
      .getRawOne();

    return {
      tarotistaId: tarotista.id,
      nombrePublico: tarotista.nombrePublico,
      totalReadings: parseInt(metricsRaw?.totalReadings ?? '0', 10) || 0,
      totalRevenueShare:
        parseFloat(metricsRaw?.totalRevenueShare ?? '0') || 0.0,
      totalPlatformFee: parseFloat(metricsRaw?.totalPlatformFee ?? '0') || 0.0,
      totalGrossRevenue:
        parseFloat(metricsRaw?.totalGrossRevenue ?? '0') || 0.0,
      averageRating: tarotista.ratingPromedio || 0.0,
      totalReviews: tarotista.totalReviews || 0,
      period: { start, end },
    };
  }

  async getPlatformMetrics(
    dto: PlatformMetricsQueryDto,
  ): Promise<PlatformMetricsDto> {
    const { start, end } = this.calculatePeriodDates(
      dto.period,
      dto.startDate,
      dto.endDate,
    );

    // Aggregate total metrics
    const totalMetricsRaw:
      | {
          totalReadings?: string;
          totalRevenueShare?: string;
          totalPlatformFee?: string;
          totalGrossRevenue?: string;
        }
      | undefined = await this.revenueRepo
      .createQueryBuilder('revenue')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('COUNT(DISTINCT revenue.readingId)', 'totalReadings')
      .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenueShare')
      .addSelect('SUM(revenue.platformFeeUsd)', 'totalPlatformFee')
      .addSelect('SUM(revenue.totalRevenueUsd)', 'totalGrossRevenue')
      .getRawOne();

    // Count active tarotistas (who generated at least one reading)
    const activeTarotistasResult = await this.revenueRepo
      .createQueryBuilder('revenue')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('revenue.tarotistaId', 'tarotistaId')
      .distinct(true)
      .getRawMany();

    const activeTarotistas = activeTarotistasResult.length;

    // Count active users (who generated at least one reading)
    const activeUsersResult = await this.readingRepo
      .createQueryBuilder('reading')
      .where('reading.createdAt >= :start', { start })
      .andWhere('reading.createdAt <= :end', { end })
      .select('reading.userId', 'userId')
      .distinct(true)
      .getRawMany();

    const activeUsers = activeUsersResult.length;

    // Top 5 tarotistas by revenue
    const topTarotistas = await this.getTopTarotistasInternal(start, end);

    return {
      totalReadings: parseInt(totalMetricsRaw?.totalReadings ?? '0', 10) || 0,
      totalRevenueShare:
        parseFloat(totalMetricsRaw?.totalRevenueShare ?? '0') || 0.0,
      totalPlatformFee:
        parseFloat(totalMetricsRaw?.totalPlatformFee ?? '0') || 0.0,
      totalGrossRevenue:
        parseFloat(totalMetricsRaw?.totalGrossRevenue ?? '0') || 0.0,
      activeTarotistas,
      activeUsers,
      period: { start, end },
      topTarotistas,
    };
  }

  /**
   * Get top 5 tarotistas by revenue in period - Internal helper
   */
  private async getTopTarotistasInternal(
    start: Date,
    end: Date,
  ): Promise<TarotistaMetricsDto[]> {
    // Get revenue by tarotista
    const revenueByTarotista = await this.revenueRepo
      .createQueryBuilder('revenue')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('revenue.tarotistaId', 'tarotistaId')
      .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenue')
      .groupBy('revenue.tarotistaId')
      .orderBy('"totalRevenue"', 'DESC')
      .limit(5)
      .getRawMany();

    if (revenueByTarotista.length === 0) {
      return [];
    }

    const tarotistaIds = revenueByTarotista.map(
      (r: { tarotistaId: number }) => r.tarotistaId,
    );

    // Get tarotista information
    const tarotistas = await this.tarotistaRepo.find({
      where: tarotistaIds.map((id) => ({ id })),
    });

    // Generate complete metrics for each
    const metricsPromises = tarotistaIds.map(async (tarotistaId) => {
      const tarotista = tarotistas.find((t) => t.id === tarotistaId);
      if (!tarotista) {
        return null;
      }

      const metrics:
        | {
            totalReadings?: string;
            totalRevenueShare?: string;
            totalPlatformFee?: string;
            totalGrossRevenue?: string;
          }
        | undefined = await this.revenueRepo
        .createQueryBuilder('revenue')
        .where('revenue.tarotistaId = :tarotistaId', { tarotistaId })
        .andWhere('revenue.calculationDate >= :start', { start })
        .andWhere('revenue.calculationDate <= :end', { end })
        .select('COUNT(DISTINCT revenue.readingId)', 'totalReadings')
        .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenueShare')
        .addSelect('SUM(revenue.platformFeeUsd)', 'totalPlatformFee')
        .addSelect('SUM(revenue.totalRevenueUsd)', 'totalGrossRevenue')
        .getRawOne();

      return {
        tarotistaId: tarotista.id,
        nombrePublico: tarotista.nombrePublico,
        totalReadings: parseInt(metrics?.totalReadings ?? '0', 10) || 0,
        totalRevenueShare: parseFloat(metrics?.totalRevenueShare ?? '0') || 0.0,
        totalPlatformFee: parseFloat(metrics?.totalPlatformFee ?? '0') || 0.0,
        totalGrossRevenue: parseFloat(metrics?.totalGrossRevenue ?? '0') || 0.0,
        averageRating: tarotista.ratingPromedio || 0.0,
        totalReviews: tarotista.totalReviews || 0,
        period: { start, end },
      };
    });

    const results = await Promise.all(metricsPromises);
    return results.filter((r) => r !== null) as TarotistaMetricsDto[];
  }

  /**
   * Calculate start and end dates based on period
   */
  private calculatePeriodDates(
    period?: MetricsPeriod,
    startDate?: string,
    endDate?: string,
  ): { start: Date; end: Date } {
    const now = new Date();

    if (period === MetricsPeriod.CUSTOM) {
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate are required for CUSTOM period');
      }
      return {
        start: new Date(startDate),
        end: new Date(endDate),
      };
    }

    let start: Date;
    let end: Date = new Date(now);

    switch (period) {
      case MetricsPeriod.DAY:
        start = new Date(now);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case MetricsPeriod.WEEK:
        start = new Date(now);
        start.setDate(now.getDate() - 6);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);
        break;

      case MetricsPeriod.YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
        break;

      case MetricsPeriod.MONTH:
      default:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        end = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        );
        break;
    }

    return { start, end };
  }
}
