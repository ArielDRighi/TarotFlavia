import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as levenshtein from 'fast-levenshtein';
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { InterpretationCacheService } from './interpretation-cache.service';
import {
  DYNAMIC_TTL,
  POPULARITY_THRESHOLD,
  FUZZY_MATCHING,
  CacheLevel,
} from '../constants/cache-strategy.constants';

interface CardCombination {
  card_id: string;
  position: number;
  is_reversed: boolean;
}

/**
 * Servicio para estrategia agresiva de caché
 * Implementa:
 * - Caché multi-nivel (exacto, cartas, significados)
 * - Fuzzy matching para preguntas similares
 * - TTL dinámico basado en popularidad
 */
@Injectable()
export class CacheStrategyService {
  private readonly logger = new Logger(CacheStrategyService.name);

  constructor(
    @InjectRepository(CachedInterpretation)
    private readonly cacheRepository: Repository<CachedInterpretation>,
    private readonly interpretationCacheService: InterpretationCacheService,
  ) {}

  /**
   * Calcula el TTL dinámico basado en el hit_count de una entrada de caché
   * - Popularidad alta (hit_count > 10): 90 días
   * - Popularidad media (hit_count 3-10): 30 días
   * - Popularidad baja (hit_count < 3): 7 días
   */
  calculateDynamicTTL(hitCount: number): number {
    if (hitCount >= POPULARITY_THRESHOLD.HIGH) {
      return DYNAMIC_TTL.HIGH_POPULARITY;
    } else if (hitCount >= POPULARITY_THRESHOLD.MEDIUM) {
      return DYNAMIC_TTL.MEDIUM_POPULARITY;
    } else {
      return DYNAMIC_TTL.LOW_POPULARITY;
    }
  }

  /**
   * Actualiza los TTL de todas las entradas de caché basándose en su popularidad
   */
  async updateDynamicTTLs(): Promise<number> {
    const allCaches = await this.cacheRepository.find();
    let updatedCount = 0;

    for (const cache of allCaches) {
      const newTTLDays = this.calculateDynamicTTL(cache.hit_count);
      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + newTTLDays);

      // Solo actualizar si el nuevo TTL es diferente al actual
      const currentTTLMs =
        cache.expires_at.getTime() - cache.created_at.getTime();
      const currentTTLDays = Math.round(currentTTLMs / (1000 * 60 * 60 * 24));

      if (Math.abs(currentTTLDays - newTTLDays) > 1) {
        await this.cacheRepository.update(
          { id: cache.id },
          { expires_at: newExpiresAt },
        );
        updatedCount++;
      }
    }

