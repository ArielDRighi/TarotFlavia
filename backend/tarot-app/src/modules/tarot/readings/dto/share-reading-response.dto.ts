import { ApiProperty } from '@nestjs/swagger';

export class ShareReadingResponseDto {
  @ApiProperty({
    example: 'abc123xyz',
    description: 'Token único para compartir la lectura',
  })
  sharedToken: string;

  @ApiProperty({
    example: 'https://app.com/shared/abc123xyz',
    description: 'URL completa para compartir la lectura',
  })
  shareUrl: string;

  @ApiProperty({
    example: true,
    description: 'Indica si la lectura es pública',
  })
  isPublic: boolean;
}
