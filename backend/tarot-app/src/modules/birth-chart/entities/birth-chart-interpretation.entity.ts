import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
  AspectType,
} from '../domain/enums';

/**
 * Entidad de Interpretación de Carta Astral
 *
 * Almacena los ~490 textos estáticos de interpretación astrológica.
 * Estos textos son el contenido base para las lecturas de carta astral.
 *
 * Estructura de contenido:
 * - PLANET_INTRO: 10 textos (uno por planeta)
 * - ASCENDANT: 12 textos (uno por signo)
 * - PLANET_IN_SIGN: 120 textos (10 planetas × 12 signos)
 * - PLANET_IN_HOUSE: 120 textos (10 planetas × 12 casas)
 * - ASPECT: ~225 textos (~45 pares × 5 tipos)
 * Total: ~487 interpretaciones
 */
@Entity('birth_chart_interpretations')
@Index('idx_interpretation_category', ['category'])
@Index('idx_interpretation_planet_sign', ['planet', 'sign'])
@Index('idx_interpretation_planet_house', ['planet', 'house'])
@Index('idx_interpretation_aspect', ['planet', 'planet2', 'aspectType'])
@Unique('uq_interpretation_combo', [
  'category',
  'planet',
  'sign',
  'house',
  'aspectType',
  'planet2',
])
export class BirthChartInterpretation {
  @ApiProperty({ example: 1, description: 'ID único de la interpretación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'planet_in_sign',
    description: 'Categoría de la interpretación',
    enum: InterpretationCategory,
  })
  @Column({
    type: 'enum',
    enum: InterpretationCategory,
  })
  category: InterpretationCategory;

  @ApiProperty({
    example: 'sun',
    description: 'Planeta principal (null para ascendente)',
    enum: Planet,
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: Planet,
    nullable: true,
  })
  planet: Planet | null;

  @ApiProperty({
    example: 'aries',
    description: 'Signo zodiacal (para planet_in_sign y ascendant)',
    enum: ZodiacSign,
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: ZodiacSign,
    nullable: true,
  })
  sign: ZodiacSign | null;

  @ApiProperty({
    example: 1,
    description: 'Número de casa (para planet_in_house)',
    nullable: true,
  })
  @Column({
    type: 'smallint',
    nullable: true,
  })
  house: number | null;

  @ApiProperty({
    example: 'conjunction',
    description: 'Tipo de aspecto (para category=aspect)',
    enum: AspectType,
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: AspectType,
    nullable: true,
  })
  aspectType: AspectType | null;

  @ApiProperty({
    example: 'moon',
    description: 'Segundo planeta del aspecto (para category=aspect)',
    enum: Planet,
    nullable: true,
  })
  @Column({
    type: 'enum',
    enum: Planet,
    nullable: true,
  })
  planet2: Planet | null;

  @ApiProperty({
    example: 'El Sol en Aries representa una personalidad...',
    description: 'Texto de la interpretación',
  })
  @Column({ type: 'text' })
  content: string;

  @ApiProperty({
    example: 'Personalidad dinámica y emprendedora',
    description: 'Resumen corto para vistas compactas',
    nullable: true,
  })
  @Column({ type: 'varchar', length: 255, nullable: true })
  summary: string | null;

  @ApiProperty({
    example: true,
    description: 'Si la interpretación está activa',
  })
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @ApiProperty({ example: '2026-02-06T12:00:00Z' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ example: '2026-02-06T12:00:00Z' })
  @UpdateDateColumn()
  updatedAt: Date;

  // ============================================================================
  // MÉTODOS HELPER ESTÁTICOS
  // ============================================================================

  /**
   * Genera la clave única para buscar una interpretación
   *
   * @param category - Categoría de interpretación
   * @param planet - Planeta principal (opcional)
   * @param sign - Signo zodiacal (opcional)
   * @param house - Número de casa (opcional)
   * @param aspectType - Tipo de aspecto (opcional)
   * @param planet2 - Segundo planeta del aspecto (opcional)
   * @returns Clave única en formato "category:planet:sign:house:aspectType:planet2"
   *
   * @example
   * ```typescript
   * // Planeta en signo
   * generateKey(InterpretationCategory.PLANET_IN_SIGN, Planet.SUN, ZodiacSign.ARIES)
   * // => "planet_in_sign:sun:aries::"
   *
   * // Aspecto
   * generateKey(InterpretationCategory.ASPECT, Planet.MARS, null, null, AspectType.TRINE, Planet.JUPITER)
   * // => "aspect:mars:::trine:jupiter"
   * ```
   */
  static generateKey(
    category: InterpretationCategory,
    planet?: Planet | null,
    sign?: ZodiacSign | null,
    house?: number | null,
    aspectType?: AspectType | null,
    planet2?: Planet | null,
  ): string {
    return `${category}:${planet || ''}:${sign || ''}:${house || ''}:${aspectType || ''}:${planet2 || ''}`;
  }

  /**
   * Valida que la combinación de campos sea coherente con la categoría
   *
   * @param category - Categoría de interpretación
   * @param planet - Planeta principal (opcional)
   * @param sign - Signo zodiacal (opcional)
   * @param house - Número de casa (opcional)
   * @param aspectType - Tipo de aspecto (opcional)
   * @param planet2 - Segundo planeta del aspecto (opcional)
   * @returns Objeto con validación: { valid: boolean, error?: string }
   *
   * @example
   * ```typescript
   * // Válido
   * validateCombination(InterpretationCategory.PLANET_INTRO, Planet.SUN)
   * // => { valid: true }
   *
   * // Inválido
   * validateCombination(InterpretationCategory.PLANET_INTRO)
   * // => { valid: false, error: "planet_intro requires planet" }
   * ```
   */
  static validateCombination(
    category: InterpretationCategory,
    planet?: Planet | null,
    sign?: ZodiacSign | null,
    house?: number | null,
    aspectType?: AspectType | null,
    planet2?: Planet | null,
  ): { valid: boolean; error?: string } {
    switch (category) {
      case InterpretationCategory.PLANET_INTRO:
        if (!planet) {
          return { valid: false, error: 'planet_intro requires planet' };
        }
        if (sign || house || aspectType || planet2) {
          return { valid: false, error: 'planet_intro only needs planet' };
        }
        break;

      case InterpretationCategory.PLANET_IN_SIGN:
        if (!planet || !sign) {
          return {
            valid: false,
            error: 'planet_in_sign requires planet and sign',
          };
        }
        break;

      case InterpretationCategory.PLANET_IN_HOUSE:
        if (!planet || !house) {
          return {
            valid: false,
            error: 'planet_in_house requires planet and house',
          };
        }
        break;

      case InterpretationCategory.ASPECT:
        if (!planet || !planet2 || !aspectType) {
          return {
            valid: false,
            error: 'aspect requires planet, planet2, and aspectType',
          };
        }
        break;

      case InterpretationCategory.ASCENDANT:
        if (!sign) {
          return { valid: false, error: 'ascendant requires sign' };
        }
        if (planet || house || aspectType || planet2) {
          return { valid: false, error: 'ascendant only needs sign' };
        }
        break;
    }

    return { valid: true };
  }
}
