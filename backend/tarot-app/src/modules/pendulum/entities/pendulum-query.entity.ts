import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { PendulumResponse } from '../domain/enums/pendulum.enums';

/**
 * Entidad de Consultas al Péndulo
 * Almacena el historial de consultas de usuarios Premium
 */
@Entity('pendulum_queries')
export class PendulumQuery {
  @ApiProperty({ example: 1, description: 'ID único de la consulta' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 42,
    description: 'ID del usuario que realizó la consulta',
  })
  @Column()
  userId: number;

  @ApiProperty({ description: 'Relación con el usuario que hizo la consulta' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({
    example: '¿Debo aceptar este trabajo?',
    description: 'Pregunta del usuario (solo Premium, null para Free/Anónimo)',
    nullable: true,
  })
  @Column({ type: 'text', nullable: true })
  question: string | null;

  @ApiProperty({
    example: 'yes',
    description: 'Respuesta del péndulo',
    enum: PendulumResponse,
  })
  @Column({ type: 'enum', enum: PendulumResponse })
  response: PendulumResponse;

  @ApiProperty({
    example: 'El universo afirma tu camino. La energía fluye a tu favor.',
    description: 'Interpretación mística predefinida asociada a la respuesta',
  })
  @Column({ type: 'text' })
  interpretation: string;

  @ApiProperty({
    example: 'Luna Creciente',
    description: 'Fase lunar en el momento de la consulta',
  })
  @Column({ length: 50 })
  lunarPhase: string;

  @ApiProperty({
    example: '2026-02-04T10:30:00.000Z',
    description: 'Fecha y hora de la consulta',
  })
  @CreateDateColumn()
  createdAt: Date;
}
