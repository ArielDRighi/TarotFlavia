import { TarotistaRevenueMetrics } from '../../infrastructure/entities/tarotista-revenue-metrics.entity';
import {
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsQueryDto,
  PlatformMetricsDto,
} from '../../application/dto/metrics-query.dto';

/**
 * Interface for Metrics repository operations
 * Handles tarotista metrics and analytics
 */
export interface IMetricsRepository {
  // Main metrics endpoints
  getTarotistaMetrics(dto: MetricsQueryDto): Promise<TarotistaMetricsDto>;
  getPlatformMetrics(dto: PlatformMetricsQueryDto): Promise<PlatformMetricsDto>;

  // Reading counts
  getReadingCountsByTarotista(
    tarotistaId: number,
    startDate?: Date,
    endDate?: Date,
  ): Promise<number>;

  getReadingCountsByPeriod(
    tarotistaId: number,
    period: 'day' | 'week' | 'month' | 'year',
    startDate?: Date,
    endDate?: Date,
  ): Promise<MetricsByPeriod[]>;

  // Revenue metrics
  findRevenueMetrics(
    tarotistaId: number,
    month: number,
    year: number,
  ): Promise<TarotistaRevenueMetrics | null>;

  upsertRevenueMetrics(
    data: Partial<TarotistaRevenueMetrics>,
  ): Promise<TarotistaRevenueMetrics>;

  calculateRevenue(
    tarotistaId: number,
    startDate: Date,
    endDate: Date,
  ): Promise<RevenueCalculation>;

  // Aggregated metrics
  getTopTarotistas(
    limit: number,
    metric: 'readings' | 'revenue' | 'rating',
    period?: { start: Date; end: Date },
  ): Promise<TopTarotistasMetrics[]>;

  getTarotistaStatistics(tarotistaId: number): Promise<TarotistaStatistics>;
}

export interface MetricsByPeriod {
  period: string;
  count: number;
  date: Date;
}

export interface RevenueCalculation {
  totalReadings: number;
  totalRevenue: number;
  platformFee: number;
  tarotistaEarnings: number;
  averagePerReading: number;
}

export interface TopTarotistasMetrics {
  tarotistaId: number;
  nombrePublico: string;
  value: number;
  rank: number;
}

export interface TarotistaStatistics {
  totalReadings: number;
  totalRevenue: number;
  averageRating: number;
  totalReviews: number;
  customMeaningsCount: number;
  subscribersCount: number;
}