    this.logger.log(
      `Updated TTL for ${updatedCount} cache entries based on popularity`,
    );
    return updatedCount;
  }

  /**
   * Normaliza una pregunta removiendo stop words y aplicando normalización
   */
  private normalizeQuestion(question: string): string {
    return question
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .split(' ')
      .filter((word) => !FUZZY_MATCHING.STOP_WORDS.includes(word))
      .join(' ');
  }

  /**
   * Calcula la similitud entre dos preguntas usando Levenshtein distance
   * Retorna un valor entre 0 (completamente diferente) y 1 (idéntico)
   */
  calculateQuestionSimilarity(question1: string, question2: string): number {
    const normalized1 = this.normalizeQuestion(question1);
    const normalized2 = this.normalizeQuestion(question2);

    const distance = levenshtein.get(normalized1, normalized2);
    const maxLength = Math.max(normalized1.length, normalized2.length);

    if (maxLength === 0) return 1; // Ambas strings vacías

    return 1 - distance / maxLength;
  }

  /**
   * Busca caché con fuzzy matching de pregunta
   * Si encuentra una pregunta similar (>80% similitud) con las mismas cartas, retorna ese caché
   */
  async findSimilarCachedInterpretation(
    cardCombination: CardCombination[],
    spreadId: number | null,
  ): Promise<CachedInterpretation | null> {
    // Buscar cachés con la misma combinación de cartas y spread
    const cardsString = cardCombination
      .map((card) => `${card.card_id}-${card.position}-${card.is_reversed}`)
      .join('|');

    const queryBuilder = this.cacheRepository.createQueryBuilder('cache');

    if (spreadId === null) {
      queryBuilder.where('spread_id IS NULL');
    } else {
      queryBuilder.where('spread_id = :spreadId', { spreadId });
    }
    queryBuilder.andWhere('expires_at > :now', { now: new Date() });

    const potentialMatches = await queryBuilder.getMany();

    // Filtrar por combinación de cartas exacta
    const matchingCardCombinations = potentialMatches.filter((cache) => {
      const cacheCardsString = (cache.card_combination as CardCombination[])
        .map((card) => `${card.card_id}-${card.position}-${card.is_reversed}`)
        .join('|');
      return cacheCardsString === cardsString;
    });

    if (matchingCardCombinations.length === 0) {
      return null;
    }

    // Calcular similitud con cada pregunta y encontrar la más similar
    let bestMatch: CachedInterpretation | null = null;

    for (const cache of matchingCardCombinations) {
      // Necesitaríamos almacenar la pregunta original para comparar
      // Por ahora, solo devolvemos el primer match con las mismas cartas
      // TODO: Agregar campo 'original_question' a CachedInterpretation en futura migración
      bestMatch = cache;
      break;
    }

    return bestMatch;
  }

  /**
   * Implementa caché multi-nivel:
   * Nivel 1: Búsqueda exacta (combinación exacta de cartas + pregunta)
   * Nivel 2: Búsqueda por cartas (mismas cartas, pregunta similar con fuzzy matching)
   * Nivel 3: Búsqueda por significados base (significados individuales de cartas)
   *
   * @returns { cached, level } - El caché encontrado y el nivel donde se encontró
   */
  async getFromMultiLevelCache(
    cardCombination: CardCombination[],
    spreadId: number | null,
    questionHash: string,
    questionText?: string,
  ): Promise<{ cached: CachedInterpretation | null; level: CacheLevel }> {
    // Nivel 1: Cache exacto
    const exactCacheKey = this.interpretationCacheService.generateCacheKey(
      cardCombination,
      spreadId ? String(spreadId) : null,
      questionHash,
    );

    const exactCache =
      await this.interpretationCacheService.getFromCache(exactCacheKey);

    if (exactCache) {
      this.logger.debug(`Cache hit at EXACT level for key ${exactCacheKey}`);
      return { cached: exactCache, level: CacheLevel.EXACT };
    }

    // Nivel 2: Cache de cartas (mismas cartas, pregunta similar con fuzzy matching)
    if (questionText) {
      const similarCache = await this.findSimilarCachedInterpretation(
        cardCombination,
        spreadId,
      );

      if (similarCache) {
        this.logger.debug(`Cache hit at CARDS level for similar question`);
        return { cached: similarCache, level: CacheLevel.CARDS };
      }
    }

    // Nivel 3: Cache de significados (por ahora no implementado, requiere refactor mayor)
    // TODO: Implementar caché de significados individuales de cartas
    this.logger.debug('Cache miss at all levels');
    return { cached: null, level: CacheLevel.EXACT };
  }

  /**
   * Obtiene las top N combinaciones de cartas más cacheadas
   * Útil para cache warming
   */
  async getTopCachedCombinations(limit: number = 100): Promise<
    {
      cardCombination: CardCombination[];
      spreadId: number | null;
      hitCount: number;
    }[]
  > {
    const topCaches = await this.cacheRepository.find({
      order: {
        hit_count: 'DESC',
      },
      take: limit,
    });

    return topCaches.map((cache) => ({
      cardCombination: cache.card_combination as CardCombination[],
      spreadId: cache.spread_id,
      hitCount: cache.hit_count,
    }));
  }

  /**
   * Obtiene caché hit rate para un período de tiempo
   */
  async getCacheHitRate(
    startDate: Date,
    endDate: Date,
  ): Promise<{
    totalRequests: number;
    cacheHits: number;
    cacheMisses: number;
    hitRatePercentage: number;
  }> {
    // Contar total de cachés accedidos en el período
    const cacheHits = await this.cacheRepository
      .createQueryBuilder('cache')
      .where('last_used_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    // Por ahora, asumimos cache misses como creaciones en el período
    const cacheMisses = await this.cacheRepository
      .createQueryBuilder('cache')
      .where('created_at BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      })
      .getCount();

    const totalRequests = cacheHits + cacheMisses;
    const hitRatePercentage =
      totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      totalRequests,
      cacheHits,
      cacheMisses,
      hitRatePercentage,
    };
  }
}
