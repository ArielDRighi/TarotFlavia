import { ApiProperty } from '@nestjs/swagger';

export class DailyReadingHistoryItemDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la carta del día',
  })
  id: number;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha de la lectura',
  })
  readingDate: string;

  @ApiProperty({
    example: 'El Mago',
    description: 'Nombre de la carta',
  })
  cardName: string;

  @ApiProperty({
    example: false,
    description: 'Si la carta estaba invertida',
  })
  isReversed: boolean;

  @ApiProperty({
    example:
      'El Mago trae la energía de la manifestación y el poder personal. Hoy es un día para tomar acción...',
    description: 'Primeras 150 caracteres de la interpretación',
  })
  interpretationSummary: string;

  @ApiProperty({
    example: false,
    description: 'Si fue regenerada',
  })
  wasRegenerated: boolean;

  @ApiProperty({
    example: '2025-01-15T08:30:00Z',
    description: 'Hora de creación',
  })
  createdAt: Date;
}

export class DailyReadingHistoryDto {
  @ApiProperty({
    type: [DailyReadingHistoryItemDto],
    description: 'Lista de cartas del día',
  })
  items: DailyReadingHistoryItemDto[];

  @ApiProperty({
    example: 45,
    description: 'Total de cartas del día generadas',
  })
  total: number;

  @ApiProperty({
    example: 1,
    description: 'Página actual',
  })
  page: number;

  @ApiProperty({
    example: 10,
    description: 'Items por página',
  })
  limit: number;

  @ApiProperty({
    example: 5,
    description: 'Total de páginas',
  })
  totalPages: number;
}
