import { ApiProperty } from '@nestjs/swagger';

export class CreatePreapprovalResponseDto {
  @ApiProperty({
    example:
      'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_plan_id=plan_test_123',
    description: 'URL de checkout de Mercado Pago para redirigir al usuario',
  })
  initPoint: string;
}
