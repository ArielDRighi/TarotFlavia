import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { ZodiacSign } from '../../../common/utils/zodiac.utils';

/**
 * Entidad para almacenar horóscopos diarios generados por IA
 *
 * Un horóscopo diario contiene predicciones para un signo zodiacal específico
 * en una fecha determinada. Incluye contenido general y áreas específicas
 * (amor, bienestar, dinero) con sus respectivas puntuaciones.
 *
 * Índices:
 * - idx_horoscope_sign_date: Único en (zodiacSign, horoscopeDate) - previene duplicados
 * - idx_horoscope_date: Permite búsquedas rápidas por fecha
 */
@Entity('daily_horoscopes')
@Index('idx_horoscope_sign_date', ['zodiacSign', 'horoscopeDate'], {
  unique: true,
})
@Index('idx_horoscope_date', ['horoscopeDate'])
export class DailyHoroscope {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * Signo zodiacal al que pertenece el horóscopo
   */
  @Column({ name: 'zodiac_sign', type: 'enum', enum: ZodiacSign })
  zodiacSign: ZodiacSign;

  /**
   * Fecha del horóscopo (solo fecha, sin hora)
   * Tipo DATE en PostgreSQL para optimizar almacenamiento y consultas
   */
  @Column({ name: 'horoscope_date', type: 'date' })
  horoscopeDate: Date;

  /**
   * Contenido general del horóscopo para el día
   * Predicción principal que aplica a todo el signo
   */
  @Column({ name: 'general_content', type: 'text' })
  generalContent: string;

  /**
   * Áreas específicas del horóscopo con contenido y puntuación
   * Almacenado como JSONB para permitir consultas flexibles
   *
   * Estructura:
   * {
   *   love: { content: string, score: 1-10 },
   *   wellness: { content: string, score: 1-10 },
   *   money: { content: string, score: 1-10 }
   * }
   */
  @Column({ type: 'jsonb' })
  areas: {
    love: { content: string; score: number };
    wellness: { content: string; score: number };
    money: { content: string; score: number };
  };

  /**
   * Número de la suerte (opcional)
   * Valor entre 1 y 99 típicamente
   */
  @Column({ name: 'lucky_number', type: 'smallint', nullable: true })
  luckyNumber: number | null;

  /**
   * Color de la suerte (opcional)
   * Nombre del color en español
   */
  @Column({ name: 'lucky_color', type: 'varchar', length: 50, nullable: true })
  luckyColor: string | null;

  /**
   * Horario de la suerte (opcional)
   * Ejemplo: "14:00 - 16:00"
   */
  @Column({ name: 'lucky_time', type: 'varchar', length: 100, nullable: true })
  luckyTime: string | null;

  /**
   * Proveedor de IA usado para generar el horóscopo
   * Ejemplos: 'groq', 'openai', 'deepseek'
   */
  @Column({ name: 'ai_provider', type: 'varchar', length: 50, nullable: true })
  aiProvider: string | null;

  /**
   * Modelo de IA específico usado
   * Ejemplos: 'llama-3.1-70b-versatile', 'gpt-4'
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
   * Tiempo de generación en milisegundos
   * Para métricas de performance
   */
  @Column({ name: 'generation_time_ms', type: 'int', default: 0 })
  generationTimeMs: number;

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
