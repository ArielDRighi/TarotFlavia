import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsNumber,
  IsBoolean,
  IsOptional,
  MaxLength,
  Min,
} from 'class-validator';
import { UserPlan } from '../../users/entities/user.entity';

export class CreatePlanDto {
  @ApiProperty({
    description: 'Tipo de plan',
    enum: UserPlan,
    example: UserPlan.FREE,
  })
  @IsEnum(UserPlan)
  @IsNotEmpty()
  planType: UserPlan;

  @ApiProperty({
    description: 'Nombre del plan',
    example: 'Plan Gratuito',
    maxLength: 100,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description: 'Descripción del plan',
    example: 'Plan básico con lecturas limitadas',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'Precio mensual en USD',
    example: 0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Límite de lecturas mensuales (-1 para ilimitado)',
    example: 10,
    minimum: -1,
  })
  @IsNumber()
  @Min(-1)
  readingsLimit: number;

  @ApiProperty({
    description: 'Cuota mensual de solicitudes IA (-1 para ilimitado)',
    example: 100,
    minimum: -1,
  })
  @IsNumber()
  @Min(-1)
  aiQuotaMonthly: number;

  @ApiProperty({
    description: 'Permite preguntas personalizadas',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowCustomQuestions?: boolean;

  @ApiProperty({
    description: 'Permite compartir lecturas',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowSharing?: boolean;

  @ApiProperty({
    description: 'Permite tiradas avanzadas',
    example: false,
    required: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  allowAdvancedSpreads?: boolean;

  @ApiProperty({
    description: 'Indica si el plan está activo',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
