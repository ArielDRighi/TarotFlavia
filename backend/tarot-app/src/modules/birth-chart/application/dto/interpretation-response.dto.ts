import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Respuesta de interpretación individual
 */
export class InterpretationDto {
  @ApiProperty({ example: 'planet_in_sign' })
  category: string;

  @ApiPropertyOptional({ example: 'sun' })
  planet?: string;

  @ApiPropertyOptional({ example: 'leo' })
  sign?: string;

  @ApiPropertyOptional({ example: 5 })
  house?: number;

  @ApiProperty({ example: 'El Sol en Leo representa...' })
  content: string;

  @ApiPropertyOptional({ example: 'Personalidad carismática y creativa' })
  summary?: string;
}
