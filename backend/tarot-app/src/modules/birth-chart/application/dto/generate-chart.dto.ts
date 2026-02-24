import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsNumber,
  IsOptional,
  Min,
  Max,
  Matches,
  MaxLength,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SanitizeHtml } from '../../../../common/decorators/sanitize.decorator';
import { OrbSystem } from '../../domain/enums';

/**
 * DTO para generar una carta astral (sin guardar)
 * Usado por: Anónimos, Free y Premium
 */
export class GenerateChartDto {
  @ApiProperty({
    example: 'María García',
    description: 'Nombre de la persona (para mostrar en la carta)',
  })
  @IsString({ message: 'El nombre debe ser un texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(100, { message: 'El nombre no puede exceder 100 caracteres' })
  @SanitizeHtml()
  name: string;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento (formato ISO: YYYY-MM-DD)',
  })
  @IsDateString(
    {},
    { message: 'Fecha de nacimiento inválida. Use formato YYYY-MM-DD' },
  )
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message:
      'Fecha de nacimiento inválida. Use formato YYYY-MM-DD (ej: 1990-05-15)',
  })
  birthDate: string;

  @ApiProperty({
    example: '14:30',
    description: 'Hora de nacimiento (formato 24h: HH:mm)',
  })
  @IsString({ message: 'La hora de nacimiento debe ser un texto' })
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Hora de nacimiento inválida. Use formato HH:mm (ej: 14:30)',
  })
  birthTime: string;

  @ApiProperty({
    example: 'Buenos Aires, Argentina',
    description: 'Lugar de nacimiento (ciudad, país)',
  })
  @IsString({ message: 'El lugar de nacimiento debe ser un texto' })
  @IsNotEmpty({ message: 'El lugar de nacimiento es requerido' })
  @MaxLength(255, { message: 'El lugar no puede exceder 255 caracteres' })
  @SanitizeHtml()
  birthPlace: string;

  @ApiProperty({
    example: -34.6037,
    description: 'Latitud del lugar de nacimiento (-90 a 90)',
  })
  @IsNumber({}, { message: 'La latitud debe ser un número' })
  @Min(-90, { message: 'La latitud debe ser mayor o igual a -90' })
  @Max(90, { message: 'La latitud debe ser menor o igual a 90' })
  @Type(() => Number)
  latitude: number;

  @ApiProperty({
    example: -58.3816,
    description: 'Longitud del lugar de nacimiento (-180 a 180)',
  })
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe ser mayor o igual a -180' })
  @Max(180, { message: 'La longitud debe ser menor o igual a 180' })
  @Type(() => Number)
  longitude: number;

  @ApiProperty({
    example: 'America/Argentina/Buenos_Aires',
    description: 'Zona horaria IANA del lugar de nacimiento',
  })
  @IsString({ message: 'La zona horaria debe ser un texto' })
  @IsNotEmpty({ message: 'La zona horaria es requerida' })
  @MaxLength(100, {
    message: 'La zona horaria no puede exceder 100 caracteres',
  })
  @Matches(
    /^[A-Z][a-zA-Z0-9_+-]*\/[A-Z][a-zA-Z0-9_+-]*(\/[A-Z][a-zA-Z0-9_+-]*)?$/,
    {
      message:
        'Zona horaria inválida. Use formato IANA (ej: America/Argentina/Buenos_Aires)',
    },
  )
  timezone: string;
  @ApiPropertyOptional({
    example: 'commercial',
    description:
      "Sistema de orbes para detección de aspectos. 'strict': orbes puristas. 'commercial': orbes amplios (default, paridad con plataformas comerciales).",
    enum: ['strict', 'commercial'],
    default: 'commercial',
  })
  @IsOptional()
  @IsIn(['strict', 'commercial'], {
    message: "El sistema de orbes debe ser 'strict' o 'commercial'",
  })
  orbSystem?: OrbSystem;
}

/**
 * DTO para crear/guardar una carta astral (solo Premium)
 * Extiende GenerateChartDto con campos adicionales
 */
export class CreateBirthChartDto extends GenerateChartDto {
  @ApiPropertyOptional({
    example: 'Mi carta natal',
    description: 'Nombre personalizado para identificar la carta (opcional)',
  })
  @IsOptional()
  @IsString({ message: 'El nombre de la carta debe ser un texto' })
  @MaxLength(100, {
    message: 'El nombre de la carta no puede exceder 100 caracteres',
  })
  @SanitizeHtml()
  chartName?: string;
}
