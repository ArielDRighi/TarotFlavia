import {
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePurchaseDto {
  @ApiProperty({
    example: 1,
    description: 'ID del servicio holístico a contratar',
  })
  @IsInt({ message: 'El ID del servicio debe ser un número entero' })
  @IsPositive({ message: 'El ID del servicio debe ser mayor a 0' })
  holisticServiceId: number;
}

export class ApprovePurchaseDto {
  @ApiProperty({
    example: 'MP-12345678',
    required: false,
    description: 'Referencia del pago en Mercado Pago (opcional)',
    maxLength: 255,
  })
  @IsOptional()
  @IsString({ message: 'La referencia de pago debe ser texto' })
  @MaxLength(255, {
    message: 'La referencia de pago no puede superar 255 caracteres',
  })
  paymentReference?: string;
}
