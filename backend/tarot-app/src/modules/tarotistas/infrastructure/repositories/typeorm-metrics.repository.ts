import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import {
  IMetricsRepository,
  MetricsByPeriod,
  RevenueCalculation,
  TopTarotistasMetrics,
  TarotistaStatistics,
} from '../../domain/interfaces/metrics-repository.interface';
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
    const where: any = { tarotistaId };

    if (startDate && endDate) {
      where.createdAt = Between(startDate, endDate);
    }

    return await this.readingRepo.count({ where });
  }

  async getReadingCountsByPeriod(
    tarotistaId: number,
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date,
  ): Promise<MetricsByPeriod[]> {
    // This is a complex aggregation query
    // Implementation will use raw SQL or query builder
    // For now, return empty array to allow compilation
    // TODO: Implement using TypeORM query builder
    return [];
  }

  async findRevenueMetrics(
    tarotistaId: number,
    month: number,
    year: number,
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
    const metricsRaw = await this.revenueRepo
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

  async getTopTarotistas(
    limit: number,
    metric: 'readings' | 'revenue' | 'rating',
    period?: { start: Date; end: Date },
  ): Promise<TopTarotistasMetrics[]> {
    // Complex aggregation query
    // TODO: Implement using TypeORM query builder
    return [];
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
}
