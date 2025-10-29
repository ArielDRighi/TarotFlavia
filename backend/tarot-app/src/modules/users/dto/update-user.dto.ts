import { IsEmail, IsString, IsOptional, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiProperty({
    example: 'nuevo@ejemplo.com',
    description: 'Nuevo email del usuario',
    required: false,
  })
  @IsEmail({}, { message: 'Por favor proporcione un email válido' })
  @IsOptional()
  email?: string;

  @ApiProperty({
    example: 'Nuevo Nombre',
    description: 'Nuevo nombre del usuario',
    required: false,
  })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({
    example: 'nuevaPassword123',
    description: 'Nueva contraseña (mínimo 6 caracteres)',
    required: false,
  })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 'https://example.com/profile.jpg',
    description: 'URL de la foto de perfil',
    required: false,
  })
  @IsString()
  @IsOptional()
  profilePicture?: string;
}
