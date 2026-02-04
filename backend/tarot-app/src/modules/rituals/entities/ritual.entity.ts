import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { RitualCategory, RitualDifficulty, LunarPhase } from '../domain/enums';
import { RitualStep } from './ritual-step.entity';
import { RitualMaterial } from './ritual-material.entity';

/**
 * Entidad principal de Ritual
 * Representa una guía paso a paso para prácticas espirituales
 */
@Entity('rituals')
@Index('idx_ritual_category', ['category'])
@Index('idx_ritual_slug', ['slug'], { unique: true })
@Index('idx_ritual_difficulty', ['difficulty'])
@Index('idx_ritual_lunar_phase', ['bestLunarPhase'])
@Index('idx_ritual_featured', ['isFeatured'])
export class Ritual {
  @PrimaryGeneratedColumn()
  id: number;

  // Identificación
  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  // Clasificación
  @Column({ type: 'enum', enum: RitualCategory })
  category: RitualCategory;

  @Column({ type: 'enum', enum: RitualDifficulty })
  difficulty: RitualDifficulty;

  // Timing
  @Column({ name: 'duration_minutes', type: 'smallint' })
  durationMinutes: number;

  // Fase lunar principal recomendada para realizar el ritual
  @Column({
    name: 'best_lunar_phase',
    type: 'enum',
    enum: LunarPhase,
    nullable: true,
  })
  bestLunarPhase: LunarPhase | null;

  // Todas las fases lunares válidas (si el ritual funciona bien en múltiples fases)
  @Column({ name: 'best_lunar_phases', type: 'jsonb', nullable: true })
  bestLunarPhases: LunarPhase[] | null;

  @Column({
    name: 'best_time_of_day',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  bestTimeOfDay: string | null;

  // Contenido
  @Column({ type: 'text', nullable: true })
  purpose: string | null;

  @Column({ type: 'text', nullable: true })
  preparation: string | null;

  @Column({ type: 'text', nullable: true })
  closing: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tips: string[] | null;

  // Media
  @Column({
    name: 'image_url',
    type: 'varchar',
    length: 255,
    default: '/ritual-placeholder.svg',
  })
  imageUrl: string;

  @Column({
    name: 'thumbnail_url',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  thumbnailUrl: string | null;

  @Column({ name: 'audio_url', type: 'varchar', length: 255, nullable: true })
  audioUrl: string | null;

  // Estado
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured: boolean;

  // Tracking
  @Column({ name: 'completion_count', type: 'int', default: 0 })
  completionCount: number;

  @Column({ name: 'view_count', type: 'int', default: 0 })
  viewCount: number;

  // Relaciones
  @OneToMany(() => RitualStep, (step) => step.ritual, {
    cascade: true,
  })
  steps: RitualStep[];

  @OneToMany(() => RitualMaterial, (material) => material.ritual, {
    cascade: true,
  })
  materials: RitualMaterial[];

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
