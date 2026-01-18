import { ApiProperty } from '@nestjs/swagger';
import { IsDateString } from 'class-validator';
import { ChineseZodiacAnimal } from '../../../../common/utils/chinese-zodiac.utils';

/**
 * DTO para calcular el animal del zodiaco chino
 */
export class CalculateAnimalDto {
  @ApiProperty({
    description: 'Fecha de nacimiento en formato ISO 8601 (YYYY-MM-DD)',
    example: '1988-03-15',
  })
  @IsDateString()
  birthDate: string;
}

/**
 * DTO de respuesta para el cálculo del animal
 */
export class CalculateAnimalResponseDto {
  @ApiProperty({
    description: 'Animal del zodiaco chino calculado',
    enum: ChineseZodiacAnimal,
    example: ChineseZodiacAnimal.DRAGON,
  })
  animal: ChineseZodiacAnimal;

  @ApiProperty({
    description: 'Información detallada del animal',
    example: {
      nameEs: 'Dragón',
      nameEn: 'Dragon',
      emoji: '🐉',
      element: 'earth',
      characteristics: ['Confiado', 'Inteligente', 'Entusiasta'],
    },
  })
  animalInfo: {
    nameEs: string;
    nameEn: string;
    emoji: string;
    element: string;
    characteristics: string[];
  };

  @ApiProperty({
    description: 'Año chino correspondiente',
    example: 1988,
  })
  chineseYear: number;
}
