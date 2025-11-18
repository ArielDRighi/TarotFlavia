import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CachedInterpretation } from '../../infrastructure/entities/cached-interpretation.entity';
import { CacheMetric } from '../../infrastructure/entities/cache-metrics.entity';
import {
  CacheAnalyticsDto,
  HitRateMetricsDto,
  SavingsMetricsDto,
  ResponseTimeMetricsDto,
  TopCachedCombinationDto,
} from '../dto/cache-analytics.dto';
import {
  CACHE_ANALYTICS,
  CacheLevel,
} from '../constants/cache-strategy.constants';

interface CardCombination {
  card_id: string;
  position: number;
  is_reversed: boolean;
}

interface HitRateQueryResult {
  total_hits: string;
  total_entries: string;
}

interface HistoricalMetricRaw {
  date: Date;
  hit_rate_percentage: string;
  total_requests: string;
  cache_hits: string;
  cache_misses: string;
}

/**
 * Servicio para analytics de caché
 * Calcula:
 * - Cache hit rate
 * - Ahorro en costos de IA
 * - Tiempo de respuesta comparativo
 * - Top combinaciones cacheadas
 */
@Injectable()
export class CacheAnalyticsService {
  private readonly logger = new Logger(CacheAnalyticsService.name);

  constructor(
    @InjectRepository(CachedInterpretation)
    private readonly cacheRepository: Repository<CachedInterpretation>,
    @InjectRepository(CacheMetric)
    private readonly metricsRepository: Repository<CacheMetric>,
  ) {}

