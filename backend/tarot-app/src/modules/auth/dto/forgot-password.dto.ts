import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { SanitizeEmail } from '../../../common/decorators/sanitize.decorator';

export class ForgotPasswordDto {
  @ApiProperty({
    description:
      'Email del usuario que solicita recuperación de contraseña. Si el email existe, se enviará un correo con el token de recuperación.',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'Email must be valid' })
  @IsNotEmpty({ message: 'Email is required' })
  @SanitizeEmail()
  email: string;
}
