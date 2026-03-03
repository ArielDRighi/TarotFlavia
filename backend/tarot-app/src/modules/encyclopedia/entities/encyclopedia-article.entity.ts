import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ArticleCategory } from '../enums/article.enums';

/**
 * Entidad de Artículos de la Enciclopedia Mística
 *
 * Almacena todos los contenidos no-tarot de la enciclopedia:
 * signos zodiacales, planetas, casas astrales, elementos,
 * modalidades y guías de actividades.
 *
 * Soporta ~95 artículos de 11 categorías distintas.
 *
 * Acceso público — sin restricciones de plan de usuario.
 */
@Entity('encyclopedia_articles')
@Index('idx_article_category', ['category'])
export class EncyclopediaArticle {
  @ApiProperty({ example: 1, description: 'ID único del artículo' })
  @PrimaryGeneratedColumn()
  id: number;

  // ============================================================================
  // IDENTIFICACIÓN
  // ============================================================================

  @ApiProperty({
    example: 'aries',
    description:
      'Slug único URL-safe para el artículo (minúsculas, guiones en lugar de espacios)',
  })
  @Index('idx_article_slug', { unique: true })
  @Column({ type: 'varchar', length: 80, unique: true, name: 'slug' })
  slug: string;

  @ApiProperty({
    example: 'Aries',
    description: 'Nombre del artículo en español',
  })
  @Column({ type: 'varchar', length: 120, name: 'name_es' })
  nameEs: string;

  @ApiProperty({
    example: 'Aries',
    nullable: true,
    description: 'Nombre del artículo en inglés (opcional)',
  })
  @Column({ type: 'varchar', length: 120, nullable: true, name: 'name_en' })
  nameEn: string | null;

  // ============================================================================
  // CLASIFICACIÓN
  // ============================================================================

  @ApiProperty({
    enum: ArticleCategory,
    description: 'Categoría del artículo (signo zodiacal, planeta, guía, etc.)',
  })
  @Column({
    type: 'enum',
    enum: ArticleCategory,
    name: 'category',
    enumName: 'enc_article_category_enum',
  })
  category: ArticleCategory;

  // ============================================================================
  // CONTENIDO
  // ============================================================================

  @ApiProperty({
    description:
      'Texto breve de 2-3 oraciones para el widget "Ver más" en páginas de módulos',
    example:
      'Aries es el primer signo del zodíaco, regido por Marte, con elemento Fuego y modalidad Cardinal.',
  })
  @Column({ type: 'text', name: 'snippet' })
  snippet: string;

  @ApiProperty({
    description:
      'Contenido completo en formato Markdown para la página de detalle',
  })
  @Column({ type: 'text', name: 'content' })
  content: string;

  // ============================================================================
  // METADATA FLEXIBLE (JSONB)
  // ============================================================================

  @ApiProperty({
    nullable: true,
    description:
      'Datos estructurados específicos por categoría: símbolo, fechas, elemento, planeta, compatibilidades, etc.',
    example: {
      symbol: '♈',
      element: 'fire',
      modality: 'cardinal',
      rulingPlanet: 'mars',
      dateRange: '21 Mar - 19 Abr',
    },
  })
  @Column({ type: 'jsonb', nullable: true, name: 'metadata' })
  metadata: Record<string, unknown> | null;

  // ============================================================================
  // RELACIONES
  // ============================================================================

  @ApiProperty({
    type: [String],
    nullable: true,
    description: 'Slugs de artículos relacionados de la enciclopedia',
  })
  @Column({ type: 'jsonb', nullable: true, name: 'related_articles' })
  relatedArticles: string[] | null;

  @ApiProperty({
    type: [Number],
    nullable: true,
    description:
      'IDs de cartas del Tarot relacionadas (referencia a EncyclopediaTarotCard)',
  })
  @Column({ type: 'jsonb', nullable: true, name: 'related_tarot_cards' })
  relatedTarotCards: number[] | null;

  // ============================================================================
  // IMAGEN
  // ============================================================================

  @ApiProperty({
    example: '/images/encyclopedia/zodiac/aries.jpg',
    nullable: true,
    description: 'URL de la imagen representativa del artículo',
  })
  @Column({ type: 'varchar', length: 255, nullable: true, name: 'image_url' })
  imageUrl: string | null;

  // ============================================================================
  // ORDENAMIENTO Y METADATA
  // ============================================================================

  @ApiProperty({
    example: 1,
    description:
      'Orden de presentación dentro de la categoría (0 = sin orden específico)',
  })
  @Column({ type: 'smallint', default: 0, name: 'sort_order' })
  sortOrder: number;

  @ApiProperty({
    example: 0,
    description: 'Contador de vistas (para estadísticas de popularidad)',
  })
  @Column({ type: 'int', default: 0, name: 'view_count' })
  viewCount: number;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
