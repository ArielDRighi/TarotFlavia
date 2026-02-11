import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para interpretaciones astrológicas
 *
 * Representa una interpretación de algún elemento de la carta natal:
 * - planet_intro: Introducción general del planeta
 * - planet_in_sign: Planeta en un signo zodiacal
 * - planet_in_house: Planeta en una casa astrológica
 * - aspect: Aspecto entre dos planetas
 * - ascendant: Interpretación del Ascendente
 *
 * Todas las interpretaciones están en ESPAÑOL
 */
export class InterpretationDto {
  @ApiProperty({
    example: 'planet_in_sign',
    description:
      'Categoría de interpretación: planet_intro, planet_in_sign, planet_in_house, aspect, ascendant',
  })
  category: string;

  @ApiProperty({
    example: 'sun',
    description:
      'Identificador del planeta (requerido para categorías: planet_intro, planet_in_sign, planet_in_house)',
    required: false,
  })
  planet?: string;

  @ApiProperty({
    example: 'leo',
    description:
      'Signo zodiacal (requerido para categorías: planet_in_sign, ascendant)',
    required: false,
  })
  sign?: string;

  @ApiProperty({
    example: 5,
    description: 'Número de casa (requerido para categoría: planet_in_house)',
    required: false,
  })
  house?: number;

  @ApiProperty({
    example: 'El Sol en Leo representa una personalidad carismática...',
    description: 'Texto completo de la interpretación en español',
  })
  content: string;

  @ApiProperty({
    example: 'Personalidad carismática y creativa',
    description: 'Resumen breve de la interpretación (opcional)',
    required: false,
  })
  summary?: string;
}
