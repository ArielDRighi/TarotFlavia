import { ApiProperty } from '@nestjs/swagger';

export class RecentReadingDto {
  @ApiProperty({
    example: 1,
    description: 'ID único de la lectura',
  })
  id: number;

  @ApiProperty({
    example: 'usuario@ejemplo.com',
    description: 'Email del usuario que realizó la lectura',
  })
  userEmail: string;

  @ApiProperty({
    example: 'Juan Pérez',
    description: 'Nombre del usuario que realizó la lectura',
  })
  userName: string;

  @ApiProperty({
    example: 'Cruz Celta',
    description: 'Tipo de tirada (spread) utilizado',
  })
  spreadType: string;

  @ApiProperty({
    example: 'Amor',
    description: 'Categoría de la lectura',
    required: false,
  })
  category: string | null;

  @ApiProperty({
    example: '¿Encontraré el amor este año?',
    description: 'Pregunta asociada a la lectura',
    required: false,
  })
  question: string | null;

  @ApiProperty({
    example: 'completed',
    description: 'Estado de la lectura',
  })
  status: string;

  @ApiProperty({
    example: '2025-01-15T14:20:00.000Z',
    description: 'Fecha de creación de la lectura',
  })
  createdAt: Date;
}
