import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  IsUrl,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class SpreadPositionDto {
  @ApiProperty({
    example: 'Pasado',
    description: 'Nombre de la posición en la tirada',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'Representa eventos pasados que influyeron en la situación actual',
    description: 'Descripción de lo que representa esta posición',
  })
  @IsString()
  @IsNotEmpty()
  description: string;
}

export class CreateSpreadDto {
  @ApiProperty({
    example: 'Tirada de Tres Cartas',
    description: 'Nombre de la tirada',
  })
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la tirada es requerido' })
  name: string;

  @ApiProperty({
    example:
      'Una tirada simple pero poderosa que representa pasado, presente y futuro',
    description: 'Descripción de la tirada',
  })
  @IsString()
  @IsNotEmpty({ message: 'La descripción de la tirada es requerida' })
  description: string;

  @ApiProperty({
    example: 3,
    description: 'Número de cartas utilizadas en esta tirada',
  })
  @IsInt()
  @Min(1, { message: 'La tirada debe contener al menos una carta' })
  cardCount: number;

  @ApiProperty({
    type: [SpreadPositionDto],
    description: 'Definición de las posiciones en esta tirada',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SpreadPositionDto)
  positions: SpreadPositionDto[];

  @ApiProperty({
    example: 'https://ejemplo.com/tiradas/tres-cartas.jpg',
    description: 'URL de la imagen ilustrativa de la tirada',
    required: false,
  })
  @IsUrl({}, { message: 'Debe proporcionar una URL válida para la imagen' })
  @IsOptional()
  imageUrl?: string;
}
