import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsEnum, Length } from 'class-validator';
import { Hemisphere } from '../../enums/hemisphere.enum';

/**
 * DTO para actualizar la ubicación geográfica del usuario
 * Utilizado para personalizar eventos del calendario sagrado según el hemisferio
 */
export class UpdateUserLocationDto {
  @ApiProperty({
    description: 'Zona horaria del usuario (formato IANA)',
    example: 'America/Argentina/Buenos_Aires',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'Código ISO de país del usuario (ISO 3166-1 alpha-2)',
    example: 'AR',
    required: false,
    minLength: 2,
    maxLength: 2,
  })
  @IsOptional()
  @IsString()
  @Length(2, 2, {
    message: 'El código de país debe tener exactamente 2 caracteres',
  })
  countryCode?: string;

  @ApiProperty({
    description: 'Hemisferio geográfico del usuario',
    enum: Hemisphere,
    example: Hemisphere.SOUTH,
    required: false,
  })
  @IsOptional()
  @IsEnum(Hemisphere, {
    message: 'El hemisferio debe ser "north" o "south"',
  })
  hemisphere?: Hemisphere;
}
