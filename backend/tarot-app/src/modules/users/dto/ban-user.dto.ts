import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

export class BanUserDto {
  @ApiProperty({
    description: 'Razón del baneo del usuario',
    example: 'Violación de los términos de servicio',
    maxLength: 500,
  })
  @IsNotEmpty({ message: 'La razón del baneo es requerida' })
  @IsString({ message: 'La razón debe ser un texto' })
  @MaxLength(500, {
    message: 'La razón no puede exceder 500 caracteres',
  })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  reason: string;
}
