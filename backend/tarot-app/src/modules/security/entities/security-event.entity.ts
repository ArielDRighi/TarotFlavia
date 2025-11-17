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
import { SecurityEventType } from '../enums/security-event-type.enum';
import { SecurityEventSeverity } from '../enums/security-event-severity.enum';

@Entity('security_events')
@Index(['userId', 'createdAt'])
@Index(['eventType', 'createdAt'])
@Index(['severity', 'createdAt'])
@Index(['ipAddress', 'createdAt'])
export class SecurityEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'event_type',
    type: 'enum',
    enum: SecurityEventType,
  })
  eventType: SecurityEventType;

  @Column({ name: 'user_id', type: 'int', nullable: true })
  userId: number | null;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User | null;

  @Column({ name: 'ip_address', type: 'varchar', length: 45, nullable: true })
  ipAddress: string | null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  userAgent: string | null;

  @Column({
    type: 'enum',
    enum: SecurityEventSeverity,
  })
  severity: SecurityEventSeverity;

  @Column({ type: 'jsonb', nullable: true })
  details: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
