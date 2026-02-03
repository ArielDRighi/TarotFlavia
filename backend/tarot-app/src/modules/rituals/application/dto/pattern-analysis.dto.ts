import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { EmotionalPattern } from '../../enums/reading-patterns.enums';
import { RitualCategory } from '../../domain/enums/ritual-category.enum';

/**
 * Patrón detectado con su nivel de confianza
 */
export class DetectedPatternDto {
  @ApiProperty({
    enum: EmotionalPattern,
    example: EmotionalPattern.HEARTBREAK,
  })
  type: EmotionalPattern;

  @ApiProperty({
    example: 0.85,
    description: 'Nivel de confianza del patrón (0-1)',
  })
  confidence: number;

  @ApiProperty({
    example: 'Detectado por cartas: La Torre, Cinco de Copas',
    description: 'Razón por la que se detectó este patrón',
  })
  reason: string;
}

/**
 * Recomendación de ritual basada en patrones
 */
export class RitualRecommendationDto {
  @ApiProperty({
    enum: EmotionalPattern,
    example: EmotionalPattern.HEARTBREAK,
  })
  pattern: EmotionalPattern;

  @ApiProperty({
    example:
      'Las cartas han mostrado turbulencia emocional. Un baño de limpieza con romero podría ayudarte a restaurar tu equilibrio.',
  })
  message: string;

  @ApiProperty({
    enum: RitualCategory,
    isArray: true,
    example: [RitualCategory.HEALING, RitualCategory.CLEANSING],
  })
  suggestedCategories: RitualCategory[];

  @ApiProperty({
    example: 'high',
    enum: ['high', 'medium', 'low'],
    description: 'Prioridad de la recomendación',
  })
  priority: 'high' | 'medium' | 'low';
}

/**
 * Resultado del análisis de patrones
 */
export class PatternAnalysisResultDto {
  @ApiProperty({
    example: true,
    description: 'Indica si hay suficientes datos para el análisis',
  })
  hasEnoughData: boolean;

  @ApiProperty({
    type: [DetectedPatternDto],
    description: 'Patrones emocionales detectados',
  })
  patterns: DetectedPatternDto[];

  @ApiProperty({
    type: [RitualRecommendationDto],
    description: 'Recomendaciones de rituales basadas en los patrones',
  })
  recommendations: RitualRecommendationDto[];

  @ApiProperty({
    example: '2026-02-01T12:00:00Z',
    description: 'Fecha del análisis',
  })
  analysisDate: Date;

  @ApiProperty({
    example: 5,
    description: 'Número de lecturas analizadas',
  })
  readingsAnalyzed: number;
}

/**
 * Respuesta del endpoint de recomendaciones
 */
export class RitualRecommendationsResponseDto {
  @ApiProperty({
    example: true,
    description:
      'Indica si hay recomendaciones disponibles (requiere datos suficientes)',
  })
  hasRecommendations: boolean;

  @ApiProperty({
    type: [RitualRecommendationDto],
    description: 'Lista de recomendaciones personalizadas',
  })
  recommendations: RitualRecommendationDto[];

  @ApiPropertyOptional({
    example: '7 días',
    description: 'Sugerencia de tiempo antes del próximo análisis',
  })
  nextAnalysisIn?: string;

  @ApiPropertyOptional({
    type: PatternAnalysisResultDto,
    description: 'Detalles completos del análisis (opcional)',
  })
  analysis?: PatternAnalysisResultDto;
}
