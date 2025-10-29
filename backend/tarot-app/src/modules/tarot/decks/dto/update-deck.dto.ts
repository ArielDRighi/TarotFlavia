import {
  IsString,
  IsOptional,
  IsUrl,
  IsInt,
  Min,
  IsBoolean,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDeckDto {
  @ApiProperty({
    example: 'Rider-Waite Deluxe',
    description: 'Nombre actualizado del mazo de tarot',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'El tarot Rider-Waite es uno de los mazos más populares...',
    description: 'Descripción actualizada del mazo',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    example: 'https://ejemplo.com/mazos/rider-waite-nuevo.jpg',
    description: 'URL actualizada de la imagen de portada del mazo',
    required: false,
  })
  @IsUrl({}, { message: 'Debe proporcionar una URL válida para la imagen' })
  @IsOptional()
  imageUrl?: string;

  @ApiProperty({
    example: 78,
    description: 'Número actualizado de cartas en el mazo',
    required: false,
  })
  @IsInt({ message: 'El número de cartas debe ser un entero' })
  @Min(1, { message: 'El mazo debe contener al menos una carta' })
  @IsOptional()
  cardCount?: number;

  @ApiProperty({
    example: true,
    description: 'Si el mazo está activo para ser usado',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
