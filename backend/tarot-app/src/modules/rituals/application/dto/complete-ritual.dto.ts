import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
  MaxLength,
} from 'class-validator';

/**
 * DTO para marcar un ritual como completado
 */
export class CompleteRitualDto {
  @ApiPropertyOptional({ description: 'Notas personales del usuario' })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiPropertyOptional({
    description: 'Calificación del ritual (1-5 estrellas)',
    minimum: 1,
    maximum: 5,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({
    description: 'Duración real en minutos',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  durationMinutes?: number;
}
