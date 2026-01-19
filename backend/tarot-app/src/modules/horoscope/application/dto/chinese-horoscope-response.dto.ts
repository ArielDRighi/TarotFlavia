import { ApiProperty } from '@nestjs/swagger';
import { ChineseZodiacAnimal } from '../../../../common/utils/chinese-zodiac.utils';

/**
 * DTO para el área de un horóscopo chino
 */
export class ChineseHoroscopeAreaDto {
  @ApiProperty({
    description: 'Contenido de la predicción del área',
    example: 'El amor florecerá este año con nuevas oportunidades...',
  })
  content: string;

  @ApiProperty({
    description: 'Puntuación del área (1-10)',
    example: 8,
    minimum: 1,
    maximum: 10,
  })
  score: number;
}

/**
 * DTO para los elementos de suerte
 */
export class ChineseHoroscopeLuckyDto {
  @ApiProperty({
    description: 'Números de suerte',
    example: [3, 7, 9],
    type: [Number],
  })
  numbers: number[];

  @ApiProperty({
    description: 'Colores de suerte',
    example: ['Rojo', 'Dorado'],
    type: [String],
  })
  colors: string[];

  @ApiProperty({
    description: 'Direcciones auspiciosas (Feng Shui)',
    example: ['Sur', 'Este'],
    type: [String],
  })
  directions: string[];

  @ApiProperty({
    description: 'Meses más favorables del año (1-12)',
    example: [3, 6, 9],
    type: [Number],
  })
  months: number[];
}

/**
 * DTO de respuesta para un horóscopo chino anual
 */
export class ChineseHoroscopeResponseDto {
  @ApiProperty({
    description: 'ID único del horóscopo',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Animal del zodiaco chino',
    enum: ChineseZodiacAnimal,
    example: ChineseZodiacAnimal.DRAGON,
  })
  animal: ChineseZodiacAnimal;

  @ApiProperty({
    description: 'Año gregoriano del horóscopo',
    example: 2026,
  })
  year: number;

  @ApiProperty({
    description: 'Resumen general del año',
    example:
      'Un año de transformación y crecimiento para el Dragón. Las oportunidades abundarán...',
  })
  generalOverview: string;

  @ApiProperty({
    description: 'Predicciones por área de vida',
    example: {
      love: { content: 'El amor florecerá...', score: 8 },
      career: { content: 'Oportunidades laborales...', score: 7 },
      wellness: { content: 'Energía vital elevada...', score: 9 },
      finance: { content: 'Estabilidad financiera...', score: 6 },
    },
  })
  areas: {
    love: ChineseHoroscopeAreaDto;
    career: ChineseHoroscopeAreaDto;
    wellness: ChineseHoroscopeAreaDto;
    finance: ChineseHoroscopeAreaDto;
  };

  @ApiProperty({
    description: 'Elementos de suerte para el año',
    type: ChineseHoroscopeLuckyDto,
  })
  luckyElements: ChineseHoroscopeLuckyDto;

  @ApiProperty({
    description: 'Compatibilidad con otros animales',
    example: {
      best: ['rat', 'monkey'],
      good: ['rooster'],
      challenging: ['dog', 'rabbit'],
    },
  })
  compatibility: {
    best: ChineseZodiacAnimal[];
    good: ChineseZodiacAnimal[];
    challenging: ChineseZodiacAnimal[];
  };

  @ApiProperty({
    description: 'Resumen de meses clave del año',
    example: 'Marzo y junio serán meses de oportunidades profesionales...',
    nullable: true,
  })
  monthlyHighlights: string | null;
}
