import { ApiProperty } from '@nestjs/swagger';
import { PendulumResponse } from '../../domain/enums/pendulum.enums';

/**
 * DTO para representar una consulta en el historial
 */
export class PendulumHistoryItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID único de la consulta',
  })
  id: number;

  @ApiProperty({
    example: '¿Debo aceptar este trabajo?',
    nullable: true,
    description: 'Pregunta escrita (null si fue pregunta mental)',
  })
  question: string | null;

  @ApiProperty({
    enum: PendulumResponse,
    example: PendulumResponse.YES,
    description: 'Respuesta del péndulo',
  })
  response: PendulumResponse;

  @ApiProperty({
    example: 'El universo afirma tu camino.',
    description: 'Interpretación asignada',
  })
  interpretation: string;

  @ApiProperty({
    example: 'waxing_crescent',
    description: 'Fase lunar en el momento de la consulta',
  })
  lunarPhase: string;

  @ApiProperty({
    example: '2026-02-04T10:30:00.000Z',
    description: 'Fecha y hora de la consulta',
  })
  createdAt: string;
}
