import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateAnonymousDailyReadingDto {
  @ApiProperty({
    example: 'a1b2c3d4e5f6789012345678901234567890abcdef1234567890abcdef123456',
    description:
      'Fingerprint único generado en el cliente (SHA-256 de user agent + timestamp de sesión)',
    required: true,
  })
  @IsString()
  @IsNotEmpty({ message: 'El fingerprint es requerido' })
  @Length(32, 64, {
    message: 'El fingerprint debe tener entre 32 y 64 caracteres',
  })
  @Matches(/^[a-f0-9]+$/, {
    message: 'El fingerprint debe ser un hash hexadecimal válido',
  })
  fingerprint: string;
}
