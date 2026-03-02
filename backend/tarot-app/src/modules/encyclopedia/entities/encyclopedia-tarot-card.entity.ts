import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  ArcanaType,
  CourtRank,
  Element,
  Planet,
  Suit,
  ZodiacAssociation,
} from '../enums/tarot.enums';

/**
 * Interfaz para las palabras clave de una carta de Tarot
 * Almacenada como JSONB en PostgreSQL
 */
export interface CardKeywords {
  upright: string[];
  reversed: string[];
}

/**
 * Entidad de la Enciclopedia de Tarot
 *
 * Representa cada una de las 78 cartas del Tarot con toda su información
 * esotérica, clasificación y contenido descriptivo.
 *
 * - 22 Arcanos Mayores (número 0-21, romanNumeral no null)
 * - 56 Arcanos Menores (14 cartas × 4 palos, suit no null)
 *   - 40 cartas numéricas (1-10 por palo)
 *   - 16 cartas de corte (Paje, Caballero, Reina, Rey × 4 palos)
 *
 * Acceso público — sin restricciones de plan de usuario.
 */
@Entity('encyclopedia_tarot_cards')
@Index('idx_enc_card_arcana', ['arcanaType'])
@Index('idx_enc_card_suit', ['suit'])
@Index('idx_enc_card_slug', ['slug'], { unique: true })
export class EncyclopediaTarotCard {
  @ApiProperty({ example: 1, description: 'ID único de la carta' })
  @PrimaryGeneratedColumn()
  id: number;

  // ============================================================================
  // IDENTIFICACIÓN
  // ============================================================================

  @ApiProperty({
    example: 'the-fool',
    description: 'Slug único para URL amigable (ej: "the-fool", "ace-of-cups")',
  })
  @Column({ type: 'varchar', length: 50, unique: true })
  slug: string;

  @ApiProperty({ example: 'The Fool', description: 'Nombre en inglés' })
  @Column({ type: 'varchar', length: 100 })
  nameEn: string;

  @ApiProperty({ example: 'El Loco', description: 'Nombre en español' })
  @Column({ type: 'varchar', length: 100 })
  nameEs: string;

  // ============================================================================
  // CLASIFICACIÓN
  // ============================================================================

  @ApiProperty({
    enum: ArcanaType,
    description: 'Tipo de arcano: mayor o menor',
  })
  @Column({ type: 'enum', enum: ArcanaType })
  arcanaType: ArcanaType;

  @ApiProperty({
    example: 0,
    description: 'Número de la carta (0-21 para Mayores, 1-14 para Menores)',
  })
  @Column({ type: 'smallint' })
  number: number;

  @ApiProperty({
    example: 'I',
    nullable: true,
    description: 'Número romano (solo Arcanos Mayores). Null para Menores.',
  })
  @Column({ type: 'varchar', length: 10, nullable: true })
  romanNumeral: string | null;

  @ApiProperty({
    enum: Suit,
    nullable: true,
    description: 'Palo (solo Arcanos Menores). Null para Mayores.',
  })
  @Column({ type: 'enum', enum: Suit, nullable: true })
  suit: Suit | null;

  @ApiProperty({
    enum: CourtRank,
    nullable: true,
    description: 'Rango de corte (solo cartas de corte). Null para el resto.',
  })
  @Column({ type: 'enum', enum: CourtRank, nullable: true })
  courtRank: CourtRank | null;

  // ============================================================================
  // ASOCIACIONES ESOTÉRICAS
  // ============================================================================

  @ApiProperty({
    enum: Element,
    nullable: true,
    description: 'Elemento asociado a la carta',
  })
  @Column({ type: 'enum', enum: Element, nullable: true })
  element: Element | null;

  @ApiProperty({
    enum: Planet,
    nullable: true,
    description: 'Planeta regente (principalmente Arcanos Mayores)',
  })
  @Column({ type: 'enum', enum: Planet, nullable: true })
  planet: Planet | null;

  @ApiProperty({
    enum: ZodiacAssociation,
    nullable: true,
    description: 'Signo zodiacal asociado',
  })
  @Column({ type: 'enum', enum: ZodiacAssociation, nullable: true })
  zodiacSign: ZodiacAssociation | null;

  // ============================================================================
  // CONTENIDO
  // ============================================================================

  @ApiProperty({
    description: 'Significado de la carta en posición derecha (normal)',
  })
  @Column({ type: 'text' })
  meaningUpright: string;

  @ApiProperty({
    description: 'Significado de la carta en posición invertida',
  })
  @Column({ type: 'text' })
  meaningReversed: string;

  @ApiProperty({
    nullable: true,
    description: 'Descripción general de la carta e imagen',
  })
  @Column({ type: 'text', nullable: true })
  description: string | null;

  @ApiProperty({
    description:
      'Palabras clave agrupadas por posición (upright/reversed). Almacenado como JSONB.',
  })
  @Column({ type: 'jsonb' })
  keywords: CardKeywords;

  // ============================================================================
  // IMÁGENES
  // ============================================================================

  @ApiProperty({
    example: '/images/tarot/major/00-the-fool.jpg',
    description: 'URL de la imagen principal de la carta',
  })
  @Column({ type: 'varchar', length: 255 })
  imageUrl: string;

  @ApiProperty({
    example: '/images/tarot/major/00-the-fool-thumb.jpg',
    nullable: true,
    description:
      'URL del thumbnail. Si es null, se usa imageUrl como fallback.',
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  thumbnailUrl: string | null;

  // ============================================================================
  // RELACIONES CON OTRAS CARTAS
  // ============================================================================

  @ApiProperty({
    type: [Number],
    nullable: true,
    description:
      'IDs de cartas relacionadas temáticamente. Almacenado como JSONB.',
  })
  @Column({ type: 'jsonb', nullable: true })
  relatedCards: number[] | null;

  // ============================================================================
  // METADATA
  // ============================================================================

  @ApiProperty({
    example: 0,
    description: 'Contador de vistas (para estadísticas de popularidad)',
  })
  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @ApiProperty({ description: 'Fecha de creación del registro' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Fecha de última actualización' })
  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================================
  // MÉTODOS HELPER
  // ============================================================================

  /**
   * Verifica si la carta es una carta de corte (Paje, Caballero, Reina, Rey)
   */
  isCourtCard(): boolean {
    return this.courtRank !== null;
  }

  /**
   * Verifica si la carta pertenece a los Arcanos Mayores
   */
  isMajorArcana(): boolean {
    return this.arcanaType === ArcanaType.MAJOR;
  }

  /**
   * Retorna el nombre en el idioma solicitado
   * Por defecto retorna el nombre en español
   * @param lang - Idioma deseado: 'es' (default) o 'en'
   */
  getDisplayName(lang: 'es' | 'en' = 'es'): string {
    return lang === 'en' ? this.nameEn : this.nameEs;
  }
}
