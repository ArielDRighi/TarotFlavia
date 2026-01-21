import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO de respuesta para la interpretación numerológica generada por IA
 *
 * Retorna la interpretación personalizada junto con los números usados
 * y metadata de la generación.
 */
export class NumerologyInterpretationResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la interpretación',
  })
  id: number;

  @ApiProperty({
    example: 123,
    description: 'ID del usuario dueño de la interpretación',
  })
  userId: number;

  @ApiProperty({
    example:
      '### 🌟 Tu Esencia Numerológica\n\nTu perfil numerológico revela...',
    description: 'Interpretación personalizada generada por IA en markdown',
  })
  interpretation: string;

  @ApiProperty({
    example: 7,
    description: 'Número de Camino de Vida (1-9, 11, 22, 33)',
  })
  lifePath: number;

  @ApiProperty({
    example: 5,
    description: 'Número de Expresión/Destino',
    nullable: true,
  })
  expressionNumber: number | null;

  @ApiProperty({
    example: 3,
    description: 'Número del Alma',
    nullable: true,
  })
  soulUrge: number | null;

  @ApiProperty({
    example: 2,
    description: 'Número de Personalidad',
    nullable: true,
  })
  personality: number | null;

  @ApiProperty({
    example: 25,
    description: 'Número del Día de Nacimiento',
  })
  birthdayNumber: number;

  @ApiProperty({
    example: '2026-01-18T10:30:00.000Z',
    description: 'Fecha y hora de generación',
  })
  generatedAt: string;

  @ApiProperty({
    example: 'groq',
    description: 'Proveedor de IA usado (groq, gemini, deepseek, openai)',
  })
  aiProvider: string;

  @ApiProperty({
    example: 'llama-3.1-70b-versatile',
    description: 'Modelo de IA específico usado',
  })
  aiModel: string;
}
