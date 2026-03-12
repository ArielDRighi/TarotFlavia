import { ApiProperty } from '@nestjs/swagger';
import { SessionType } from '../../../scheduling/domain/enums';

export class HolisticServiceResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Trabajo con el Árbol Genealógico' })
  name: string;

  @ApiProperty({ example: 'arbol-genealogico' })
  slug: string;

  @ApiProperty({
    example: '¿Qué heredamos del árbol familiar? (y qué hacer con ello)',
  })
  shortDescription: string;

  @ApiProperty({ example: 15000.0 })
  priceArs: number;

  @ApiProperty({ example: 60 })
  durationMinutes: number;

  @ApiProperty({ enum: SessionType, example: SessionType.FAMILY_TREE })
  sessionType: SessionType;

  @ApiProperty({ example: null, nullable: true })
  imageUrl: string | null;

  @ApiProperty({ example: 1 })
  displayOrder: number;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class HolisticServiceDetailResponseDto extends HolisticServiceResponseDto {
  @ApiProperty({ example: 'Descripción larga del servicio...' })
  longDescription: string;
}

export class HolisticServiceAdminResponseDto extends HolisticServiceDetailResponseDto {
  @ApiProperty({ example: '+5491112345678' })
  whatsappNumber: string;

  @ApiProperty({ example: 'https://mpago.la/1234567' })
  mercadoPagoLink: string;
}
