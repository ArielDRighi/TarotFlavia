import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Ritual } from './ritual.entity';

/**
 * Paso individual de un ritual
 * Representa cada instrucción numerada dentro del ritual
 */
@Entity('ritual_steps')
@Index('idx_step_ritual', ['ritualId'])
@Index('idx_step_order', ['ritualId', 'stepNumber'])
export class RitualStep {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'ritual_id' })
  ritualId: number;

  @Column({ name: 'step_number', type: 'smallint' })
  stepNumber: number;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ name: 'duration_seconds', type: 'smallint', nullable: true })
  durationSeconds: number | null;

  @Column({ name: 'image_url', type: 'varchar', length: 255, nullable: true })
  imageUrl: string | null;

  @Column({ type: 'text', nullable: true })
  mantra: string | null;

  @Column({ type: 'text', nullable: true })
  visualization: string | null;

  @ManyToOne(() => Ritual, (ritual) => ritual.steps, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;
}
