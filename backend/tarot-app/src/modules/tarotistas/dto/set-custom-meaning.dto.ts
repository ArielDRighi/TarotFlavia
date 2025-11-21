import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MinLength, IsOptional } from 'class-validator';

export class SetCustomMeaningDto {
  @ApiProperty({
    description: 'ID de la carta del tarot',
    example: 1,
  })
  @IsInt()
  cardId: number;

  @ApiProperty({
    description: 'Significado personalizado cuando está derecha',
    example: 'Representa un nuevo comienzo lleno de posibilidades infinitas',
    required: false,
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  customMeaningUpright?: string;

  @ApiProperty({
    description: 'Significado personalizado cuando está invertida',
    example: 'Miedo al cambio, resistencia a nuevas oportunidades',
    required: false,
    minLength: 10,
  })
  @IsOptional()
  @IsString()
  @MinLength(10)
  customMeaningReversed?: string;

  @ApiProperty({
    description: 'Keywords personalizados separados por comas',
    example: 'transformación, cambio, renacimiento',
    required: false,
  })
  @IsOptional()
  @IsString()
  customKeywords?: string;

  @ApiProperty({
    description: 'Descripción personalizada de la carta',
    example: 'Esta carta representa el inicio de un viaje espiritual',
    required: false,
  })
  @IsOptional()
  @IsString()
  customDescription?: string;

  @ApiProperty({
    description: 'Notas privadas del tarotista',
    example: 'Recordar enfatizar el aspecto positivo',
    required: false,
  })
  @IsOptional()
  @IsString()
  privateNotes?: string;
}
