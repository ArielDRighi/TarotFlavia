import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CancelSessionDto {
  @ApiProperty({
    description: 'Razón de la cancelación',
    example: 'No podré asistir por un compromiso inesperado',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'La razón de cancelación es requerida' })
  @IsString()
  @MaxLength(500, {
    message: 'La razón no puede exceder 500 caracteres',
  })
  reason: string;
}
