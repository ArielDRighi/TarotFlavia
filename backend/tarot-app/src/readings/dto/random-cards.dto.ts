import { IsInt, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class RandomCardsDto {
  @ApiProperty({
    example: 3,
    description: 'Número de cartas aleatorias a seleccionar',
    required: false,
    default: 3,
  })
  @IsInt()
  @Min(1, { message: 'Debe solicitar al menos una carta' })
  @Max(10, { message: 'No puede solicitar más de 10 cartas' })
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  count?: number = 3;

  @ApiProperty({
    example: 1,
    description: 'ID del mazo del que seleccionar las cartas',
    required: false,
  })
  @IsInt()
  @IsOptional()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  deckId?: number;
}
