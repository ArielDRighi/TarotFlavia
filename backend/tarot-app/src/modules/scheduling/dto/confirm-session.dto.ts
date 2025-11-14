import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ConfirmSessionDto {
  @ApiProperty({
    description: 'Notas opcionales del tarotista al confirmar',
    example: 'Confirmo la sesión. Te espero con gusto.',
    required: false,
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, {
    message: 'Las notas no pueden exceder 500 caracteres',
  })
  notes?: string;
}
