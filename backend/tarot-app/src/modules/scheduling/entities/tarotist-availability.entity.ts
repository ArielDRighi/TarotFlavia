import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { DayOfWeek } from '../domain/enums';

/**
 * Tarotist weekly availability configuration
 * Defines regular working hours for each day of the week
 */
@Entity('tarotist_availability')
@Index('idx_tarotista_day', ['tarotistaId', 'dayOfWeek'])
export class TarotistAvailability {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'tarotista_id', type: 'int' })
  tarotistaId: number;

  @ManyToOne(() => Tarotista, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @Column({
    name: 'day_of_week',
    type: 'int',
    comment: '0=Sunday, 1=Monday, ..., 6=Saturday',
  })
  dayOfWeek: DayOfWeek;

  @Column({ name: 'start_time', type: 'time', comment: 'Format: HH:MM' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time', comment: 'Format: HH:MM' })
  endTime: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
