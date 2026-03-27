import { ApiProperty } from '@nestjs/swagger';

export class CancelSubscriptionResponseDto {
  @ApiProperty({
    example: 'Suscripción cancelada exitosamente',
    description: 'Mensaje de confirmación de la cancelación',
  })
  message: string;

  @ApiProperty({
    example: '2026-04-30T00:00:00.000Z',
    description:
      'Fecha de expiración del plan. El acceso premium se mantiene hasta esta fecha.',
    nullable: true,
    type: String,
  })
  planExpiresAt: string | null;
}
