import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString, MaxLength } from 'class-validator';

export class CalculateNumerologyDto {
  @ApiProperty({
    example: '1990-03-25',
    description: 'Fecha de nacimiento en formato YYYY-MM-DD',
  })
  @IsDateString()
  birthDate: string;

  @ApiProperty({
    example: 'Juan Carlos Pérez',
    description: 'Nombre completo (opcional)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  fullName?: string;
}
