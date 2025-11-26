import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Tarotista } from '../../tarotistas/infrastructure/entities/tarotista.entity';
import { ExceptionType } from '../enums';

/**
 * Tarotist availability exceptions
 * Defines special dates with different availability (blocked or custom hours)
 */
@Entity('tarotist_exceptions')
@Index('idx_tarotista_exception_date', ['tarotistaId', 'exceptionDate'], {
  unique: true,
})
export class TarotistException {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'tarotista_id', type: 'int' })
  tarotistaId: number;

  @ManyToOne(() => Tarotista, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @Column({ name: 'exception_date', type: 'date' })
  exceptionDate: string;

  @Column({
    name: 'exception_type',
    type: 'enum',
    enum: ExceptionType,
  })
  exceptionType: ExceptionType;

  @Column({ name: 'start_time', type: 'time', nullable: true })
  startTime: string | null;

  @Column({ name: 'end_time', type: 'time', nullable: true })
  endTime: string | null;

  @Column({ name: 'reason', type: 'text', nullable: true })
  reason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
