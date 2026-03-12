import { ApiProperty } from '@nestjs/swagger';
import { PurchaseStatus } from '../../domain/enums/purchase-status.enum';

class PurchasedServiceSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Trabajo con el Árbol Genealógico' })
  name: string;

  @ApiProperty({ example: 'arbol-genealogico' })
  slug: string;

  @ApiProperty({ example: 60 })
  durationMinutes: number;
}

export class PurchaseResponseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ example: 1 })
  holisticServiceId: number;

  @ApiProperty({ type: PurchasedServiceSummaryDto, required: false })
  holisticService?: PurchasedServiceSummaryDto;

  @ApiProperty({ example: null, nullable: true, required: false })
  sessionId: number | null;

  @ApiProperty({ enum: PurchaseStatus, example: PurchaseStatus.PENDING })
  paymentStatus: PurchaseStatus;

  @ApiProperty({ example: 15000.0 })
  amountArs: number;

  @ApiProperty({ example: null, nullable: true, required: false })
  paymentReference: string | null;

  @ApiProperty({ example: null, nullable: true, required: false })
  paidAt: Date | null;

  @ApiProperty({
    example: '+5491112345678',
    nullable: true,
    required: false,
    description: 'Solo se incluye cuando paymentStatus === PAID',
  })
  whatsappNumber?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class PurchaseListResponseDto {
  @ApiProperty({ type: [PurchaseResponseDto] })
  data: PurchaseResponseDto[];

  @ApiProperty({
    example: { page: 1, limit: 10, totalItems: 25, totalPages: 3 },
  })
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}
