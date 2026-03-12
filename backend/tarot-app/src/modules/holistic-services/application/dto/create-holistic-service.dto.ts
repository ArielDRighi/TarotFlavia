import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsInt,
  IsEnum,
  IsOptional,
  IsBoolean,
  IsUrl,
  MaxLength,
  MinLength,
  Min,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SessionType } from '../../../scheduling/domain/enums';

const HOLISTIC_SESSION_TYPES = [
  SessionType.FAMILY_TREE,
  SessionType.ENERGY_CLEANING,
  SessionType.HEBREW_PENDULUM,
] as const;

export class CreateHolisticServiceDto {
  @ApiProperty({ example: 'Trabajo con el Árbol Genealógico', maxLength: 255 })
  @IsString({ message: 'El nombre debe ser texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @MaxLength(255, { message: 'El nombre no puede superar 255 caracteres' })
  name: string;

  @ApiProperty({ example: 'arbol-genealogico', maxLength: 255 })
  @IsString({ message: 'El slug debe ser texto' })
  @IsNotEmpty({ message: 'El slug es requerido' })
  @MaxLength(255, { message: 'El slug no puede superar 255 caracteres' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'El slug solo puede contener letras minúsculas, números y guiones',
  })
  slug: string;

  @ApiProperty({
    example: '¿Qué heredamos del árbol familiar? (y qué hacer con ello)',
    maxLength: 500,
  })
  @IsString({ message: 'La descripción corta debe ser texto' })
  @IsNotEmpty({ message: 'La descripción corta es requerida' })
  @MaxLength(500, {
    message: 'La descripción corta no puede superar 500 caracteres',
  })
  shortDescription: string;

  @ApiProperty({ example: 'Descripción larga del servicio...' })
  @IsString({ message: 'La descripción larga debe ser texto' })
  @IsNotEmpty({ message: 'La descripción larga es requerida' })
  @MinLength(10, {
    message: 'La descripción larga debe tener al menos 10 caracteres',
  })
  longDescription: string;

  @ApiProperty({ example: 15000.0 })
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @IsPositive({ message: 'El precio debe ser mayor a 0' })
  priceArs: number;

  @ApiProperty({ example: 60 })
  @IsInt({ message: 'La duración debe ser un número entero' })
  @Min(1, { message: 'La duración debe ser al menos 1 minuto' })
  durationMinutes: number;

  @ApiProperty({
    enum: HOLISTIC_SESSION_TYPES,
    example: SessionType.FAMILY_TREE,
  })
  @IsEnum(HOLISTIC_SESSION_TYPES, {
    message: `El tipo de sesión debe ser uno de: ${HOLISTIC_SESSION_TYPES.join(', ')}`,
  })
  sessionType: SessionType;

  @ApiProperty({ example: '+5491112345678', maxLength: 50 })
  @IsString({ message: 'El número de WhatsApp debe ser texto' })
  @IsNotEmpty({ message: 'El número de WhatsApp es requerido' })
  @MaxLength(50, {
    message: 'El número de WhatsApp no puede superar 50 caracteres',
  })
  @Matches(/^\+?[\d\s\-()]{7,50}$/, {
    message: 'El número de WhatsApp tiene un formato inválido',
  })
  whatsappNumber: string;

  @ApiProperty({ example: 'https://mpago.la/1234567', maxLength: 500 })
  @IsUrl({}, { message: 'El link de Mercado Pago debe ser una URL válida' })
  @MaxLength(500, {
    message: 'El link de Mercado Pago no puede superar 500 caracteres',
  })
  mercadoPagoLink: string;

  @ApiProperty({
    example: 'https://example.com/image.jpg',
    required: false,
    nullable: true,
  })
  @IsOptional()
  @IsUrl({}, { message: 'La URL de imagen debe ser una URL válida' })
  @MaxLength(500, {
    message: 'La URL de imagen no puede superar 500 caracteres',
  })
  imageUrl?: string;

  @ApiProperty({ example: 0, required: false })
  @IsOptional()
  @IsInt({ message: 'El orden de visualización debe ser un número entero' })
  @Min(0, { message: 'El orden de visualización debe ser mayor o igual a 0' })
  displayOrder?: number;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean({ message: 'El estado activo debe ser verdadero o falso' })
  isActive?: boolean;
}
