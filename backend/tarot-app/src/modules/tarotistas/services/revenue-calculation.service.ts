import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import { User } from '../../users/entities/user.entity';
import {
  CalculateRevenueDto,
  RevenueCalculationResponseDto,
} from '../application/dto/revenue-calculation.dto';
import { SubscriptionType } from '../entities/user-tarotista-subscription.entity';

@Injectable()
export class RevenueCalculationService {
  constructor(
    @InjectRepository(TarotistaRevenueMetrics)
    private readonly revenueMetricsRepository: Repository<TarotistaRevenueMetrics>,
    @InjectRepository(Tarotista)
    private readonly tarotistaRepository: Repository<Tarotista>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Calcula el revenue split basado en la comisión del tarotista
   */
  async calculateRevenue(
    dto: CalculateRevenueDto,
  ): Promise<RevenueCalculationResponseDto> {
    const tarotista = await this.tarotistaRepository.findOne({
      where: { id: dto.tarotistaId },
    });

    if (!tarotista) {
      throw new NotFoundException(
        `Tarotista with ID ${dto.tarotistaId} not found`,
      );
    }

    const commissionPercentage = tarotista.comisiónPorcentaje;
    const platformFeeUsd = this.roundToTwoDecimals(
      (dto.totalRevenueUsd * commissionPercentage) / 100,
    );
    const revenueShareUsd = this.roundToTwoDecimals(
      dto.totalRevenueUsd - platformFeeUsd,
    );

    return {
      revenueShareUsd,
      platformFeeUsd,
      totalRevenueUsd: dto.totalRevenueUsd,
      commissionPercentage,
    };
  }

  /**
   * Registra el revenue en la base de datos
   */
  async recordRevenue(
    dto: CalculateRevenueDto,
  ): Promise<TarotistaRevenueMetrics> {
    // Validar que existan tarotista y usuario
    const tarotista = await this.tarotistaRepository.findOne({
      where: { id: dto.tarotistaId },
    });

    if (!tarotista) {
      throw new NotFoundException(
        `Tarotista with ID ${dto.tarotistaId} not found`,
      );
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    // Calcular revenue split
    const calculation = await this.calculateRevenue(dto);

    // Obtener período mensual
    const now = new Date();
    const { periodStart, periodEnd } = this.getMonthlyPeriod(now);

    // Crear y guardar métrica
    const revenueMetric = this.revenueMetricsRepository.create({
      tarotistaId: dto.tarotistaId,
      userId: dto.userId,
      readingId: dto.readingId ?? null,
      subscriptionType: dto.subscriptionType,
      revenueShareUsd: calculation.revenueShareUsd,
      platformFeeUsd: calculation.platformFeeUsd,
      totalRevenueUsd: calculation.totalRevenueUsd,
      calculationDate: now,
      periodStart,
      periodEnd,
      metadata: null,
    });

    return this.revenueMetricsRepository.save(revenueMetric);
  }

  /**
   * Calcula y registra revenue para una lectura específica
   */
  async calculateRevenueForReading(
    readingId: number,
    tarotistaId: number,
    userId: number,
    subscriptionType: SubscriptionType,
    totalRevenueUsd: number,
  ): Promise<TarotistaRevenueMetrics> {
    const dto: CalculateRevenueDto = {
      tarotistaId,
      userId,
      subscriptionType,
      totalRevenueUsd,
      readingId,
    };

    return this.recordRevenue(dto);
  }

  /**
   * Redondea a 2 decimales
   */
  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  /**
   * Obtiene el período mensual (inicio y fin del mes)
   */
  private getMonthlyPeriod(date: Date): { periodStart: Date; periodEnd: Date } {
    const periodStart = new Date(date.getFullYear(), date.getMonth(), 1);
    periodStart.setUTCHours(0, 0, 0, 0);

    const periodEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    periodEnd.setUTCHours(23, 59, 59, 999);

    return { periodStart, periodEnd };
  }
}
