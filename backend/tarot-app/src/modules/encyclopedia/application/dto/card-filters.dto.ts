import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsString,
  IsBoolean,
  MinLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ArcanaType, Element, Suit } from '../../enums/tarot.enums';

/**
 * DTO para filtros de búsqueda de cartas del Tarot
 * Todos los campos son opcionales — se pueden combinar
 */
export class CardFiltersDto {
  @ApiProperty({
    enum: ArcanaType,
    required: false,
    description: 'Filtrar por tipo de arcano (major/minor)',
  })
  @IsOptional()
  @IsEnum(ArcanaType)
  arcanaType?: ArcanaType;

  @ApiProperty({
    enum: Suit,
    required: false,
    description: 'Filtrar por palo (solo Arcanos Menores)',
  })
  @IsOptional()
  @IsEnum(Suit)
  suit?: Suit;

  @ApiProperty({
    enum: Element,
    required: false,
    description: 'Filtrar por elemento esotérico',
  })
  @IsOptional()
  @IsEnum(Element)
  element?: Element;

  @ApiProperty({
    required: false,
    description:
      'Búsqueda por nombre en español o inglés (mínimo 2 caracteres)',
    example: 'loco',
    minLength: 2,
  })
  @IsOptional()
  @IsString()
  @MinLength(2, {
    message: 'El término de búsqueda debe tener al menos 2 caracteres',
  })
  @Transform(({ value }: { value: unknown }) => {
    if (typeof value === 'string') return value.trim();
    return value;
  })
  search?: string;

  @ApiProperty({
    required: false,
    default: false,
    description:
      'Mostrar solo las 16 cartas de corte (Paje, Caballero, Reina, Rey)',
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }: { value: unknown }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  courtOnly?: boolean;
}
