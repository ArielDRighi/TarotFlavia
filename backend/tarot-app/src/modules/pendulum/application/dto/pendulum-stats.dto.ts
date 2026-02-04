import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO para estadísticas de consultas del péndulo
 */
export class PendulumStatsDto {
  @ApiProperty({
    example: 25,
    description: 'Total de consultas realizadas',
  })
  total: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de respuestas "Sí"',
  })
  yesCount: number;

  @ApiProperty({
    example: 10,
    description: 'Cantidad de respuestas "No"',
  })
  noCount: number;

  @ApiProperty({
    example: 5,
    description: 'Cantidad de respuestas "Quizás"',
  })
  maybeCount: number;
}
