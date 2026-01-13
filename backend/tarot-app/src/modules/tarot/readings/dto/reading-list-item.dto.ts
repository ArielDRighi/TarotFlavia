import { ApiProperty } from '@nestjs/swagger';
import { CardPreviewDto } from './card-preview.dto';

export class ReadingListItemDto {
  @ApiProperty({ example: 1, description: 'ID único de la lectura' })
  id: number;

  @ApiProperty({
    example: '¿Qué me depara el futuro?',
    description: 'Pregunta de la lectura',
  })
  question: string;

  @ApiProperty({
    example: 1,
    description: 'ID del tipo de tirada',
  })
  spreadId: number;

  @ApiProperty({
    example: 'Tirada de 3 cartas',
    description: 'Nombre del tipo de tirada',
  })
  spreadName: string;

  @ApiProperty({
    example: 3,
    description: 'Cantidad total de cartas en la lectura',
  })
  cardsCount: number;

  @ApiProperty({
    type: [CardPreviewDto],
    description: 'Preview de las primeras 3 cartas',
  })
  cardPreviews: CardPreviewDto[];

  @ApiProperty({
    example: '2023-12-01T10:00:00.000Z',
    description: 'Fecha de creación',
  })
  createdAt: string;

  @ApiProperty({
    example: null,
    description: 'Fecha de eliminación (null si no está eliminada)',
    required: false,
  })
  deletedAt?: string;
}
