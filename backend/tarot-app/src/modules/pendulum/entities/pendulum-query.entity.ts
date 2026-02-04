import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PendulumResponse } from '../domain/enums/pendulum.enums';

/**
 * Entidad de Consultas al Péndulo
 * Almacena el historial de consultas de usuarios Premium
 */
@Entity('pendulum_queries')
export class PendulumQuery {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  userId: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'text', nullable: true })
  question: string | null;

  @Column({ type: 'enum', enum: PendulumResponse })
  response: PendulumResponse;

  @Column({ type: 'text' })
  interpretation: string;

  @Column({ length: 50 })
  lunarPhase: string;

  @CreateDateColumn()
  createdAt: Date;
}
