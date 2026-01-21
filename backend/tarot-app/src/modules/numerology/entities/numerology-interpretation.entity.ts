import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

/**
 * Entidad para almacenar la interpretación IA personalizada del perfil numerológico
 * de un usuario Premium.
 *
 * La interpretación se genera **una única vez** por usuario y persiste permanentemente.
 * Si el usuario ya tiene una interpretación, se retorna la existente sin regenerar.
 *
 * Incluye un snapshot de los números calculados al momento de la generación y
 * metadata sobre el proveedor de IA utilizado.
 *
 * Índices:
 * - idx_numerology_interpretation_user: Único en userId - un usuario solo puede tener una interpretación
 */
@Entity('numerology_interpretations')
@Index('idx_numerology_interpretation_user', ['userId'], { unique: true })
export class NumerologyInterpretation {
  @PrimaryGeneratedColumn()
  id: number;

  /**
   * ID del usuario dueño de la interpretación
   * Relación con User, única por usuario
   */
  @Column({ name: 'user_id' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ===== NÚMEROS CALCULADOS (snapshot al momento de generar) =====

  /**
   * Número de Camino de Vida
   * Propósito de vida principal (1-9, 11, 22, 33)
   */
  @Column({ name: 'life_path', type: 'smallint' })
  lifePath: number;

  /**
   * Número del Día de Nacimiento
   * Talento especial del día (1-9, 11, 22)
   */
  @Column({ name: 'birthday_number', type: 'smallint' })
  birthdayNumber: number;

  /**
   * Número de Expresión/Destino (del nombre completo)
   * Null si no se proporcionó nombre
   */
  @Column({ name: 'expression_number', type: 'smallint', nullable: true })
  expressionNumber: number | null;

  /**
   * Número del Alma (vocales del nombre)
   * Deseos internos, null si no hay nombre
   */
  @Column({ name: 'soul_urge', type: 'smallint', nullable: true })
  soulUrge: number | null;

  /**
   * Número de Personalidad (consonantes del nombre)
   * Cómo te ven otros, null si no hay nombre
   */
  @Column({ name: 'personality', type: 'smallint', nullable: true })
  personality: number | null;

  /**
   * Fecha de nacimiento usada para el cálculo
   * Almacenada para referencia histórica
   */
  @Column({ name: 'birth_date', type: 'date' })
  birthDate: Date;

  /**
   * Nombre completo usado para el cálculo (opcional)
   * Null si solo se usó fecha de nacimiento
   */
  @Column({ name: 'full_name', type: 'varchar', length: 100, nullable: true })
  fullName: string | null;

  // ===== INTERPRETACIÓN GENERADA =====

  /**
   * Interpretación personalizada generada por IA
   * Texto en markdown que analiza la combinación única de números
   */
  @Column({ type: 'text' })
  interpretation: string;

  // ===== METADATA DE IA =====

  /**
   * Proveedor de IA usado para generar la interpretación
   * Ejemplos: 'groq', 'gemini', 'deepseek', 'openai'
   */
  @Column({ name: 'ai_provider', type: 'varchar', length: 50 })
  aiProvider: string;

  /**
   * Modelo de IA específico usado
   * Ejemplos: 'llama-3.1-70b-versatile', 'gemini-1.5-flash', 'gpt-4'
   */
  @Column({ name: 'ai_model', type: 'varchar', length: 100 })
  aiModel: string;

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
   * Fecha y hora de generación de la interpretación
   */
  @CreateDateColumn({ name: 'generated_at' })
  generatedAt: Date;
}
