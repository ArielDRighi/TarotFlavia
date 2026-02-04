import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { PendulumResponse } from '../domain/enums/pendulum.enums';

/**
 * Entidad de Interpretaciones del Péndulo
 * Almacena frases predefinidas para cada tipo de respuesta
 */
@Entity('pendulum_interpretations')
export class PendulumInterpretation {
  @ApiProperty({ example: 1, description: 'ID único de la interpretación' })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example: 'yes',
    description: 'Tipo de respuesta al que aplica esta interpretación',
    enum: PendulumResponse,
  })
  @Column({ type: 'enum', enum: PendulumResponse })
  responseType: PendulumResponse;

  @ApiProperty({
    example: 'El universo afirma tu camino. La energía fluye a tu favor.',
    description: 'Texto místico predefinido para la interpretación',
  })
  @Column({ type: 'text' })
  text: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la interpretación está activa para ser utilizada',
  })
  @Column({ default: true })
  isActive: boolean;
}
