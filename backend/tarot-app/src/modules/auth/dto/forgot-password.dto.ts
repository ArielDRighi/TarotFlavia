import { IsEmail, IsNotEmpty } from 'class-validator';
import { SanitizeEmail } from '../../../common/decorators/sanitize.decorator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  @SanitizeEmail()
  email: string;
}
