import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Planet } from '../../domain/enums/planet.enum';
import { ZodiacSign } from '../../domain/enums/zodiac-sign.enum';
import { AspectType } from '../../domain/enums/aspect-type.enum';

/**
 * Posición de un planeta en la respuesta
 */
export class PlanetPositionDto {
  @ApiProperty({ example: 'sun', enum: Planet })
  planet: string;

  @ApiProperty({ example: 'leo', enum: ZodiacSign })
  sign: string;

  @ApiProperty({ example: 'Leo' })
  signName: string;

  @ApiProperty({ example: 15.5, description: 'Grado dentro del signo (0-30)' })
  signDegree: number;

  @ApiProperty({ example: "15° 30' Leo" })
  formattedPosition: string;

  @ApiProperty({ example: 5 })
  house: number;

  @ApiProperty({ example: false })
  isRetrograde: boolean;
}

/**
 * Cúspide de casa en la respuesta
 */
export class HouseCuspDto {
  @ApiProperty({ example: 1 })
  house: number;

  @ApiProperty({ example: 'virgo', enum: ZodiacSign })
  sign: string;

  @ApiProperty({ example: 'Virgo' })
  signName: string;

  @ApiProperty({ example: 12.25 })
  signDegree: number;

  @ApiProperty({ example: "12° 15' Virgo" })
  formattedPosition: string;
}

/**
 * Aspecto entre planetas en la respuesta
 */
export class ChartAspectDto {
  @ApiProperty({ example: 'sun' })
  planet1: string;

  @ApiProperty({ example: 'Sol' })
  planet1Name: string;

  @ApiProperty({ example: 'moon' })
  planet2: string;

  @ApiProperty({ example: 'Luna' })
  planet2Name: string;

  @ApiProperty({ example: 'trine', enum: AspectType })
  aspectType: string;

  @ApiProperty({ example: 'Trígono' })
  aspectName: string;

  @ApiProperty({ example: '△' })
  aspectSymbol: string;

  @ApiProperty({ example: 2.5, description: 'Orbe en grados' })
  orb: number;

  @ApiProperty({ example: true })
  isApplying: boolean;
}

/**
 * Distribución de elementos/modalidades
 */
export class ChartDistributionDto {
  @ApiProperty({
    example: [
      { name: 'Fuego', count: 3, percentage: 27 },
      { name: 'Tierra', count: 4, percentage: 36 },
      { name: 'Aire', count: 2, percentage: 18 },
      { name: 'Agua', count: 2, percentage: 18 },
    ],
  })
  elements: Array<{ name: string; count: number; percentage: number }>;

  @ApiProperty({
    example: [
      { name: 'Cardinal', count: 4, percentage: 36 },
      { name: 'Fijo', count: 3, percentage: 27 },
      { name: 'Mutable', count: 4, percentage: 36 },
    ],
  })
  modalities: Array<{ name: string; count: number; percentage: number }>;
}

/**
 * Respuesta básica de carta (para Anónimos)
 * Solo incluye: gráfico, tablas y Big Three
 */
export class BasicChartResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ description: 'Datos para renderizar el gráfico SVG' })
  chartSvgData: {
    planets: PlanetPositionDto[];
    houses: HouseCuspDto[];
    aspects: ChartAspectDto[];
  };

  @ApiProperty({ type: [PlanetPositionDto] })
  planets: PlanetPositionDto[];

  @ApiProperty({ type: [HouseCuspDto] })
  houses: HouseCuspDto[];

  @ApiProperty({ type: [ChartAspectDto] })
  aspects: ChartAspectDto[];

  @ApiProperty({ description: 'Interpretación del Big Three' })
  bigThree: {
    sun: { sign: string; signName: string; interpretation: string };
    moon: { sign: string; signName: string; interpretation: string };
    ascendant: { sign: string; signName: string; interpretation: string };
  };

  @ApiProperty({ example: 125, description: 'Tiempo de cálculo en ms' })
  calculationTimeMs: number;
}

/**
 * Respuesta completa de carta (para Free)
 * Incluye todo lo básico + interpretaciones completas
 */
export class FullChartResponseDto extends BasicChartResponseDto {
  @ApiProperty({ type: ChartDistributionDto })
  distribution: ChartDistributionDto;

  @ApiProperty({ description: 'Interpretaciones completas por planeta' })
  interpretations: {
    planets: Array<{
      planet: string;
      planetName: string;
      intro?: string;
      inSign?: string;
      inHouse?: string;
      aspects?: Array<{
        aspectName: string;
        withPlanet: string;
        interpretation?: string;
      }>;
    }>;
  };

  @ApiProperty({ example: true })
  canDownloadPdf: boolean;
}

/**
 * Respuesta Premium de carta
 * Incluye todo lo completo + síntesis IA + guardado
 */
export class PremiumChartResponseDto extends FullChartResponseDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'ID de la carta guardada',
  })
  savedChartId?: number;

  @ApiProperty({ description: 'Síntesis personalizada generada por IA' })
  aiSynthesis: {
    content: string;
    generatedAt: string;
    provider: string;
  };

  @ApiProperty({ example: true })
  canAccessHistory: boolean;
}

/**
 * Respuesta de carta guardada (para historial)
 */
export class SavedChartSummaryDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Mi carta natal' })
  name: string;

  @ApiProperty({ example: '1990-05-15' })
  birthDate: string;

  @ApiProperty({ example: 'Leo' })
  sunSign: string;

  @ApiProperty({ example: 'Escorpio' })
  moonSign: string;

  @ApiProperty({ example: 'Virgo' })
  ascendantSign: string;

  @ApiProperty({ example: '2026-02-06T12:00:00Z' })
  createdAt: string;
}

/**
 * Respuesta de lista de cartas guardadas
 */
export class ChartHistoryResponseDto {
  @ApiProperty({ type: [SavedChartSummaryDto] })
  charts: SavedChartSummaryDto[];

  @ApiProperty({ example: 5 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 1 })
  totalPages: number;
}
