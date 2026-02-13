import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, Min, Max, IsOptional } from 'class-validator';

/**
 * DTO para actualizar límites de carta astral
 * Ambos campos son opcionales para permitir actualización parcial
 */
export class UpdateBirthChartLimitsDto {
  @ApiPropertyOptional({
    example: 3,
    description:
      'Límite mensual de generación de cartas astrales para usuarios Free',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  freeLimit?: number;

  @ApiPropertyOptional({
    example: 5,
    description:
      'Límite mensual de generación de cartas astrales para usuarios Premium',
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(100)
  premiumLimit?: number;
}

/**
 * DTO de respuesta con configuración de límites
 */
export class UsageLimitConfigDto {
  @ApiProperty({
    example: 'birth_chart',
    description: 'Tipo de uso',
  })
  usageType: string;

  @ApiProperty({
    example: 'monthly',
    description: 'Período del límite (daily, monthly, lifetime)',
  })
  period: string;

  @ApiProperty({
    example: { anonymous: 1, free: 3, premium: 5 },
    description: 'Límites por plan de usuario',
  })
  limits: Record<string, number>;

  @ApiProperty({
    example: '2026-02-06T12:00:00Z',
    description: 'Fecha de última actualización',
  })
  updatedAt: string;

  @ApiPropertyOptional({
    example: 'admin@auguria.com',
    description: 'Email del administrador que realizó la última actualización',
  })
  updatedBy?: string;
}
