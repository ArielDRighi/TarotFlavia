import { ApiProperty } from '@nestjs/swagger';
import {
  IsInt,
  IsString,
  MinLength,
  IsOptional,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator';
import { Type } from 'class-transformer';

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

export class BulkImportMeaningsDto {
  @ApiProperty({
    description: 'Array de significados personalizados a importar',
    type: [SetCustomMeaningDto],
    isArray: true,
    minItems: 1,
    maxItems: 78, // Standard tarot deck size
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos un significado' })
  @ArrayMaxSize(78, {
    message: 'No puede importar más de 78 significados (tamaño del deck)',
  })
  @ValidateNested({ each: true })
  @Type(() => SetCustomMeaningDto)
  meanings: SetCustomMeaningDto[];
}
