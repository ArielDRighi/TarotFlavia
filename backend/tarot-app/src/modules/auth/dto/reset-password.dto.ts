import { IsNotEmpty, IsString, MinLength } from 'class-validator';
import { IsStrongPassword } from './validators/is-strong-password.validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @IsStrongPassword()
  newPassword: string;
}
