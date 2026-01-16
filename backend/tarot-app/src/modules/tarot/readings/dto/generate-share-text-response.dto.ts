import { ApiProperty } from '@nestjs/swagger';

export class GenerateShareTextResponseDto {
  @ApiProperty({
    example:
      '🌟 Mi Carta del Día en Auguria ✨\n\n🃏 El Loco\n\nNuevos comienzos, libertad y espontaneidad...\n\n━━━━━━━━━━━━━━━━━━\n✨ Obtén interpretaciones personalizadas → auguriatarot.com',
    description: 'Texto formateado para compartir en redes sociales',
  })
  text: string;
}
