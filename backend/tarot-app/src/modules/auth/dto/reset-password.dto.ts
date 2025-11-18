import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsStrongPassword } from './validators/is-strong-password.validator';
import { Trim } from '../../../common/decorators/sanitize.decorator';

export class ResetPasswordDto {
  @ApiProperty({
    description:
      'Token de recuperación recibido por email. Es un hash SHA-256 que expira en 1 hora.',
    example: 'cb7e614a86f3ddf5e793af8a9c4e0f68291af6b058ca70c01422fee8d49bed65',
  })
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  @Trim()
  token: string;

  @ApiProperty({
    description:
      'Nueva contraseña del usuario. Debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales.',
    example: 'NewSecurePass123!',
    minLength: 8,
    maxLength: 128,
  })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @IsStrongPassword()
  @Trim()
  newPassword: string;
}
