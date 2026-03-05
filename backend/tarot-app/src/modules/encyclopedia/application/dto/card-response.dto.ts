import { ApiProperty } from '@nestjs/swagger';
import {
  ArcanaType,
  CourtRank,
  Element,
  Planet,
  Suit,
  ZodiacAssociation,
} from '../../enums/tarot.enums';
import { ArticleSummaryDto } from './article-response.dto';

/**
 * DTO para las palabras clave de una carta (upright/reversed)
 */
export class CardKeywordsDto {
  @ApiProperty({
    example: ['Amor', 'Intuición', 'Creatividad'],
    description: 'Palabras clave en posición derecha',
  })
  upright: string[];

  @ApiProperty({
    example: ['Bloqueo', 'Desamor', 'Represión'],
    description: 'Palabras clave en posición invertida',
  })
  reversed: string[];
}

/**
 * DTO resumen de carta — usado en listados y grillas
 * No incluye campos de contenido largo (meaningUpright, meaningReversed, etc.)
 */
export class CardSummaryDto {
  @ApiProperty({ example: 1, description: 'ID único de la carta' })
  id: number;

  @ApiProperty({
    example: 'the-fool',
    description: 'Slug único para URL amigable',
  })
  slug: string;

  @ApiProperty({ example: 'El Loco', description: 'Nombre en español' })
  nameEs: string;

  @ApiProperty({
    enum: ArcanaType,
    description: 'Tipo de arcano: major o minor',
  })
  arcanaType: ArcanaType;

  @ApiProperty({
    example: 0,
    description: 'Número de la carta (0-21 para Mayores, 1-14 para Menores)',
  })
  number: number;

  @ApiProperty({
    enum: Suit,
    nullable: true,
    description: 'Palo (solo Arcanos Menores). Null para Mayores.',
  })
  suit: Suit | null;

  @ApiProperty({
    example: '/images/tarot/major/00-the-fool-thumb.jpg',
    description: 'URL del thumbnail. Fallback a imageUrl si no existe.',
  })
  thumbnailUrl: string;
}

/**
 * DTO de navegación anterior/siguiente entre cartas
 * Usado en GET /encyclopedia/cards/:slug/navigation
 */
export class CardNavigationResponseDto {
  @ApiProperty({
    type: CardSummaryDto,
    nullable: true,
    description:
      'Carta anterior en el orden canónico del mazo. Null si es la primera.',
  })
  previous: CardSummaryDto | null;

  @ApiProperty({
    type: CardSummaryDto,
    nullable: true,
    description:
      'Carta siguiente en el orden canónico del mazo. Null si es la última.',
  })
  next: CardSummaryDto | null;
}

/**
 * DTO de detalle completo de una carta
 * Extiende CardSummaryDto con todos los campos de contenido
 */
export class CardDetailDto extends CardSummaryDto {
  @ApiProperty({ example: 'The Fool', description: 'Nombre en inglés' })
  nameEn: string;

  @ApiProperty({
    example: '0',
    nullable: true,
    description: 'Número romano (solo Arcanos Mayores)',
  })
  romanNumeral: string | null;

  @ApiProperty({
    enum: CourtRank,
    nullable: true,
    description: 'Rango de corte (solo cartas de corte)',
  })
  courtRank: CourtRank | null;

  @ApiProperty({
    enum: Element,
    nullable: true,
    description: 'Elemento asociado a la carta',
  })
  element: Element | null;

  @ApiProperty({
    enum: Planet,
    nullable: true,
    description: 'Planeta regente',
  })
  planet: Planet | null;

  @ApiProperty({
    enum: ZodiacAssociation,
    nullable: true,
    description: 'Signo zodiacal asociado',
  })
  zodiacSign: ZodiacAssociation | null;

  @ApiProperty({ description: 'Significado de la carta en posición derecha' })
  meaningUpright: string;

  @ApiProperty({ description: 'Significado de la carta en posición invertida' })
  meaningReversed: string;

  @ApiProperty({
    nullable: true,
    description: 'Descripción general de la carta e imagen',
  })
  description: string | null;

  @ApiProperty({
    type: CardKeywordsDto,
    description: 'Palabras clave por posición',
  })
  keywords: CardKeywordsDto;

  @ApiProperty({
    example: '/images/tarot/major/00-the-fool.jpg',
    description: 'URL de la imagen principal',
  })
  imageUrl: string;

  @ApiProperty({
    type: [Number],
    nullable: true,
    description: 'IDs de cartas relacionadas temáticamente',
  })
  relatedCards: number[] | null;
}

/**
 * DTO de resultado de búsqueda global unificada
 * Combina cartas del Tarot y artículos de la enciclopedia en un solo resultado
 */
export class GlobalSearchResultDto {
  @ApiProperty({
    type: [CardSummaryDto],
    description: 'Cartas del Tarot que coinciden con el término de búsqueda',
  })
  tarotCards: CardSummaryDto[];

  @ApiProperty({
    type: [ArticleSummaryDto],
    description: 'Artículos de la enciclopedia que coinciden con el término',
  })
  articles: ArticleSummaryDto[];

  @ApiProperty({
    example: 5,
    description: 'Total de resultados combinados (cartas + artículos)',
  })
  total: number;
}
