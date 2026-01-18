import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ChineseZodiacAnimal } from '../../../common/utils/chinese-zodiac.utils';

/**
 * Entidad para almacenar horóscopos chinos anuales generados por IA
 *
 * El horóscopo chino es anual (no diario como el occidental). Cada año se genera
 * un horóscopo completo para cada uno de los 12 animales del zodiaco chino.
 *
 * A diferencia del horóscopo occidental que incluye amor, bienestar y dinero,
 * el horóscopo chino incluye: amor, carrera, bienestar y finanzas.
 *
 * Características únicas:
 * - Generación anual (un registro por animal por año)
 * - Incluye elementos de suerte tradicionales (números, colores, direcciones)
 * - Sistema de compatibilidad entre animales (best, good, challenging)
 * - Predicciones por áreas con scores (1-10)
 *
 * Índices:
 * - idx_chinese_animal_year: Único en (animal, year) - previene duplicados
 * - idx_chinese_year: Permite búsquedas rápidas por año
 */
@Entity('chinese_horoscopes')
@Index('idx_chinese_animal_year', ['animal', 'year'], { unique: true })
@Index('idx_chinese_year', ['year'])
export class ChineseHoroscope {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Animal del zodiaco chino
   */
  @Column({ name: 'zodiac_animal', type: 'enum', enum: ChineseZodiacAnimal })
  animal: ChineseZodiacAnimal;

  /**
   * Año gregoriano del horóscopo (2026, 2027, etc.)
   * Se usa SMALLINT para optimizar almacenamiento (rango: -32768 a 32767)
   */
  @Column({ type: 'smallint' })
  year: number;

  /**
   * Resumen general del año para el animal
   * Vista general de cómo será el año (3-4 oraciones)
   */
  @Column({ name: 'general_overview', type: 'text' })
  generalOverview: string;

  /**
   * Áreas específicas del horóscopo con contenido y score
   * Almacenado como JSONB para permitir consultas flexibles
   *
   * IMPORTANTE: El horóscopo chino incluye 'career' y 'finance' como áreas separadas,
   * a diferencia del horóscopo occidental que solo incluye 'money'.
   *
   * Nota: La validación del rango de score (1-10) se realiza en la capa de servicio
   * durante la generación del horóscopo, no a nivel de entidad.
   *
   * Estructura:
   * {
   *   love: { content: string, score: 1-10 },
   *   career: { content: string, score: 1-10 },
   *   wellness: { content: string, score: 1-10 },
   *   finance: { content: string, score: 1-10 }
   * }
   */
  @Column({ type: 'jsonb' })
  areas: {
    love: { content: string; score: number };
    career: { content: string; score: number };
    wellness: { content: string; score: number };
    finance: { content: string; score: number };
  };

  /**
   * Elementos de suerte tradicionales del Feng Shui
   * Almacenado como JSONB para flexibilidad
   *
   * IMPORTANTE: Las direcciones son cruciales en el Feng Shui chino
   * (ejemplo: "Sur", "Este", "Noreste")
   *
   * Estructura:
   * {
   *   numbers: [3, 7, 9],
   *   colors: ["Rojo", "Dorado"],
   *   directions: ["Sur", "Este"],
   *   months: [3, 6, 9]  // Meses más favorables (1-12)
   * }
   */
  @Column({ name: 'lucky_elements', type: 'jsonb' })
  luckyElements: {
    numbers: number[];
    colors: string[];
    directions: string[];
    months: number[];
  };

  /**
   * Compatibilidad con otros animales del zodiaco chino
   * Información estática basada en la astrología china tradicional
   *
   * Estructura:
   * {
   *   best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
   *   good: [ChineseZodiacAnimal.ROOSTER],
   *   challenging: [ChineseZodiacAnimal.DOG, ChineseZodiacAnimal.RABBIT]
   * }
   */
  @Column({ type: 'jsonb' })
  compatibility: {
    best: ChineseZodiacAnimal[];
    good: ChineseZodiacAnimal[];
    challenging: ChineseZodiacAnimal[];
  };

  /**
   * Resumen de meses clave del año
   * Predicciones de qué esperar en diferentes momentos del año
   * Ejemplo: "Marzo y junio serán meses de oportunidades profesionales..."
   */
  @Column({ name: 'monthly_highlights', type: 'text', nullable: true })
  monthlyHighlights: string | null;

  /**
   * Proveedor de IA usado para generar el horóscopo
   * Ejemplos: 'groq', 'openai', 'deepseek', 'gemini'
   */
  @Column({ name: 'ai_provider', type: 'varchar', length: 50, nullable: true })
  aiProvider: string | null;

  /**
   * Modelo de IA específico usado
   * Ejemplos: 'llama-3.1-70b-versatile', 'gpt-4', 'gemini-1.5-pro'
   */
  @Column({ name: 'ai_model', type: 'varchar', length: 100, nullable: true })
  aiModel: string | null;

  /**
   * Cantidad de tokens consumidos en la generación
   * Para tracking de costos y monitoreo de uso de IA
   */
  @Column({ name: 'tokens_used', type: 'int', default: 0 })
  tokensUsed: number;

  /**
   * Tiempo de generación en milisegundos
   * Para métricas de performance y optimización de IA
   */
  @Column({ name: 'generation_time_ms', type: 'int', default: 0 })
  generationTimeMs: number;

  /**
   * Contador de visualizaciones del horóscopo
   * Se incrementa cada vez que un usuario consulta este horóscopo
   * Útil para métricas de engagement
   */
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
