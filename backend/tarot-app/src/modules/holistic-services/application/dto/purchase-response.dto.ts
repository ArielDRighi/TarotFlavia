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

  @ApiProperty({ example: null, nullable: true })
  sessionId: number | null;

  @ApiProperty({ enum: PurchaseStatus, example: PurchaseStatus.PENDING })
  paymentStatus: PurchaseStatus;

  @ApiProperty({ example: 15000.0 })
  amountArs: number;

  @ApiProperty({ example: null, nullable: true })
  paymentReference: string | null;

  @ApiProperty({ example: null, nullable: true })
  paidAt: Date | null;

  @ApiProperty({
    example: 'pref_12345678',
    nullable: true,
    required: false,
    description: 'Mercado Pago Preference ID generado al crear la compra',
  })
  preferenceId: string | null;

  @ApiProperty({
    example: 'https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=...',
    nullable: true,
    required: false,
    description: 'URL de pago de Mercado Pago (Checkout Pro init_point)',
  })
  initPoint: string | null;

  @ApiProperty({
    example: '2026-04-15',
    nullable: true,
    required: false,
    description: 'Fecha seleccionada por el usuario para la sesión',
  })
  selectedDate: string | null;

  @ApiProperty({
    example: '14:30',
    nullable: true,
    required: false,
    description: 'Horario seleccionado por el usuario para la sesión',
  })
  selectedTime: string | null;

  @ApiProperty({
    example: 'pay_987654321',
    nullable: true,
    required: false,
    description: 'ID de pago de Mercado Pago (poblado vía webhook IPN)',
  })
  mercadoPagoPaymentId: string | null;

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
