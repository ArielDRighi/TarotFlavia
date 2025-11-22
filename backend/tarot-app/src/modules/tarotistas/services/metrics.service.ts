/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-argument */
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import { TarotReading } from '../../tarot/readings/entities/tarot-reading.entity';
import {
  MetricsQueryDto,
  TarotistaMetricsDto,
  PlatformMetricsDto,
  PlatformMetricsQueryDto,
  MetricsPeriod,
} from '../dto/metrics-query.dto';

@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(TarotistaRevenueMetrics)
    private readonly revenueMetricsRepository: Repository<TarotistaRevenueMetrics>,
    @InjectRepository(Tarotista)
    private readonly tarotistaRepository: Repository<Tarotista>,
    @InjectRepository(TarotReading)
    private readonly readingsRepository: Repository<TarotReading>,
  ) {}

  /**
   * Obtiene métricas de un tarotista específico
   */
  async getTarotistaMetrics(
    dto: MetricsQueryDto,
  ): Promise<TarotistaMetricsDto> {
    const tarotista = await this.tarotistaRepository.findOne({
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

    // Agregar métricas de revenue
    const metricsRaw = await this.revenueMetricsRepository
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

  /**
   * Obtiene métricas de toda la plataforma (admin only)
   */
  async getPlatformMetrics(
    dto: PlatformMetricsQueryDto,
  ): Promise<PlatformMetricsDto> {
    const { start, end } = this.calculatePeriodDates(
      dto.period,
      dto.startDate,
      dto.endDate,
    );

    // Métricas agregadas totales
    const totalMetricsRaw = await this.revenueMetricsRepository
      .createQueryBuilder('revenue')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('COUNT(DISTINCT revenue.readingId)', 'totalReadings')
      .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenueShare')
      .addSelect('SUM(revenue.platformFeeUsd)', 'totalPlatformFee')
      .addSelect('SUM(revenue.totalRevenueUsd)', 'totalGrossRevenue')
      .getRawOne();

    // Contar tarotistas activos (que generaron al menos una lectura)
    const activeTarotistasResult = await this.revenueMetricsRepository
      .createQueryBuilder('revenue')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('DISTINCT revenue.tarotistaId', 'tarotistaId')
      .distinct(true)
      .getRawMany();

    const activeTarotistas = activeTarotistasResult.length;

    // Contar usuarios activos (que generaron al menos una lectura)
    const activeUsers = await this.readingsRepository
      .createQueryBuilder('reading')
      .where('reading.createdAt >= :start', { start })
      .andWhere('reading.createdAt <= :end', { end })
      .distinctOn(['reading.userId'])
      .getCount();

    // Top 5 tarotistas por revenue
    const topTarotistas = await this.getTopTarotistas(start, end);

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
   * Obtiene top 5 tarotistas por revenue en el período
   */
  private async getTopTarotistas(
    start: Date,
    end: Date,
  ): Promise<TarotistaMetricsDto[]> {
    // Obtener revenue por tarotista
    const revenueByTarotista = await this.revenueMetricsRepository
      .createQueryBuilder('revenue')
      .where('revenue.calculationDate >= :start', { start })
      .andWhere('revenue.calculationDate <= :end', { end })
      .select('revenue.tarotistaId', 'tarotistaId')
      .addSelect('SUM(revenue.revenueShareUsd)', 'totalRevenue')
      .groupBy('revenue.tarotistaId')
      .orderBy('totalRevenue', 'DESC')
      .limit(5)
      .getRawMany();

    if (revenueByTarotista.length === 0) {
      return [];
    }

    const tarotistaIds = revenueByTarotista.map(
      (r: { tarotistaId: number }) => r.tarotistaId,
    );

    // Obtener información de tarotistas
    const tarotistas = await this.tarotistaRepository.find({
      where: tarotistaIds.map((id) => ({ id })),
    });

    // Generar métricas completas para cada uno
    const metricsPromises = tarotistaIds.map(async (tarotistaId) => {
      const tarotista = tarotistas.find((t) => t.id === tarotistaId);
      if (!tarotista) {
        return null;
      }

      const metrics = await this.revenueMetricsRepository
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
   * Calcula las fechas de inicio y fin según el período
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
