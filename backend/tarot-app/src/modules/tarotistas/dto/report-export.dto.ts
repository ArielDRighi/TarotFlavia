import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsOptional,
  IsNumber,
  IsPositive,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { MetricsPeriod } from './metrics-query.dto';

export enum ReportFormat {
  CSV = 'csv',
  PDF = 'pdf',
}

/**
 * DTO para solicitar exportación de reporte
 */
export class ExportReportDto {
  @ApiProperty({
    description:
      'ID del tarotista (opcional para admin - puede exportar todos)',
    example: 1,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  tarotistaId?: number;

  @ApiProperty({
    description: 'Formato de exportación',
    enum: ReportFormat,
    example: ReportFormat.CSV,
    default: ReportFormat.CSV,
  })
  @IsEnum(ReportFormat)
  format: ReportFormat = ReportFormat.CSV;

  @ApiProperty({
    description: 'Período de consulta',
    enum: MetricsPeriod,
    example: MetricsPeriod.MONTH,
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
  @ValidateIf((o: ExportReportDto) => o.period === MetricsPeriod.CUSTOM)
  @IsDateString()
  startDate?: string;

  @ApiProperty({
    description: 'Fecha de fin (ISO 8601) - requerido para CUSTOM period',
    example: '2025-01-31T23:59:59Z',
    required: false,
  })
  @ValidateIf((o: ExportReportDto) => o.period === MetricsPeriod.CUSTOM)
  @IsDateString()
  endDate?: string;
}

/**
 * DTO para una línea de reporte detallado
 */
export class ReportLineDto {
  @ApiProperty({
    description: 'Fecha de la transacción',
    example: '2025-01-15T10:30:00Z',
  })
  date: Date;

  @ApiProperty({
    description: 'ID de la lectura',
    example: 123,
  })
  readingId: number;

  @ApiProperty({
    description: 'ID del usuario',
    example: 45,
  })
  userId: number;

  @ApiProperty({
    description: 'Email del usuario',
    example: 'usuario@ejemplo.com',
  })
  userEmail: string;

  @ApiProperty({
    description: 'Tipo de suscripción',
    example: 'premium_individual',
  })
  subscriptionType: string;

  @ApiProperty({
    description: 'Revenue del tarotista',
    example: 35.0,
  })
  revenueShare: number;

  @ApiProperty({
    description: 'Comisión de la plataforma',
    example: 15.0,
  })
  platformFee: number;

  @ApiProperty({
    description: 'Total bruto',
    example: 50.0,
  })
  totalRevenue: number;
}
