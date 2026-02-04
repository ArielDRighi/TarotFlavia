import { ApiProperty } from '@nestjs/swagger';
import {
  PendulumResponse,
  PendulumMovement,
} from '../../domain/enums/pendulum.enums';

/**
 * DTO de respuesta de consulta al péndulo
 */
export class PendulumQueryResponseDto {
  @ApiProperty({
    enum: PendulumResponse,
    example: PendulumResponse.YES,
    description: 'Respuesta del péndulo (yes/no/maybe)',
  })
  response: PendulumResponse;

  @ApiProperty({
    enum: PendulumMovement,
    example: PendulumMovement.VERTICAL,
    description: 'Tipo de movimiento del péndulo (para animaciones frontend)',
  })
  movement: PendulumMovement;

  @ApiProperty({
    example: 'Sí',
    description: 'Texto de la respuesta en español',
  })
  responseText: string;

  @ApiProperty({
    example: 'El universo afirma tu camino. La energía fluye a tu favor.',
    description: 'Interpretación mística predefinida',
  })
  interpretation: string;

  @ApiProperty({
    example: 123,
    nullable: true,
    description:
      'ID de la consulta guardada (null para anónimos y usuarios free)',
  })
  queryId: number | null;

  @ApiProperty({
    example: 'waxing_crescent',
    description: 'Fase lunar actual (formato técnico)',
  })
  lunarPhase: string;

  @ApiProperty({
    example: 'Luna Creciente',
    description: 'Nombre de la fase lunar en español',
  })
  lunarPhaseName: string;
}
