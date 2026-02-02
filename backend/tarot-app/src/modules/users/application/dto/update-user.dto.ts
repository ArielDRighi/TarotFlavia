import {
  IsEmail,
  IsString,
  IsOptional,
  MinLength,
  IsDate,
  IsDateString,
  IsEnum,
  Length,
  IsNumber,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { Hemisphere } from '../../enums/hemisphere.enum';

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

  @ApiProperty({
    example: '2024-01-15T10:30:00Z',
    description: 'Fecha y hora del último login',
    required: false,
  })
  @IsDate()
  @Type(() => Date)
  @IsOptional()
  lastLogin?: Date;

  @ApiProperty({
    example: '1990-05-15',
    description: 'Fecha de nacimiento (formato: YYYY-MM-DD)',
    required: false,
  })
  @IsOptional()
  @IsDateString(
    {},
    { message: 'La fecha debe tener formato válido (YYYY-MM-DD)' },
  )
  birthDate?: string;

  @ApiProperty({
    example: 'America/Argentina/Buenos_Aires',
    description: 'Zona horaria del usuario (formato IANA)',
    required: false,
  })
  @IsString()
  @IsOptional()
  timezone?: string;

  @ApiProperty({
    example: 'AR',
    description: 'Código de país ISO 3166-1 alpha-2 (2 caracteres)',
    required: false,
  })
  @IsString()
  @Length(2, 2, {
    message: 'El código de país debe tener exactamente 2 caracteres',
  })
  @IsOptional()
  countryCode?: string;

  @ApiProperty({
    example: Hemisphere.SOUTH,
    description: 'Hemisferio geográfico del usuario',
    enum: Hemisphere,
    required: false,
  })
  @IsEnum(Hemisphere, { message: 'El hemisferio debe ser NORTH o SOUTH' })
  @IsOptional()
  hemisphere?: Hemisphere;

  @ApiProperty({
    example: -34.6037,
    description: 'Latitud del usuario (rango: -90 a 90)',
    required: false,
  })
  @IsNumber()
  @Min(-90)
  @Max(90)
  @IsOptional()
  latitude?: number;
}
