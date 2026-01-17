import { ApiProperty } from '@nestjs/swagger';
import { ZodiacSign } from '../../../../common/utils/zodiac.utils';

/**
 * DTO para representar un área específica del horóscopo
 */
export class HoroscopeAreaDto {
  @ApiProperty({
    example: 'Hoy es un buen día para el amor...',
    description: 'Contenido de la predicción para esta área',
  })
  content: string;

  @ApiProperty({
    example: 8,
    minimum: 1,
    maximum: 10,
    description: 'Puntuación de la energía en esta área (1-10)',
  })
  score: number;
}

/**
 * DTO para la respuesta completa de un horóscopo diario
 */
export class HoroscopeResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID único del horóscopo',
  })
  id: number;

  @ApiProperty({
    enum: ZodiacSign,
    example: ZodiacSign.ARIES,
    description: 'Signo zodiacal',
  })
  zodiacSign: ZodiacSign;

  @ApiProperty({
    example: '2026-01-17',
    description: 'Fecha del horóscopo (YYYY-MM-DD)',
  })
  horoscopeDate: string;

  @ApiProperty({
    example: 'Hoy la energía cósmica te impulsa hacia nuevos horizontes...',
    description: 'Contenido general del horóscopo',
  })
  generalContent: string;

  @ApiProperty({
    description: 'Predicciones por área con contenido y puntuación',
    type: 'object',
    properties: {
      love: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          score: { type: 'number' },
        },
      },
      wellness: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          score: { type: 'number' },
        },
      },
      money: {
        type: 'object',
        properties: {
          content: { type: 'string' },
          score: { type: 'number' },
        },
      },
    },
  })
  areas: {
    love: HoroscopeAreaDto;
    wellness: HoroscopeAreaDto; // Bienestar: energía, descanso, estrés, meditación, autocuidado
    money: HoroscopeAreaDto;
  };

  @ApiProperty({
    example: 7,
    nullable: true,
    description: 'Número de la suerte (1-99)',
    required: false,
  })
  luckyNumber: number | null;

  @ApiProperty({
    example: 'Verde esmeralda',
    nullable: true,
    description: 'Color de la suerte',
    required: false,
  })
  luckyColor: string | null;

  @ApiProperty({
    example: 'Media mañana',
    nullable: true,
    description: 'Horario de la suerte',
    required: false,
  })
  luckyTime: string | null;
}
