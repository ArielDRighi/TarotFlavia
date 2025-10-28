import {
  IsInt,
  IsArray,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class CardPositionDto {
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

export class GenerateInterpretationDto {
  @ApiProperty({
    example: [1, 5, 9],
    description: 'IDs de las cartas seleccionadas',
  })
  @IsArray()
  @IsInt({ each: true })
  @IsNotEmpty({ message: 'Debe proporcionar al menos una carta' })
  cardIds: number[];

  @ApiProperty({
    example: [
      { position: 'pasado', isReversed: false },
      { position: 'presente', isReversed: true },
      { position: 'futuro', isReversed: false },
    ],
    description: 'Posición y orientación de cada carta',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CardPositionDto)
  positions: CardPositionDto[];

  @ApiProperty({
    example: '¿Tendré éxito en mi nuevo proyecto?',
    description: 'Pregunta o tema de la lectura',
    required: false,
  })
  @IsString()
  @IsOptional()
  question?: string;
}
