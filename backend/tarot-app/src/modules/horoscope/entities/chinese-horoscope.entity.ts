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
 * Entidad para almacenar horóscopos anuales del zodiaco chino generados por IA
 *
 * Un horóscopo chino contiene predicciones anuales para un animal específico
 * del zodiaco chino en un año determinado. Incluye visión general, áreas
 * específicas (amor, carrera, bienestar, finanzas), elementos de suerte,
 * compatibilidad con otros animales y highlights mensuales.
 *
 * Diferencias clave con horóscopo occidental:
 * - Es ANUAL (no diario) - un horóscopo por animal por año
 * - Incluye 'career' y 'finance' como áreas separadas
 * - Los elementos de suerte incluyen direcciones (feng shui)
 * - La compatibilidad es con otros animales del zodiaco chino (no signos)
 *
 * Índices:
 * - idx_chinese_horoscope_animal_year: Único en (animal, year) - previene duplicados
 * - idx_chinese_horoscope_year: Permite búsquedas rápidas por año
 */
@Entity('chinese_horoscopes')
@Index('idx_chinese_horoscope_animal_year', ['animal', 'year'], {
  unique: true,
})
@Index('idx_chinese_horoscope_year', ['year'])
export class ChineseHoroscope {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Animal del zodiaco chino al que pertenece el horóscopo
   * Valores: rat, ox, tiger, rabbit, dragon, snake, horse, goat, monkey, rooster, dog, pig
   */
  @Column({ type: 'enum', enum: ChineseZodiacAnimal })
  animal: ChineseZodiacAnimal;

  /**
   * Año del horóscopo (almacenado como SMALLINT)
   * IMPORTANTE: Es el año calendario occidental (ej: 2024), NO el año chino
   * El año chino se calcula considerando la fecha del Año Nuevo Chino
   *
   * Rango típico: 2020-2050
   */
  @Column({ type: 'smallint' })
  year: number;

  /**
   * Visión general del año para este animal
   * Resumen de las predicciones principales (3-4 oraciones)
   */
  @Column({ name: 'general_overview', type: 'text' })
  generalOverview: string;

  /**
   * Áreas específicas del horóscopo con contenido y puntuación
   * Almacenado como JSONB para permitir consultas flexibles
   *
   * Estructura:
   * {
   *   love: { content: string, rating: 1-10 },
   *   career: { content: string, rating: 1-10 },
   *   wellness: { content: string, rating: 1-10 },
   *   finance: { content: string, rating: 1-10 }
   * }
   *
   * NOTA: 'career' y 'finance' son diferentes al horóscopo occidental
   * que usa 'love', 'wellness', 'money'
   */
  @Column({ type: 'jsonb' })
  areas: {
    love: { content: string; rating: number };
    career: { content: string; rating: number };
    wellness: { content: string; rating: number };
    finance: { content: string; rating: number };
  };

  /**
   * Elementos de suerte para el año
   * Almacenado como JSONB
   *
   * Estructura:
   * {
   *   numbers: number[],       // Ej: [3, 7, 9]
   *   colors: string[],         // Ej: ["Rojo", "Dorado"]
   *   directions: string[],     // Ej: ["Sur", "Este"] - Importante en feng shui
   *   months: number[]          // Ej: [3, 6, 9] - Meses favorables (1-12)
   * }
   *
   * IMPORTANTE: Las direcciones son clave en la astrología china/feng shui
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
   * Almacenado como JSONB con 3 niveles
   *
   * Estructura:
   * {
   *   best: ChineseZodiacAnimal[],        // Mejor compatibilidad
   *   good: ChineseZodiacAnimal[],        // Buena compatibilidad
   *   challenging: ChineseZodiacAnimal[]  // Compatibilidad desafiante
   * }
   *
   * IMPORTANTE: La compatibilidad es específica del año y puede variar
   * según el elemento del año
   */
  @Column({ type: 'jsonb' })
  compatibility: {
    best: ChineseZodiacAnimal[];
    good: ChineseZodiacAnimal[];
    challenging: ChineseZodiacAnimal[];
  };

  /**
   * Resumen de meses clave del año (opcional)
   * Descripción de los meses más importantes y qué esperar
   * Ejemplo: "Marzo trae nuevas oportunidades. Junio requiere paciencia..."
   */
  @Column({ name: 'monthly_highlights', type: 'text', nullable: true })
  monthlyHighlights: string | null;

  /**
   * Proveedor de IA usado para generar el horóscopo
   * Ejemplos: 'gemini', 'openai', 'groq'
   */
  @Column({ name: 'ai_provider', type: 'varchar', length: 50, nullable: true })
  aiProvider: string | null;

  /**
   * Modelo de IA específico usado
   * Ejemplos: 'gemini-pro', 'gpt-4', 'llama-3.1-70b-versatile'
   */
  @Column({ name: 'ai_model', type: 'varchar', length: 100, nullable: true })
  aiModel: string | null;

  /**
   * Cantidad de tokens consumidos en la generación
   * Para tracking de costos y monitoreo
   */
  @Column({ name: 'tokens_used', type: 'int', default: 0 })
  tokensUsed: number;

  /**
   * Contador de visualizaciones del horóscopo
   * Se incrementa cada vez que un usuario consulta este horóscopo
   */
  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
