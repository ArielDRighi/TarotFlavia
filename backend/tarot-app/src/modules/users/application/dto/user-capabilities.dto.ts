import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsISO8601,
  IsInt,
  IsNotEmpty,
  IsOptional,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO que representa los límites de uso de una característica específica
 */
export class FeatureLimitDto {
  @ApiProperty({
    description: 'Cantidad de veces que se ha usado la característica hoy',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  used: number;

  @ApiProperty({
    description:
      'Límite máximo de uso diario (999999 indica ilimitado para usuarios PREMIUM)',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  limit: number;

  @ApiProperty({
    description:
      'Indica si el usuario puede usar la característica (true si used < limit)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  canUse: boolean;

  @ApiProperty({
    description:
      'Fecha y hora ISO 8601 cuando se resetean los límites (medianoche UTC)',
    example: '2026-01-09T00:00:00.000Z',
  })
  @IsISO8601()
  @IsNotEmpty()
  resetAt: string;
}

/**
 * DTO para límites del Péndulo con soporte de períodos lifetime/monthly/daily
 */
export class PendulumLimitDto {
  @ApiProperty({
    description:
      'Cantidad de veces que se ha usado el péndulo en el período actual',
    example: 1,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  used: number;

  @ApiProperty({
    description: 'Límite máximo de uso en el período',
    example: 3,
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  @IsNotEmpty()
  limit: number;

  @ApiProperty({
    description:
      'Indica si el usuario puede usar el péndulo (true si used < limit)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  canUse: boolean;

  @ApiProperty({
    description:
      'Fecha y hora ISO 8601 cuando se resetean los límites (null para lifetime)',
    example: '2026-02-01T00:00:00.000Z',
    nullable: true,
  })
  @IsOptional()
  @IsISO8601()
  resetAt: string | null;

  @ApiProperty({
    description: 'Período del límite',
    example: 'monthly',
    enum: ['daily', 'monthly', 'lifetime'],
  })
  @IsNotEmpty()
  period: 'daily' | 'monthly' | 'lifetime';
}

/**
 * Enum para los tipos de plan de usuario
 */
export enum UserPlanType {
  ANONYMOUS = 'anonymous',
  FREE = 'free',
  PREMIUM = 'premium',
}

/**
 * DTO que representa todas las capacidades y límites del usuario
 * Este DTO es el contrato entre backend y frontend para el sistema de capabilities
 */
export class UserCapabilitiesDto {
  @ApiProperty({
    description: 'Límites de uso de la Carta del Día',
    type: FeatureLimitDto,
  })
  @ValidateNested()
  @Type(() => FeatureLimitDto)
  @IsNotEmpty()
  dailyCard: FeatureLimitDto;

  @ApiProperty({
    description: 'Límites de uso de Tiradas de Tarot',
    type: FeatureLimitDto,
  })
  @ValidateNested()
  @Type(() => FeatureLimitDto)
  @IsNotEmpty()
  tarotReadings: FeatureLimitDto;

  @ApiProperty({
    description:
      'Indica si el usuario puede crear una lectura de Carta del Día (conveniente)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  canCreateDailyReading: boolean;

  @ApiProperty({
    description:
      'Indica si el usuario puede crear una lectura de Tirada de Tarot (conveniente)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  canCreateTarotReading: boolean;

  @ApiProperty({
    description:
      'Indica si el usuario puede usar interpretaciones con IA (solo PREMIUM)',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  canUseAI: boolean;

  @ApiProperty({
    description:
      'Indica si el usuario puede hacer preguntas personalizadas (solo PREMIUM)',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  canUseCustomQuestions: boolean;

  @ApiProperty({
    description:
      'Indica si el usuario puede usar spreads avanzados de 5+ cartas (solo PREMIUM)',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  canUseAdvancedSpreads: boolean;

  @ApiProperty({
    description: 'Plan actual del usuario',
    enum: UserPlanType,
    example: UserPlanType.FREE,
  })
  @IsEnum(UserPlanType)
  @IsNotEmpty()
  plan: UserPlanType;

  @ApiProperty({
    description: 'Indica si el usuario está autenticado (no es anónimo)',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  isAuthenticated: boolean;

  @ApiProperty({
    description: 'Límites de uso del Péndulo Digital',
    type: PendulumLimitDto,
  })
  @ValidateNested()
  @Type(() => PendulumLimitDto)
  @IsNotEmpty()
  pendulum: PendulumLimitDto;
}
