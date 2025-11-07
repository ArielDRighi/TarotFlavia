import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import {
  SanitizeEmail,
  SanitizeHtml,
  Trim,
} from '../../../common/decorators/sanitize.decorator';

export class SendEmailDto {
  @IsEmail()
  @IsNotEmpty()
  @SanitizeEmail()
  to: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200, { message: 'Subject must not exceed 200 characters' })
  @SanitizeHtml()
  subject: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50, { message: 'Template name must not exceed 50 characters' })
  @Trim()
  template: string;
}
