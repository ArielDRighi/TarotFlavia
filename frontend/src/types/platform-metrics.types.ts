/**
 * Platform Metrics Types
 *
 * Estos tipos reflejan exactamente los DTOs del backend en
 * backend/tarot-app/src/modules/tarotistas/application/dto/metrics-query.dto.ts
 */

// --- Period Enum ---

export enum MetricsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

// --- Query DTOs ---

export interface PlatformMetricsQueryDto {
  period?: MetricsPeriod;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
}

// --- Response DTOs ---

export interface TarotistaMetricsDto {
  tarotistaId: number;
  nombrePublico: string;
  totalReadings: number;
  totalRevenueShare: number;
  totalPlatformFee: number;
  totalGrossRevenue: number;
  averageRating: number;
  totalReviews: number;
  period: {
    start: Date;
    end: Date;
  };
}

export interface PlatformMetricsDto {
  totalReadings: number;
  totalRevenueShare: number;
  totalPlatformFee: number;
  totalGrossRevenue: number;
  activeTarotistas: number;
  activeUsers: number;
  period: {
    start: Date;
    end: Date;
  };
  topTarotistas: TarotistaMetricsDto[];
}

// --- UI Types ---

export interface PeriodOption {
  value: MetricsPeriod;
  label: string;
}

export interface MetricCard {
  title: string;
  value: string | number;
  comparison?: number; // % de cambio respecto período anterior
  trend?: 'up' | 'down' | 'neutral';
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface TopTarotistaRow {
  position: number;
  id: number;
  name: string;
  readings: number;
  sessions: number;
  revenue: number;
  rating: number;
}
