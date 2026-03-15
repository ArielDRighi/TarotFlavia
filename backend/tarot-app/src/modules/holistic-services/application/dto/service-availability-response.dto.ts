import { ApiProperty } from '@nestjs/swagger';

export class ServiceAvailabilitySlotDto {
  @ApiProperty({ example: '09:00', description: 'Hora del slot (HH:mm)' })
  time: string;

  @ApiProperty({
    example: true,
    description: 'Indica si el slot está disponible para reservar',
  })
  available: boolean;
}

export class ServiceAvailabilityResponseDto {
  @ApiProperty({
    example: '2026-03-20',
    description: 'Fecha consultada en formato YYYY-MM-DD',
  })
  date: string;

  @ApiProperty({
    type: [ServiceAvailabilitySlotDto],
    description: 'Lista de slots horarios con su disponibilidad',
  })
  slots: ServiceAvailabilitySlotDto[];
}
