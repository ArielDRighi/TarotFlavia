import { ApiProperty } from '@nestjs/swagger';

export class UnshareReadingResponseDto {
  @ApiProperty({
    example: 'Lectura dejó de ser compartida con éxito',
    description: 'Mensaje de confirmación',
  })
  message: string;

  @ApiProperty({
    example: false,
    description: 'Indica si la lectura es pública',
  })
  isPublic: boolean;

  @ApiProperty({
    example: null,
    description: 'Token de compartir (null después de dejar de compartir)',
    nullable: true,
  })
  sharedToken: string | null;
}
