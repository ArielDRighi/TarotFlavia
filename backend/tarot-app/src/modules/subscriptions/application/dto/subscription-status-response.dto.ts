import { ApiProperty } from '@nestjs/swagger';

export class SubscriptionStatusResponseDto {
  @ApiProperty({
    example: 'premium',
    description: 'Plan actual del usuario',
    enum: ['anonymous', 'free', 'premium'],
  })
  plan: string;

  @ApiProperty({
    example: 'active',
    description: 'Estado de la suscripción de MercadoPago',
    enum: ['active', 'cancelled', 'expired'],
    nullable: true,
    type: String,
  })
  subscriptionStatus: string | null;

  @ApiProperty({
    example: '2026-04-30T00:00:00.000Z',
    description: 'Fecha de expiración del plan premium',
    nullable: true,
    type: String,
  })
  planExpiresAt: string | null;

  @ApiProperty({
    example: 'preapproval_abc123',
    description: 'ID del preapproval de MercadoPago',
    nullable: true,
    type: String,
  })
  mpPreapprovalId: string | null;
}
