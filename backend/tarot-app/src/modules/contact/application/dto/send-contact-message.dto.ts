import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches } from 'class-validator';

/**
 * Mensaje del formulario de contacto público (T-PROD-014).
 *
 * Los límites espejan el schema Zod del frontend
 * (`frontend/src/lib/validations/contact.schemas.ts`): si divergen, el usuario ve un
 * formulario válido y el backend le devuelve un 400 que no puede explicarse.
 */
export class SendContactMessageDto {
  @ApiProperty({ example: 'Ana Pérez', minLength: 2, maxLength: 100 })
  @IsString({ message: 'El nombre es obligatorio' })
  @Length(2, 100, {
    message: 'El nombre debe tener entre 2 y 100 caracteres',
  })
  name: string;

  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail({}, { message: 'El email no es válido' })
  email: string;

  @ApiProperty({
    example: 'Consulta por una lectura',
    minLength: 5,
    maxLength: 200,
  })
  @IsString({ message: 'El asunto es obligatorio' })
  @Length(5, 200, {
    message: 'El asunto debe tener entre 5 y 200 caracteres',
  })
  // El asunto viaja a una cabecera del email: un salto de línea permitiría inyectar
  // cabeceras propias (Bcc:, por ejemplo) desde un endpoint público sin auth.
  @Matches(/^[^\r\n]+$/, {
    message: 'El asunto no puede contener saltos de línea',
  })
  subject: string;

  @ApiProperty({
    example: 'Hola, quería saber cómo reservar una sesión.',
    minLength: 10,
    maxLength: 2000,
  })
  @IsString({ message: 'El mensaje es obligatorio' })
  @Length(10, 2000, {
    message: 'El mensaje debe tener entre 10 y 2000 caracteres',
  })
  message: string;
}
