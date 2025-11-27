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
import { User } from '../../users/entities/user.entity';
import { SessionType, SessionStatus, PaymentStatus } from '../domain/enums';

/**
 * Session (scheduled appointment) between user and tarotist
 */
@Entity('sessions')
@Index('idx_tarotista_session_date_time', [
  'tarotistaId',
  'sessionDate',
  'sessionTime',
])
@Index('idx_user_session_date', ['userId', 'sessionDate'])
@Index('idx_session_status', ['status'])
export class Session {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column({ name: 'tarotista_id', type: 'int' })
  tarotistaId: number;

  @ManyToOne(() => Tarotista, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'tarotista_id' })
  tarotista: Tarotista;

  @Column({ name: 'user_id', type: 'int' })
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'session_date', type: 'date' })
  sessionDate: string;

  @Column({ name: 'session_time', type: 'time', comment: 'Format: HH:MM' })
  sessionTime: string;

  @Column({ name: 'duration_minutes', type: 'int' })
  durationMinutes: number;

  @Column({
    name: 'session_type',
    type: 'enum',
    enum: SessionType,
  })
  sessionType: SessionType;

  @Column({
    name: 'status',
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.PENDING,
  })
  status: SessionStatus;

  @Column({ name: 'price_usd', type: 'decimal', precision: 10, scale: 2 })
  priceUsd: number;

  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  paymentStatus: PaymentStatus;

  @Column({ name: 'google_meet_link', type: 'varchar', length: 255 })
  googleMeetLink: string;

  @Column({ name: 'user_email', type: 'varchar', length: 255 })
  userEmail: string;

  @Column({ name: 'user_notes', type: 'text', nullable: true })
  userNotes: string | null;

  @Column({ name: 'tarotist_notes', type: 'text', nullable: true })
  tarotistNotes: string | null;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date | null;

  @Column({ name: 'cancellation_reason', type: 'text', nullable: true })
  cancellationReason: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date | null;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;
}
