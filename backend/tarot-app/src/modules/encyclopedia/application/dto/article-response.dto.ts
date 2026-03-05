import { ApiProperty } from '@nestjs/swagger';
import { ArticleCategory } from '../../enums/article.enums';

/**
 * DTO mínimo para el widget "Ver más"
 *
 * Intencionalmente NO incluye el campo `content` para mantener
 * respuestas rápidas y ligeras en los widgets de los módulos.
 */
export class ArticleSnippetDto {
  @ApiProperty({ example: 1, description: 'ID único del artículo' })
  id: number;

  @ApiProperty({
    example: 'aries',
    description: 'Slug URL-safe del artículo',
  })
  slug: string;

  @ApiProperty({ example: 'Aries', description: 'Nombre en español' })
  nameEs: string;

  @ApiProperty({
    enum: ArticleCategory,
    description: 'Categoría del artículo',
  })
  category: ArticleCategory;

  @ApiProperty({
    example:
      'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal.',
    description: 'Texto breve de 2-3 oraciones para el widget "Ver más"',
  })
  snippet: string;
}

/**
 * DTO de resumen para listados y resultados de búsqueda
 *
 * Extiende ArticleSnippetDto añadiendo imageUrl y sortOrder,
 * pero sigue SIN incluir `content` para mantener las respuestas ligeras.
 */
export class ArticleSummaryDto extends ArticleSnippetDto {
  @ApiProperty({
    example: '/images/encyclopedia/zodiac/aries.jpg',
    nullable: true,
    description: 'URL de la imagen representativa del artículo',
  })
  imageUrl: string | null;

  @ApiProperty({
    example: 1,
    description: 'Orden de presentación dentro de la categoría',
  })
  sortOrder: number;
}

/**
 * DTO de detalle completo de un artículo
 *
 * Incluye el campo `content` (Markdown) y las relaciones resueltas.
 * Usado únicamente en la página de detalle del artículo.
 */
export class ArticleDetailDto extends ArticleSummaryDto {
  @ApiProperty({
    example: 'Aries',
    nullable: true,
    description: 'Nombre en inglés (opcional)',
  })
  nameEn: string | null;

  @ApiProperty({
    description: 'Contenido completo en formato Markdown',
    example: '# Aries\n\n**Fechas:** 21 de marzo - 19 de abril\n...',
  })
  content: string;

  @ApiProperty({
    nullable: true,
    description:
      'Datos estructurados específicos por categoría (símbolo, fechas, elemento, etc.)',
    example: {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
    },
  })
  metadata: Record<string, unknown> | null;

  @ApiProperty({
    type: [ArticleSummaryDto],
    description: 'Artículos relacionados (resueltos de slugs a objetos)',
  })
  relatedArticles: ArticleSummaryDto[];

  @ApiProperty({
    type: [Number],
    nullable: true,
    description: 'IDs de cartas del Tarot relacionadas',
    example: [4],
  })
  relatedTarotCards: number[] | null;
}
