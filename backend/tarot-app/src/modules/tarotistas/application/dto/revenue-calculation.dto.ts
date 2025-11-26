import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsEnum, Min, IsOptional } from 'class-validator';
import { SubscriptionType } from '../../infrastructure/entities/user-tarotista-subscription.entity';

/**
 * DTO para calcular revenue de una lectura específica
 */
export class CalculateRevenueDto {
  @ApiProperty({
    description: 'ID del tarotista',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  tarotistaId: number;

  @ApiProperty({
    description: 'ID del usuario que genera el revenue',
    example: 1,
  })
  @IsNumber()
  @IsPositive()
  userId: number;

  @ApiProperty({
    description: 'Tipo de suscripción',
    enum: SubscriptionType,
    example: SubscriptionType.PREMIUM_INDIVIDUAL,
  })
  @IsEnum(SubscriptionType)
  subscriptionType: SubscriptionType;

  @ApiProperty({
    description: 'Revenue total de la transacción en USD',
    example: 50.0,
  })
  @IsNumber()
  @Min(0)
  totalRevenueUsd: number;

  @ApiProperty({
    description: 'ID de la lectura asociada (opcional)',
    example: 123,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @IsPositive()
  readingId?: number;
}

/**
 * DTO de respuesta con revenue calculado
 */
export class RevenueCalculationResponseDto {
  @ApiProperty({
    description: 'Revenue del tarotista (después de comisión)',
    example: 35.0,
  })
  revenueShareUsd: number;

  @ApiProperty({
    description: 'Comisión de la plataforma',
    example: 15.0,
  })
  platformFeeUsd: number;

  @ApiProperty({
    description: 'Revenue total',
    example: 50.0,
  })
  totalRevenueUsd: number;

  @ApiProperty({
    description: 'Porcentaje de comisión aplicado',
    example: 30.0,
  })
  commissionPercentage: number;
}