  /**
   * Calcula el hit rate de caché para las últimas N horas
   */
  async calculateHitRate(windowHours: number = 24): Promise<HitRateMetricsDto> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - windowHours);

    // Suma total de hit_count de cachés accedidos en la ventana
    const result = (await this.cacheRepository
      .createQueryBuilder('cache')
      .select('SUM(cache.hit_count)', 'total_hits')
      .addSelect('COUNT(cache.id)', 'total_entries')
      .where('cache.last_used_at >= :startDate', { startDate })
      .getRawOne()) as HitRateQueryResult | null;

    const cacheHits = parseInt(result?.total_hits || '0', 10);

    // Cache misses = nuevas entradas creadas en la ventana (sin hits previos)
    const cacheMisses = await this.cacheRepository
      .createQueryBuilder('cache')
      .where('cache.created_at >= :startDate', { startDate })
      .andWhere('cache.hit_count = 0')
      .getCount();

    const totalRequests = cacheHits + cacheMisses;
    const percentage =
      totalRequests > 0 ? (cacheHits / totalRequests) * 100 : 0;

    return {
      percentage: parseFloat(percentage.toFixed(2)),
      totalRequests,
      cacheHits,
      cacheMisses,
      windowHours,
    };
  }

  /**
   * Calcula el ahorro estimado en costos de IA y rate limits
   */
  async calculateSavings(windowHours: number = 24): Promise<SavingsMetricsDto> {
    const hitRate = await this.calculateHitRate(windowHours);

    const { cacheHits } = hitRate;

    // Ahorro en costos de OpenAI
    const openaiSavings =
      cacheHits * CACHE_ANALYTICS.OPENAI_COST_PER_INTERPRETATION;

    // Ahorro en costos de DeepSeek
    const deepseekSavings =
      cacheHits * CACHE_ANALYTICS.DEEPSEEK_COST_PER_INTERPRETATION;

    // Porcentaje de rate limit diario de Groq ahorrado
    const groqRateLimitPercentage =
      (cacheHits / CACHE_ANALYTICS.GROQ_DAILY_RATE_LIMIT) * 100;

    return {
      openaiSavings: parseFloat(openaiSavings.toFixed(4)),
      deepseekSavings: parseFloat(deepseekSavings.toFixed(4)),
      groqRateLimitSaved: cacheHits,
      groqRateLimitPercentage: parseFloat(groqRateLimitPercentage.toFixed(2)),
    };
  }

  /**
   * Calcula tiempos de respuesta comparativos (cache vs AI)
   * Por ahora retorna valores estimados estáticos
   * TODO: Implementar tracking de tiempos reales
   */
  calculateResponseTimes(): ResponseTimeMetricsDto {
    // Valores estimados basados en mediciones típicas
    const cacheAvg = 50; // ms - caché in-memory
    const aiAvg = 1500; // ms - promedio Groq

    const improvementFactor = Math.floor(aiAvg / cacheAvg);

    return {
      cacheAvg,
      aiAvg,
      improvementFactor,
    };
  }

  /**
   * Obtiene las top 10 combinaciones de cartas más cacheadas
   */
  async getTopCachedCombinations(): Promise<TopCachedCombinationDto[]> {
    const topCaches = await this.cacheRepository.find({
      order: {
        hit_count: 'DESC',
      },
      take: 10,
    });

    return topCaches.map((cache) => {
      const cardCombination = cache.card_combination as CardCombination[];
      const cardIds = cardCombination.map((card) => card.card_id);

      return {
        cacheKey: cache.cache_key,
        hitCount: cache.hit_count,
        cardIds,
        spreadId: cache.spread_id,
        lastUsedAt: cache.last_used_at || cache.created_at,
      };
    });
  }

  /**
   * Genera analytics completos de caché
   */
  async getAnalytics(windowHours: number = 24): Promise<CacheAnalyticsDto> {
    const [hitRate, savings, topCombinations] = await Promise.all([
      this.calculateHitRate(windowHours),
      this.calculateSavings(windowHours),
      this.getTopCachedCombinations(),
    ]);

    const responseTime = this.calculateResponseTimes();

    return {
      hitRate,
      savings,
      responseTime,
      topCombinations,
      generatedAt: new Date(),
    };
  }

  /**
   * Registra métricas de caché para una hora específica
   * Llamado por un cron job cada hora
   */
  async recordHourlyMetrics(): Promise<void> {
    const now = new Date();
    const metricDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const metricHour = now.getHours();

    const hitRate = await this.calculateHitRate(1); // Última hora

    const metric = this.metricsRepository.create({
      metric_date: metricDate,
      metric_hour: metricHour,
      total_requests: hitRate.totalRequests,
      cache_hits: hitRate.cacheHits,
      cache_misses: hitRate.cacheMisses,
      hit_rate_percentage: hitRate.percentage,
      avg_cache_response_time_ms: 50, // TODO: Tracking real
      avg_ai_response_time_ms: 1500, // TODO: Tracking real
    });

    await this.metricsRepository.save(metric);

    this.logger.log(
      `Recorded hourly metrics for ${metricDate.toISOString()} hour ${metricHour}: ${hitRate.percentage}% hit rate`,
    );
  }

  /**
   * Obtiene métricas históricas por día
   */
  async getHistoricalMetrics(days: number = 7): Promise<
    {
      date: Date;
      hitRatePercentage: number;
      totalRequests: number;
      cacheHits: number;
      cacheMisses: number;
    }[]
  > {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const metrics = (await this.metricsRepository
      .createQueryBuilder('metric')
      .select('metric.metric_date', 'date')
      .addSelect('AVG(metric.hit_rate_percentage)', 'hit_rate_percentage')
      .addSelect('SUM(metric.total_requests)', 'total_requests')
      .addSelect('SUM(metric.cache_hits)', 'cache_hits')
      .addSelect('SUM(metric.cache_misses)', 'cache_misses')
      .where('metric.metric_date >= :startDate', { startDate })
      .groupBy('metric.metric_date')
      .orderBy('metric.metric_date', 'ASC')
      .getRawMany()) as HistoricalMetricRaw[];

    return metrics.map((m) => ({
      date: m.date,
      hitRatePercentage: parseFloat(m.hit_rate_percentage || '0'),
      totalRequests: parseInt(m.total_requests || '0', 10),
      cacheHits: parseInt(m.cache_hits || '0', 10),
      cacheMisses: parseInt(m.cache_misses || '0', 10),
    }));
  }

  /**
   * Registra un hit/miss de caché para analytics
   * Llamado por el servicio de interpretaciones
   */
  async recordCacheAccess(
    isHit: boolean,
    level: CacheLevel,
    responseTimeMs?: number,
  ): Promise<void> {
    this.logger.debug(
      `Cache access recorded: ${isHit ? 'HIT' : 'MISS'} at level ${level}, time: ${responseTimeMs || 'N/A'}ms`,
    );

    // TODO: Implementar tracking más granular si se necesita
    // Por ahora, las métricas se calculan basándose en hit_count de CachedInterpretation
  }
}
