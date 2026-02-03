import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotReading } from '../../../tarot/readings/entities/tarot-reading.entity';
import { ReadingCategory } from '../../../categories/entities/reading-category.entity';
import {
  EmotionalPattern,
  PATTERN_CARDS,
  PATTERN_MESSAGES,
  PATTERN_RITUAL_CATEGORIES,
} from '../../enums/reading-patterns.enums';
import {
  DetectedPatternDto,
  RitualRecommendationDto,
  PatternAnalysisResultDto,
} from '../dto/pattern-analysis.dto';
import { RitualCategory } from '../../domain/enums/ritual-category.enum';

@Injectable()
export class ReadingPatternAnalyzerService {
  constructor(
    @InjectRepository(TarotReading)
    private readonly readingRepo: Repository<TarotReading>,
  ) {}

  /**
   * Analiza las últimas N lecturas del usuario y detecta patrones emocionales
   */
  async analyzeUserPatterns(
    userId: number,
    readingsCount: number = 5,
  ): Promise<PatternAnalysisResultDto> {
    // Obtener últimas lecturas con cartas y categorías
    const readings = await this.readingRepo.find({
      where: { user: { id: userId } },
      relations: ['cards', 'category'],
      order: { createdAt: 'DESC' },
      take: readingsCount,
    });

    if (readings.length < 2) {
      return {
        hasEnoughData: false,
        patterns: [],
        recommendations: [],
        analysisDate: new Date(),
        readingsAnalyzed: readings.length,
      };
    }

    // Analizar cartas y detectar patrones emocionales
    const cardPatterns = this.analyzeCardPatterns(readings);

    // Detectar obsesión (misma categoría repetida)
    const obsessionDetected = this.detectObsession(readings);

    // Combinar patrones detectados
    const detectedPatterns = this.combinePatterns(
      cardPatterns,
      obsessionDetected,
      readings,
    );

    // Generar recomendaciones basadas en patrones
    const recommendations = this.generateRecommendations(detectedPatterns);

    return {
      hasEnoughData: true,
      patterns: detectedPatterns,
      recommendations,
      analysisDate: new Date(),
      readingsAnalyzed: readings.length,
    };
  }

  /**
   * Analiza la frecuencia de categorías en las lecturas
   */
  private analyzeCategoryFrequency(
    readings: TarotReading[],
  ): Map<string, number> {
    const frequency = new Map<string, number>();
    for (const reading of readings) {
      const category = reading.category as ReadingCategory | null;
      const cat = category?.slug || 'general';
      frequency.set(cat, (frequency.get(cat) || 0) + 1);
    }
    return frequency;
  }

  /**
   * Analiza las cartas para detectar patrones emocionales
   */
  private analyzeCardPatterns(readings: TarotReading[]): EmotionalPattern[] {
    const patterns: EmotionalPattern[] = [];
    const allCardNumbers = readings.flatMap(
      (r) => r.cards?.map((c) => c.number) || [],
    );

    for (const [pattern, config] of Object.entries(PATTERN_CARDS)) {
      // Contar cuántas veces aparecen cartas del patrón (permite repeticiones)
      const matchCount = allCardNumbers.filter((cardNumber) =>
        config.majorArcana.includes(cardNumber),
      ).length;

      // Si 2+ apariciones de cartas del patrón, lo detectamos
      if (matchCount >= 2) {
        patterns.push(pattern as EmotionalPattern);
      }
    }

    return patterns;
  }

  /**
   * Detecta si el usuario está obsesionado (misma categoría en últimas 3 lecturas)
   */
  private detectObsession(readings: TarotReading[]): boolean {
    if (readings.length < 3) return false;

    // Detectar si las últimas 3 lecturas son de la misma categoría
    const recentCategories = readings
      .slice(0, 3)
      .map((r) => (r.category as ReadingCategory | null)?.slug);
    const allSame = recentCategories.every((c) => c === recentCategories[0]);

    return allSame;
  }

  /**
   * Combina los resultados de diferentes análisis en patrones detectados
   */
  private combinePatterns(
    cardPatterns: EmotionalPattern[],
    obsessionDetected: boolean,
    readings: TarotReading[],
  ): DetectedPatternDto[] {
    const patterns: DetectedPatternDto[] = [];

    // Agregar patrones de cartas con confianza basada en frecuencia
    for (const pattern of cardPatterns) {
      const matchingReadings = this.countReadingsWithPattern(readings, pattern);
      const confidence = matchingReadings / readings.length;

      const cardNames = this.getPatternCardNames(readings, pattern);

      patterns.push({
        type: pattern,
        confidence,
        reason: `Detectado por cartas: ${cardNames.join(', ')}`,
      });
    }

    // Agregar patrón de obsesión si fue detectado
    if (obsessionDetected && readings.length >= 3) {
      const category = readings[0].category as ReadingCategory | null;
      const categoryName = category?.name || category?.slug || 'general';
      patterns.push({
        type: EmotionalPattern.OBSESSION,
        confidence: 0.9,
        reason: `Las últimas 3 lecturas son sobre "${categoryName}"`,
      });
    }

    return patterns;
  }

  /**
   * Cuenta cuántas lecturas contienen cartas del patrón especificado
   */
  private countReadingsWithPattern(
    readings: TarotReading[],
    pattern: EmotionalPattern,
  ): number {
    const patternCardNumbers = PATTERN_CARDS[pattern].majorArcana;
    return readings.filter((reading) => {
      const readingCardNumbers = reading.cards?.map((c) => c.number) || [];
      return patternCardNumbers.some((cardNumber) =>
        readingCardNumbers.includes(cardNumber),
      );
    }).length;
  }

  /**
   * Obtiene los nombres de las cartas que activaron el patrón
   */
  private getPatternCardNames(
    readings: TarotReading[],
    pattern: EmotionalPattern,
  ): string[] {
    const patternCardNumbers = PATTERN_CARDS[pattern].majorArcana;
    const cardNames = new Set<string>();

    for (const reading of readings) {
      for (const card of reading.cards || []) {
        if (patternCardNumbers.includes(card.number)) {
          cardNames.add(card.name);
        }
      }
    }

    return Array.from(cardNames);
  }

  /**
   * Genera recomendaciones de rituales basadas en los patrones detectados
   */
  private generateRecommendations(
    patterns: DetectedPatternDto[],
  ): RitualRecommendationDto[] {
    const recommendations: RitualRecommendationDto[] = [];

    for (const pattern of patterns) {
      const ritualCategories = this.getRecommendedCategories(pattern.type);

      recommendations.push({
        pattern: pattern.type,
        message: this.getPatternMessage(pattern.type),
        suggestedCategories: ritualCategories,
        priority:
          pattern.confidence > 0.7
            ? 'high'
            : pattern.confidence > 0.4
              ? 'medium'
              : 'low',
      });
    }

    return recommendations;
  }

  /**
   * Obtiene el mensaje personalizado para un patrón
   */
  private getPatternMessage(pattern: EmotionalPattern): string {
    return PATTERN_MESSAGES[pattern];
  }

  /**
   * Obtiene las categorías de rituales recomendadas para un patrón
   */
  private getRecommendedCategories(
    pattern: EmotionalPattern,
  ): RitualCategory[] {
    return PATTERN_RITUAL_CATEGORIES[pattern];
  }
}
