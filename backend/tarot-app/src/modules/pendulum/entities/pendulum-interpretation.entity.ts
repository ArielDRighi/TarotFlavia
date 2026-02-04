import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { PendulumResponse } from '../domain/enums/pendulum.enums';

/**
 * Entidad de Interpretaciones del Péndulo
 * Almacena frases predefinidas para cada tipo de respuesta
 */
@Entity('pendulum_interpretations')
export class PendulumInterpretation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: PendulumResponse })
  responseType: PendulumResponse;

  @Column({ type: 'text' })
  text: string;

  @Column({ default: true })
  isActive: boolean;
}
