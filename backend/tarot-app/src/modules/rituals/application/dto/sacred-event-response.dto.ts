import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  SacredEventType,
  Sabbat,
  LunarPhase,
  Hemisphere,
  SacredEventImportance,
  RitualCategory,
} from '../../domain/enums';

/**
 * DTO de respuesta para eventos del calendario sagrado
 * Usado en endpoints públicos y para usuarios premium
 */
export class SacredEventDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Luna Llena de Enero' })
  name: string;

  @ApiProperty({ example: 'luna-llena-2025-01' })
  slug: string;

  @ApiProperty({
    example:
      'Luna Llena en el mes de Enero. Momento de culminación y liberación.',
  })
  description: string;

  @ApiProperty({ enum: SacredEventType, example: SacredEventType.LUNAR_PHASE })
  eventType: SacredEventType;

  @ApiPropertyOptional({ enum: Sabbat, nullable: true })
  sabbat: Sabbat | null;

  @ApiPropertyOptional({ enum: LunarPhase, nullable: true })
  lunarPhase: LunarPhase | null;

  @ApiProperty({
    example: '2025-01-15',
    description: 'Fecha en formato YYYY-MM-DD',
  })
  eventDate: string;

  @ApiPropertyOptional({ example: '14:30', nullable: true })
  eventTime: string | null;

  @ApiPropertyOptional({ enum: Hemisphere, nullable: true })
  hemisphere: Hemisphere | null;

  @ApiProperty({
    enum: SacredEventImportance,
    example: SacredEventImportance.HIGH,
  })
  importance: SacredEventImportance;

  @ApiProperty({
    example: 'Momento de culminación, liberación y carga energética.',
  })
  energyDescription: string;

  @ApiProperty({
    type: [String],
    example: ['lunar', 'cleansing'],
    nullable: true,
  })
  suggestedRitualCategories: RitualCategory[] | null;

  @ApiPropertyOptional({ type: [Number], nullable: true, example: [1, 2, 3] })
  suggestedRitualIds: number[] | null;
}
