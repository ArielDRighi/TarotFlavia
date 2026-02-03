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

export enum NotificationType {
  SACRED_EVENT = 'sacred_event',
  SACRED_EVENT_REMINDER = 'sacred_event_reminder',
  RITUAL_REMINDER = 'ritual_reminder',
  PATTERN_INSIGHT = 'pattern_insight',
}

/**
 * Notificaciones in-app para usuarios
 * Almacena alertas sobre eventos del calendario sagrado, rituales recomendados, etc.
 */
@Entity('user_notifications')
@Index('idx_notification_user', ['userId'])
@Index('idx_notification_read', ['userId', 'read'])
@Index('idx_notification_created', ['createdAt'])
export class UserNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ type: 'varchar', length: 150 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  data: Record<string, any> | null;

  @Column({ name: 'action_url', type: 'varchar', length: 255, nullable: true })
  actionUrl: string | null;

  @Column({ default: false })
  read: boolean;

  @Column({ name: 'read_at', type: 'timestamptz', nullable: true })
  readAt: Date | null;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
