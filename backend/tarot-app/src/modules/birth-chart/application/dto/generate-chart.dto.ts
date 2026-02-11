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
} from 'class-validator';
import { Transform } from 'class-transformer';
import { SanitizeHtml } from '../../../../common/decorators/sanitize.decorator';

/**
 * DTO para generar una carta astral (sin guardar)
 * Usado por: Anónimos, Free y Premium
 */
export class GenerateChartDto {
  @ApiProperty({
    example: 'María García',
    description: 'Nombre de la persona (para mostrar en la carta)',
  })
  @IsString()
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
  birthDate: string;

  @ApiProperty({
    example: '14:30',
    description: 'Hora de nacimiento (formato 24h: HH:mm)',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'Hora de nacimiento inválida. Use formato HH:mm (ej: 14:30)',
  })
  birthTime: string;

  @ApiProperty({
    example: 'Buenos Aires, Argentina',
    description: 'Lugar de nacimiento (ciudad, país)',
  })
  @IsString()
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
  @Transform(({ value }) => parseFloat(value))
  latitude: number;

  @ApiProperty({
    example: -58.3816,
    description: 'Longitud del lugar de nacimiento (-180 a 180)',
  })
  @IsNumber({}, { message: 'La longitud debe ser un número' })
  @Min(-180, { message: 'La longitud debe ser mayor o igual a -180' })
  @Max(180, { message: 'La longitud debe ser menor o igual a 180' })
  @Transform(({ value }) => parseFloat(value))
  longitude: number;

  @ApiProperty({
    example: 'America/Argentina/Buenos_Aires',
    description: 'Zona horaria IANA del lugar de nacimiento',
  })
  @IsString()
  @IsNotEmpty({ message: 'La zona horaria es requerida' })
  @MaxLength(100)
  timezone: string;
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
  @IsString()
  @MaxLength(100)
  @SanitizeHtml()
  chartName?: string;
}
