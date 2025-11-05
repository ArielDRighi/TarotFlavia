import { ApiProperty } from '@nestjs/swagger';
import { TarotReading } from '../entities/tarot-reading.entity';

export class PaginationMeta {
  @ApiProperty({ description: 'Página actual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Items por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de items', example: 100 })
  totalItems: number;

  @ApiProperty({ description: 'Total de páginas', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Tiene página siguiente', example: true })
  hasNextPage: boolean;

  @ApiProperty({ description: 'Tiene página anterior', example: false })
  hasPreviousPage: boolean;
}

export class PaginatedReadingsResponseDto {
  @ApiProperty({
    type: [TarotReading],
    description: 'Lista de lecturas',
  })
  data: TarotReading[];

  @ApiProperty({
    type: PaginationMeta,
    description: 'Metadata de paginación',
  })
  meta: PaginationMeta;
}
