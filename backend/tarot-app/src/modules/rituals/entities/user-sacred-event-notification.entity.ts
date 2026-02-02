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
import { SacredEvent } from './sacred-event.entity';

/**
 * Entidad para trackear notificaciones de eventos sagrados enviadas a usuarios
 * Evita notificar el mismo evento múltiples veces
 */
@Entity('user_sacred_event_notifications')
@Index('idx_user_event', ['userId', 'eventId'], { unique: true })
export class UserSacredEventNotification {
  @PrimaryGeneratedColumn()
  id: number;

  // Relación con usuario
  @Column({ name: 'user_id' })
  userId: number;

  // Relación con evento
  @Column({ name: 'event_id' })
  eventId: number;

  // Notificación enviada 24 horas antes del evento
  @Column({ name: 'notified_24h', type: 'boolean', default: false })
  notified24h: boolean;

  // Notificación enviada el día del evento
  @Column({ name: 'notified_on_day', type: 'boolean', default: false })
  notifiedOnDay: boolean;

  // Usuario descartó o ignoró este evento
  @Column({ type: 'boolean', default: false })
  dismissed: boolean;

  // Timestamps
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  // Relaciones
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => SacredEvent, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'event_id' })
  event: SacredEvent;
}
