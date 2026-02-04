import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * DTO para consultar el péndulo
 */
export class PendulumQueryDto {
  @ApiPropertyOptional({
    example: '¿Debo aceptar este trabajo?',
    description:
      'Pregunta escrita (opcional, solo Premium puede escribir preguntas)',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'La pregunta no puede exceder 500 caracteres' })
  question?: string;
}
