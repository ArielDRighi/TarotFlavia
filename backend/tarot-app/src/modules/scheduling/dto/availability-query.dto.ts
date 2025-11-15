import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEnum, IsInt, IsNotEmpty, Min } from 'class-validator';

export class AvailabilityQueryDto {
  @ApiProperty({
    description: 'ID del tarotista',
    example: 1,
  })
  @IsNotEmpty({ message: 'El ID del tarotista es requerido' })
  @IsInt({ message: 'El ID debe ser un número entero' })
  @Min(1, { message: 'El ID debe ser mayor a 0' })
  tarotistaId: number;

  @ApiProperty({
    description: 'Fecha de inicio del rango (YYYY-MM-DD)',
    example: '2025-11-15',
  })
  @IsNotEmpty({ message: 'La fecha de inicio es requerida' })
  @IsDateString({}, { message: 'Formato de fecha inválido (YYYY-MM-DD)' })
  startDate: string;

  @ApiProperty({
    description: 'Fecha de fin del rango (YYYY-MM-DD)',
    example: '2025-11-22',
  })
  @IsNotEmpty({ message: 'La fecha de fin es requerida' })
  @IsDateString({}, { message: 'Formato de fecha inválido (YYYY-MM-DD)' })
  endDate: string;

  @ApiProperty({
    description: 'Duración de la sesión en minutos',
    example: 60,
    enum: [30, 60, 90],
  })
  @IsNotEmpty({ message: 'La duración es requerida' })
  @IsEnum([30, 60, 90], {
    message: 'La duración debe ser 30, 60 o 90 minutos',
  })
  durationMinutes: number;
}
