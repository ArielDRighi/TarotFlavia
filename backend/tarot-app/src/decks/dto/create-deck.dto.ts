import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDeckDto {
  @ApiProperty({
    example: 'Rider-Waite',
    description: 'Nombre del mazo de tarot',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre del mazo es requerido' })
  name: string;

  @ApiProperty({
    example:
      'El tarot Rider-Waite es uno de los mazos más populares y reconocidos mundialmente...',
    description: 'Descripción detallada del mazo',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  description: string;

  @ApiProperty({
    example: 'https://ejemplo.com/mazos/rider-waite.jpg',
    description: 'URL de la imagen de portada del mazo',
  })
  @IsUrl({}, { message: 'Debe proporcionar una URL válida para la imagen' })
  @IsNotEmpty()
  imageUrl: string;

  @ApiProperty({
    example: 78,
    description: 'Número de cartas en el mazo',
    required: false,
    default: 78,
  })
  @IsOptional()
  @IsInt({ message: 'El número de cartas debe ser un entero' })
  @Min(1, { message: 'El mazo debe contener al menos una carta' })
  cardCount?: number;
}
