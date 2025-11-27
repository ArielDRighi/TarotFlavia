import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CompleteSessionDto {
  @ApiProperty({
    description: 'Notas privadas del tarotista sobre la sesión completada',
    example: 'Sesión muy productiva. Cliente satisfecho con la lectura.',
    required: false,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000, {
    message: 'Las notas no pueden exceder 1000 caracteres',
  })
  tarotistNotes?: string;
}
