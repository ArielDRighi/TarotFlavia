import { ApiProperty } from '@nestjs/swagger';
import { TarotCard } from '../../cards/entities/tarot-card.entity';

export class DailyReadingResponseDto {
  @ApiProperty({
    example: 1,
    description: 'ID de la carta del día',
  })
  id: number;

  @ApiProperty({
    example: 1,
    description: 'ID del usuario',
  })
  userId: number;

  @ApiProperty({
    example: 1,
    description: 'ID del tarotista',
  })
  tarotistaId: number;

  @ApiProperty({
    type: () => TarotCard,
    description: 'Carta del tarot seleccionada',
  })
  card: TarotCard;

  @ApiProperty({
    example: false,
    description: 'Indica si la carta está invertida',
  })
  isReversed: boolean;

  @ApiProperty({
    example:
      '**Energía del Día**: El Mago trae la energía de la manifestación y el poder personal. Hoy es un día para tomar acción y utilizar tus recursos disponibles.\n\n**Ventajas**:\n- Alta capacidad de concentración y enfoque\n- Habilidad para comunicar ideas efectivamente\n- Momento favorable para iniciar proyectos\n\n**Cuidados**:\n- Evitar la manipulación o el engaño\n- No dispersar la energía en demasiadas direcciones\n- Cuidado con el exceso de confianza\n\n**Consejo del Día**: Confía en tus habilidades y usa todas las herramientas a tu disposición. Es momento de actuar con determinación.',
    description: 'Interpretación de la carta del día',
  })
  interpretation: string;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha de la lectura',
  })
  readingDate: string;

  @ApiProperty({
    example: false,
    description: 'Indica si fue regenerada',
  })
  wasRegenerated: boolean;

  @ApiProperty({
    example: '2025-01-15T08:30:00Z',
    description: 'Fecha de creación',
  })
  createdAt: Date;
}
