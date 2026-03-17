import {
  IsInt,
  IsPositive,
  IsOptional,
  IsString,
  MaxLength,
  IsDateString,
  Matches,
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

  @ApiProperty({
    example: '2026-04-15',
    required: false,
    description:
      'Fecha seleccionada por el usuario para la sesión (YYYY-MM-DD)',
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha seleccionada debe ser una fecha válida (YYYY-MM-DD)' },
  )
  selectedDate?: string;

  @ApiProperty({
    example: '14:30',
    required: false,
    description: 'Horario seleccionado por el usuario para la sesión (HH:MM)',
  })
  @IsOptional()
  @IsString({ message: 'El horario seleccionado debe ser texto' })
  @Matches(/^\d{2}:\d{2}$/, {
    message: 'El horario debe tener el formato HH:MM',
  })
  selectedTime?: string;
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
