import {
  IsArray,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
  IsInt,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class CardPositionDto {
  @ApiProperty({ example: 1, description: 'ID de la carta' })
  @IsInt()
  cardId: number;

  @ApiProperty({
    example: 'pasado',
    description: 'Posición de la carta en la lectura',
  })
  @IsString()
  position: string;

  @ApiProperty({
    example: false,
    description: 'Si la carta está invertida o no',
  })
  @IsBoolean()
  isReversed: boolean;
}

export class CreateReadingDto {
  @ApiProperty({
    example: 'Mi futuro profesional',
    description: 'Pregunta o tema de la lectura',
    required: false,
  })
  @IsString()
  @IsOptional()
  question?: string;

  @ApiProperty({
    example: 1,
    description: 'ID del mazo utilizado para la lectura',
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID del mazo es requerido' })
  deckId: number;

  @ApiProperty({
    example: 1,
    description: 'ID de la tirada utilizada para la lectura',
  })
  @IsInt()
  @IsNotEmpty({ message: 'El ID de la tirada es requerido' })
  spreadId: number;

  @ApiProperty({
    type: [Number],
    example: [1, 5, 9],
    description: 'IDs de las cartas seleccionadas',
  })
  @IsArray()
  @IsNotEmpty({ each: true })
  cardIds: number[];

  @ApiProperty({
    type: [CardPositionDto],
    description: 'Posición y orientación de cada carta',
  })
  @ValidateNested({ each: true })
  @Type(() => CardPositionDto)
  cardPositions: CardPositionDto[];

  @ApiProperty({
    example: true,
    description: 'Si se debe generar una interpretación automática',
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  generateInterpretation: boolean = true;
}
