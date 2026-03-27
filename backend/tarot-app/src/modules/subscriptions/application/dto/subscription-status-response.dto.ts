import { ApiProperty } from '@nestjs/swagger';
import {
  UserPlan,
  SubscriptionStatus,
} from '../../../users/entities/user.entity';

export class SubscriptionStatusResponseDto {
  @ApiProperty({
    example: UserPlan.PREMIUM,
    description: 'Plan actual del usuario',
    enum: UserPlan,
  })
  plan: UserPlan;

  @ApiProperty({
    example: SubscriptionStatus.ACTIVE,
    description: 'Estado de la suscripción de MercadoPago',
    enum: SubscriptionStatus,
    nullable: true,
    type: String,
  })
  subscriptionStatus: SubscriptionStatus | null;

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
