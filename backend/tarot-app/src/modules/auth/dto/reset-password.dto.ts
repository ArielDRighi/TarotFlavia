import { IsNotEmpty, IsString, MinLength, MaxLength } from 'class-validator';
import { IsStrongPassword } from './validators/is-strong-password.validator';
import { Trim } from '../../../common/decorators/sanitize.decorator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Token is required' })
  @Trim()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password must not exceed 128 characters' })
  @IsStrongPassword()
  @Trim()
  newPassword: string;
}
