import { Injectable, Inject, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { OnEvent } from '@nestjs/event-emitter';
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { TarotistaConfig } from '../../../tarotistas/infrastructure/entities/tarotista-config.entity';
import { TarotistaCardMeaning } from '../../../tarotistas/infrastructure/entities/tarotista-card-meaning.entity';

interface CardCombination {
  card_id: string;
  position: number;
  is_reversed: boolean;
}

@Injectable()
export class InterpretationCacheService {
  private readonly MEMORY_CACHE_TTL = 3600000; // 1 hora en milisegundos
  private readonly DB_CACHE_TTL_DAYS = 30;
  private readonly logger = new Logger(InterpretationCacheService.name);

  // Métricas de invalidación en memoria
  private invalidationMetrics = {
    total: 0,
    byTarotista: 0,
    byMeanings: 0,
  };

  constructor(
    @InjectRepository(CachedInterpretation)
    private readonly cacheRepository: Repository<CachedInterpretation>,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Genera un cache key determinístico basado en la combinación de cartas, spread y pregunta
   */
  generateCacheKey(
    cardCombination: CardCombination[],
    spreadId: string | null,
    questionHash: string,
  ): string {
    // Ordenar cartas por posición para asegurar consistencia
    const sortedCards = [...cardCombination].sort(
      (a, b) => a.position - b.position,
    );

    // Crear string determinístico
    const cardsString = sortedCards
      .map((card) => `${card.card_id}-${card.position}-${card.is_reversed}`)
      .join('|');

    const dataString = `${spreadId || 'no-spread'}:${cardsString}:${questionHash}`;

    // Generar hash SHA-256
    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Genera un hash de la pregunta normalizada
   */
  generateQuestionHash(category: string, questionText: string): string {
    // Normalizar categoría: lowercase, trim
    const normalizedCategory = category.toLowerCase().trim();

    // Normalizar pregunta: lowercase, trim, eliminar espacios múltiples
    const normalizedQuestion = questionText
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');

    const dataString = `${normalizedCategory}:${normalizedQuestion}`;

    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Busca en caché (primero in-memory, luego DB)
   */
  async getFromCache(cacheKey: string): Promise<CachedInterpretation | null> {
    // 1. Buscar en caché in-memory
    const memoryCache =
      await this.cacheManager.get<CachedInterpretation>(cacheKey);
    if (memoryCache) {
      return memoryCache;
    }

    // 2. Buscar en base de datos
    const dbCache = await this.cacheRepository.findOne({
      where: { cache_key: cacheKey },
    });

    if (!dbCache) {
      return null;
    }

    // Verificar si no está expirado
    if (dbCache.expires_at < new Date()) {
      return null;
    }

    // Actualizar hit_count y last_used_at
    await this.cacheRepository.update(
      { id: dbCache.id },
      {
        hit_count: dbCache.hit_count + 1,
        last_used_at: new Date(),
      },
    );

    // Guardar en caché in-memory para próximas consultas
    await this.cacheManager.set(cacheKey, dbCache, this.MEMORY_CACHE_TTL);

    return dbCache;
  }

  /**
   * Guarda en ambos cachés (in-memory y DB)
   */
  async saveToCache(
    cacheKey: string,
    spreadId: number | null,
    cardCombination: CardCombination[],
    questionHash: string,
    interpretation: string,
    tarotistaId?: number,
  ): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.DB_CACHE_TTL_DAYS);

    const cacheEntry = this.cacheRepository.create({
      cache_key: cacheKey,
      tarotista_id: tarotistaId || null,
      spread_id: spreadId,
      card_combination: cardCombination,
      question_hash: questionHash,
      interpretation_text: interpretation,
      hit_count: 0,
      expires_at: expiresAt,
    });

    const saved = await this.cacheRepository.save(cacheEntry);

    // Guardar también en caché in-memory
    await this.cacheManager.set(cacheKey, saved, this.MEMORY_CACHE_TTL);
  }

  /**
   * Limpia el cache de un tarotista específico
   */
  async clearTarotistaCache(tarotistaId: number): Promise<number> {
    const result = await this.cacheRepository
      .createQueryBuilder()
      .delete()
      .from(CachedInterpretation)
      .where('tarotista_id = :tarotistaId', { tarotistaId })
      .execute();

    return result.affected || 0;
  }

  /**
   * Limpia ambos cachés completamente.
   *
   * Intenta limpiar tanto el caché in-memory como el de base de datos.
   * Si la implementación de cacheManager soporta el método reset(), se usará para limpiar el caché in-memory.
   * De lo contrario, el caché in-memory expirará naturalmente y puede contener entradas obsoletas temporalmente.
   */
  async clearAllCaches(): Promise<void> {
    // Limpiar caché in-memory si es posible
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (typeof (this.cacheManager as any).reset === 'function') {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      await (this.cacheManager as any).reset();
    }
    // Si no hay reset(), el caché in-memory expirará naturalmente (TTL 1 hora)

    // Limpiar caché DB
    await this.cacheRepository
      .createQueryBuilder()
      .delete()
      .from(CachedInterpretation)
      .execute();
  }

  /**
   * Elimina cachés expirados de la base de datos
   */
  async cleanExpiredCache(): Promise<number> {
    const result = await this.cacheRepository
      .createQueryBuilder()
      .delete()
      .from(CachedInterpretation)
      .where('expires_at < :now', { now: new Date() })
      .execute();

    return result.affected || 0;
  }

  /**
   * Elimina cachés poco usados después de 7 días
   */
  async cleanUnusedCache(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 7);

    const result = await this.cacheRepository
      .createQueryBuilder()
      .delete()
      .from(CachedInterpretation)
      .where('hit_count < :minHits', { minHits: 2 })
      .andWhere('created_at < :cutoffDate', { cutoffDate })
      .execute();

    return result.affected || 0;
  }

  /**
   * Obtiene estadísticas del caché
   */
  async getCacheStats(): Promise<{
    total: number;
    expired: number;
    avgHits: number;
  }> {
    const now = new Date();
    const stats = (await this.cacheRepository
      .createQueryBuilder('cache')
      .select('COUNT(*)', 'total')
      .addSelect('COUNT(CASE WHEN expires_at < :now THEN 1 END)', 'expired')
      .addSelect('AVG(hit_count)', 'avg_hits')
      .setParameter('now', now)
      .getRawOne()) as { total: string; expired: string; avg_hits: string };

    return {
      total: parseInt(stats?.total || '0', 10),
      expired: parseInt(stats?.expired || '0', 10),
      avgHits: parseFloat(stats?.avg_hits || '0'),
    };
  }

  /**
   * Invalida todo el cache de un tarotista específico
   */
  async invalidateTarotistaCache(tarotistaId: number): Promise<number> {
    this.logger.log(
      `Invalidating all cache for tarotista ${tarotistaId}`,
      'CacheInvalidation',
    );

    const result = await this.cacheRepository
      .createQueryBuilder()
      .delete()
      .from(CachedInterpretation)
      .where('tarotista_id = :tarotistaId', { tarotistaId })
      .execute();

    const deletedCount = result.affected || 0;

    // Actualizar métricas
    this.invalidationMetrics.total += 1;
    this.invalidationMetrics.byTarotista += 1;

    this.logger.log(
      `Invalidated ${deletedCount} cache entries for tarotista ${tarotistaId}`,
      'CacheInvalidation',
    );

    return deletedCount;
  }

  /**
   * Invalida selectivamente el cache afectado por cambios en significados de cartas
   */
  async invalidateTarotistaMeaningsCache(
    tarotistaId: number,
    cardIds: number[],
  ): Promise<number> {
    this.logger.log(
      `Invalidating cache for tarotista ${tarotistaId}, cards: ${cardIds.join(', ')}`,
      'CacheInvalidation',
    );

    // Buscar entradas de cache que contengan alguna de las cartas afectadas
    const affectedEntries = await this.cacheRepository
      .createQueryBuilder('cache')
      .select(['cache.id', 'cache.cache_key', 'cache.card_combination'])
      .where('tarotista_id = :tarotistaId', { tarotistaId })
      .getMany();

    // Filtrar entradas que contengan las cartas modificadas
    const entriesToDelete = affectedEntries.filter((entry) => {
      const cardCombination = entry.card_combination as {
        card_id: string;
        position: number;
        is_reversed: boolean;
      }[];

      return cardCombination.some((card) =>
        cardIds.includes(parseInt(card.card_id, 10)),
      );
    });

    if (entriesToDelete.length === 0) {
      this.logger.log(
        `No cache entries found for tarotista ${tarotistaId} with cards ${cardIds.join(', ')}`,
        'CacheInvalidation',
      );
      return 0;
    }

    const idsToDelete = entriesToDelete.map((entry) => entry.id);

    const result = await this.cacheRepository
      .createQueryBuilder()
      .delete()
      .from(CachedInterpretation)
      .whereInIds(idsToDelete)
      .execute();

    const deletedCount = result.affected || 0;

    // Actualizar métricas
    this.invalidationMetrics.total += 1;
    this.invalidationMetrics.byMeanings += 1;

    this.logger.log(
      `Invalidated ${deletedCount} selective cache entries for tarotista ${tarotistaId}`,
      'CacheInvalidation',
    );

    return deletedCount;
  }

  /**
   * Invalidación en cascada - elimina todas las interpretaciones que dependen de la configuración
   */
  async invalidateCascade(tarotistaId: number): Promise<number> {
    this.logger.log(
      `Cascade invalidation for tarotista ${tarotistaId}`,
      'CacheInvalidation',
    );

    // For now, cascade invalidation is equivalent to invalidating all tarotista cache
    // In the future, it could be more selective depending on the type of change
    return this.invalidateTarotistaCache(tarotistaId);
  }

  /**
   * Event listener: Se ejecuta cuando se actualiza la configuración de un tarotista
   */
  @OnEvent('tarotista.config.updated')
  async handleTarotistaConfigUpdated(payload: {
    tarotistaId: number;
    previousConfig: TarotistaConfig;
    newConfig: TarotistaConfig;
  }): Promise<void> {
    this.logger.log(
      `Handling tarotista.config.updated event for tarotista ${payload.tarotistaId}`,
      'CacheInvalidation',
    );

    await this.invalidateTarotistaCache(payload.tarotistaId);
  }

  /**
   * Event listener: Se ejecuta cuando se actualiza un significado de carta
   */
  @OnEvent('tarotista.meanings.updated')
  async handleTarotistaMeaningsUpdated(payload: {
    tarotistaId: number;
    cardId: number;
    previousMeaning: TarotistaCardMeaning | null;
    newMeaning: TarotistaCardMeaning | null;
  }): Promise<void> {
    this.logger.log(
      `Handling tarotista.meanings.updated event for tarotista ${payload.tarotistaId}, card ${payload.cardId}`,
      'CacheInvalidation',
    );

    await this.invalidateTarotistaMeaningsCache(payload.tarotistaId, [
      payload.cardId,
    ]);
  }

  /**
   * Obtiene métricas de invalidación
   */
  getInvalidationMetrics(): Promise<{
    total: number;
    byTarotista: number;
    byMeanings: number;
  }> {
    return Promise.resolve({ ...this.invalidationMetrics });
  }
}
