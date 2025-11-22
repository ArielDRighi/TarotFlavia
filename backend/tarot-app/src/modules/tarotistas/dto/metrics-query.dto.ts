import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum MetricsPeriod {
  DAY = 'day',
  WEEK = 'week',
  MONTH = 'month',
  YEAR = 'year',
  CUSTOM = 'custom',
}

/**
 * DTO para consultar métricas de tarotista
 */
export class MetricsQueryDto {
  @ApiProperty({
    description: 'ID del tarotista',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  tarotistaId: number;

  @ApiProperty({
    description: 'Período de consulta',
    enum: MetricsPeriod,
    example: MetricsPeriod.MONTH,
    required: false,
    default: MetricsPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(MetricsPeriod)
  period?: MetricsPeriod = MetricsPeriod.MONTH;

  @ApiProperty({
    description: 'Fecha de inicio (ISO 8601) - requerido para CUSTOM period',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin (ISO 8601) - requerido para CUSTOM period',
    example: '2025-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * DTO de respuesta con métricas de tarotista
 */
export class TarotistaMetricsDto {
  @ApiProperty({
    description: 'ID del tarotista',
    example: 1,
  })
  tarotistaId: number;

  @ApiProperty({
    description: 'Nombre público del tarotista',
    example: 'Flavia',
  })
  nombrePublico: string;

  @ApiProperty({
    description: 'Total de lecturas generadas en el período',
    example: 150,
  })
  totalReadings: number;

  @ApiProperty({
    description: 'Revenue total del tarotista (después de comisión)',
    example: 5250.0,
  })
  totalRevenueShare: number;

  @ApiProperty({
    description: 'Comisión total de la plataforma',
    example: 2250.0,
  })
  totalPlatformFee: number;

  @ApiProperty({
    description: 'Revenue total bruto',
    example: 7500.0,
  })
  totalGrossRevenue: number;

  @ApiProperty({
    description: 'Rating promedio',
    example: 4.8,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Total de reviews',
    example: 50,
  })
  totalReviews: number;

  @ApiProperty({
    description: 'Período consultado',
    example: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-31T23:59:59Z',
    },
  })
  period: {
    start: Date;
    end: Date;
  };
}

/**
 * DTO para consultar métricas globales de la plataforma (admin only)
 */
export class PlatformMetricsQueryDto {
  @ApiProperty({
    description: 'Período de consulta',
    enum: MetricsPeriod,
    example: MetricsPeriod.MONTH,
    required: false,
    default: MetricsPeriod.MONTH,
  })
  @IsOptional()
  @IsEnum(MetricsPeriod)
  period?: MetricsPeriod = MetricsPeriod.MONTH;

  @ApiProperty({
    description: 'Fecha de inicio (ISO 8601) - requerido para CUSTOM period',
    example: '2025-01-01T00:00:00Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin (ISO 8601) - requerido para CUSTOM period',
    example: '2025-01-31T23:59:59Z',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

/**
 * DTO de respuesta con métricas de la plataforma
 */
export class PlatformMetricsDto {
  @ApiProperty({
    description: 'Total de lecturas generadas en la plataforma',
    example: 1500,
  })
  totalReadings: number;

  @ApiProperty({
    description: 'Total de revenue de tarotistas (después de comisión)',
    example: 52500.0,
  })
  totalRevenueShare: number;

  @ApiProperty({
    description: 'Total de comisiones de la plataforma',
    example: 22500.0,
  })
  totalPlatformFee: number;

  @ApiProperty({
    description: 'Revenue total bruto',
    example: 75000.0,
  })
  totalGrossRevenue: number;

  @ApiProperty({
    description: 'Número de tarotistas activos en el período',
    example: 10,
  })
  activeTarotistas: number;

  @ApiProperty({
    description: 'Número de usuarios activos en el período',
    example: 500,
  })
  activeUsers: number;

  @ApiProperty({
    description: 'Período consultado',
    example: {
      start: '2025-01-01T00:00:00Z',
      end: '2025-01-31T23:59:59Z',
    },
  })
  period: {
    start: Date;
    end: Date;
  };

  @ApiProperty({
    description: 'Top 5 tarotistas por revenue',
    type: [TarotistaMetricsDto],
  })
  topTarotistas: TarotistaMetricsDto[];
}
