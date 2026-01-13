import { ApiProperty } from '@nestjs/swagger';

export class CardPreviewDto {
  @ApiProperty({ example: 1, description: 'ID de la carta' })
  id: number;

  @ApiProperty({ example: 'El Loco', description: 'Nombre de la carta' })
  name: string;

  @ApiProperty({
    example: 'https://example.com/cards/el_loco.jpg',
    description: 'URL de la imagen de la carta',
  })
  imageUrl: string;

  @ApiProperty({
    example: false,
    description: 'Indica si la carta está invertida',
  })
  isReversed: boolean;
}
