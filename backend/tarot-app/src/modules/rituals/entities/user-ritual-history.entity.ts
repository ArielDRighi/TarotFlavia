import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Ritual } from './ritual.entity';
import { LunarPhase } from '../domain/enums';

/**
 * Historial de rituales completados por usuarios
 * Registra cada vez que un usuario realiza un ritual
 */
@Entity('user_ritual_history')
@Index('idx_history_user', ['userId'])
@Index('idx_history_ritual', ['ritualId'])
@Index('idx_history_date', ['completedAt'])
export class UserRitualHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'ritual_id' })
  ritualId: number;

  @Column({ name: 'completed_at', type: 'timestamptz' })
  completedAt: Date;

  @Column({
    name: 'lunar_phase',
    type: 'enum',
    enum: LunarPhase,
    nullable: true,
  })
  lunarPhase: LunarPhase | null;

  @Column({ name: 'lunar_sign', type: 'varchar', length: 50, nullable: true })
  lunarSign: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'smallint', nullable: true })
  rating: number | null;

  @Column({ name: 'duration_minutes', type: 'smallint', nullable: true })
  durationMinutes: number | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Ritual, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ritual_id' })
  ritual: Ritual;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
