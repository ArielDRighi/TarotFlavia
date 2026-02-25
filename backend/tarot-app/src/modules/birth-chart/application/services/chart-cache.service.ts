import { Injectable, Logger, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { createHash } from 'crypto';
import { ChartData } from '../../entities/birth-chart.entity';
import { FullChartInterpretation } from './chart-interpretation.service';
import type { OrbSystem } from '../../domain/enums';

export interface CachedChartData {
  chartData: ChartData;
  calculatedAt: string; // ISO string for Redis compatibility
  cacheKey: string;
}

export interface CachedSynthesis {
  synthesis: string;
  generatedAt: string; // ISO string for Redis compatibility
  provider: string;
  model: string;
}

/**
 * Servicio de caché para cartas astrales
 *
 * Gestiona el almacenamiento en caché de:
 * - Cálculos de carta astral (24h TTL)
 * - Síntesis de IA (7 días TTL)
 * - Interpretaciones completas (30 días TTL)
 *
 * Utiliza el sistema de caché existente de NestJS (@nestjs/cache-manager)
 * para evitar recálculos innecesarios y reducir costos de AI.
 *
 * @example
 * // Generar clave de caché
 * const cacheKey = service.generateChartCacheKey(
 *   new Date('1990-05-15'),
 *   '14:30:00',
 *   -34.6037,
 *   -58.3816
 * );
 *
 * // Verificar si existe en caché
 * const cached = await service.getChartCalculation(cacheKey);
 * if (cached) {
 *   return cached.chartData;
 * }
 *
 * // Calcular y guardar en caché
 * const chartData = await calculateChart(...);
 * await service.setChartCalculation(cacheKey, chartData);
 */
@Injectable()
export class ChartCacheService {
  private readonly logger = new Logger(ChartCacheService.name);

  // TTL para diferentes tipos de caché
  private readonly CHART_CALCULATION_TTL = 24 * 60 * 60 * 1000; // 24 horas
  private readonly SYNTHESIS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días
  private readonly INTERPRETATION_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Genera clave de caché para cálculos de carta
   *
   * Usa SHA-256 para crear una clave determinística basada en:
   * - Fecha de nacimiento
   * - Hora de nacimiento (normalizada a HH:mm:ss)
   * - Coordenadas geográficas (redondeadas a 6 decimales)
   *
   * Normalización aplicada para mejorar hit-rate:
   * - birthTime: Siempre HH:mm:ss (añade :00 si falta)
   * - coords: 6 decimales (coincide con DB scale: 6)
   *
   * @param birthDate Fecha de nacimiento
   * @param birthTime Hora de nacimiento (HH:mm o HH:mm:ss)
   * @param latitude Latitud del lugar de nacimiento
   * @param longitude Longitud del lugar de nacimiento
   * @returns Hash SHA-256 de 64 caracteres hex
   */
  generateChartCacheKey(
    birthDate: Date,
    birthTime: string,
    latitude: number,
    longitude: number,
    orbSystem?: OrbSystem,
  ): string {
    // Normalizar birthTime a HH:mm:ss
    const normalizedTime = birthTime.includes(':')
      ? birthTime.split(':').length === 2
        ? `${birthTime}:00`
        : birthTime
      : birthTime;

    // Redondear coordenadas a 6 decimales (coincide con DB)
    const normalizedLat = parseFloat(latitude.toFixed(6));
    const normalizedLng = parseFloat(longitude.toFixed(6));

    // Incluir orbSystem en la clave para evitar colisiones entre modos
    const orbKey = orbSystem ?? 'default';

    const dataString = `chart:${birthDate.toISOString()}:${normalizedTime}:${normalizedLat}:${normalizedLng}:${orbKey}`;
    return createHash('sha256').update(dataString).digest('hex');
  }

  /**
   * Genera clave de caché para síntesis de IA
   *
   * @param chartCacheKey Clave de caché de la carta base
   * @returns Clave con prefijo 'synthesis:'
   */
  generateSynthesisCacheKey(chartCacheKey: string): string {
    return `synthesis:${chartCacheKey}`;
  }

  /**
   * Genera clave de caché para interpretaciones
   *
   * @param chartCacheKey Clave de caché de la carta base
   * @returns Clave con prefijo 'interpretation:'
   */
  generateInterpretationCacheKey(chartCacheKey: string): string {
    return `interpretation:${chartCacheKey}`;
  }

  /**
   * Obtiene cálculo de carta desde caché
   *
   * @param cacheKey Clave de caché generada con generateChartCacheKey
   * @returns Datos de carta cacheados o null si no existe
   */
  async getChartCalculation(cacheKey: string): Promise<CachedChartData | null> {
    try {
      const cached = await this.cacheManager.get<CachedChartData>(
        `chart:${cacheKey}`,
      );

      if (cached) {
        this.logger.debug(`Chart calculation cache HIT: ${cacheKey}`);
        return cached;
      }

      this.logger.debug(`Chart calculation cache MISS: ${cacheKey}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting chart from cache:', error);
      return null;
    }
  }

  /**
   * Guarda cálculo de carta en caché
   *
   * @param cacheKey Clave de caché
   * @param chartData Datos calculados de la carta
   */
  async setChartCalculation(
    cacheKey: string,
    chartData: ChartData,
  ): Promise<void> {
    try {
      const cached: CachedChartData = {
        chartData,
        calculatedAt: new Date().toISOString(),
        cacheKey,
      };

      await this.cacheManager.set(
        `chart:${cacheKey}`,
        cached,
        this.CHART_CALCULATION_TTL,
      );

      this.logger.debug(`Chart calculation cached: ${cacheKey}`);
    } catch (error) {
      this.logger.error('Error caching chart calculation:', error);
    }
  }

  /**
   * Obtiene síntesis de IA desde caché
   *
   * @param chartCacheKey Clave de caché de la carta base
   * @returns Síntesis cacheada o null si no existe
   */
  async getSynthesis(chartCacheKey: string): Promise<CachedSynthesis | null> {
    try {
      const key = this.generateSynthesisCacheKey(chartCacheKey);
      const cached = await this.cacheManager.get<CachedSynthesis>(key);

      if (cached) {
        this.logger.debug(`Synthesis cache HIT: ${chartCacheKey}`);
        return cached;
      }

      this.logger.debug(`Synthesis cache MISS: ${chartCacheKey}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting synthesis from cache:', error);
      return null;
    }
  }

  /**
   * Guarda síntesis de IA en caché
   *
   * @param chartCacheKey Clave de caché de la carta base
   * @param synthesis Texto de síntesis generada por IA
   * @param provider Proveedor de IA (ej: 'openai', 'groq', 'deepseek')
   * @param model Modelo utilizado (ej: 'gpt-4', 'llama-3.1-70b')
   */
  async setSynthesis(
    chartCacheKey: string,
    synthesis: string,
    provider: string,
    model: string,
  ): Promise<void> {
    try {
      const key = this.generateSynthesisCacheKey(chartCacheKey);
      const cached: CachedSynthesis = {
        synthesis,
        generatedAt: new Date().toISOString(),
        provider,
        model,
      };

      await this.cacheManager.set(key, cached, this.SYNTHESIS_TTL);

      this.logger.debug(`Synthesis cached: ${chartCacheKey}`);
    } catch (error) {
      this.logger.error('Error caching synthesis:', error);
    }
  }

  /**
   * Obtiene interpretación completa desde caché
   *
   * @param chartCacheKey Clave de caché de la carta base
   * @returns Interpretación completa cacheada o null si no existe
   */
  async getInterpretation(
    chartCacheKey: string,
  ): Promise<FullChartInterpretation | null> {
    try {
      const key = this.generateInterpretationCacheKey(chartCacheKey);
      const cached = await this.cacheManager.get<FullChartInterpretation>(key);

      if (cached) {
        this.logger.debug(`Interpretation cache HIT: ${chartCacheKey}`);
        return cached;
      }

      this.logger.debug(`Interpretation cache MISS: ${chartCacheKey}`);
      return null;
    } catch (error) {
      this.logger.error('Error getting interpretation from cache:', error);
      return null;
    }
  }

  /**
   * Guarda interpretación completa en caché
   *
   * @param chartCacheKey Clave de caché de la carta base
   * @param interpretation Interpretación completa de la carta
   */
  async setInterpretation(
    chartCacheKey: string,
    interpretation: FullChartInterpretation,
  ): Promise<void> {
    try {
      const key = this.generateInterpretationCacheKey(chartCacheKey);
      await this.cacheManager.set(key, interpretation, this.INTERPRETATION_TTL);

      this.logger.debug(`Interpretation cached: ${chartCacheKey}`);
    } catch (error) {
      this.logger.error('Error caching interpretation:', error);
    }
  }

  /**
   * Invalida todo el caché relacionado a una carta
   *
   * Elimina:
   * - Cálculo de carta
   * - Síntesis de IA
   * - Interpretación completa
   *
   * @param chartCacheKey Clave de caché de la carta base
   */
  async invalidateChart(chartCacheKey: string): Promise<void> {
    try {
      await Promise.all([
        this.cacheManager.del(`chart:${chartCacheKey}`),
        this.cacheManager.del(this.generateSynthesisCacheKey(chartCacheKey)),
        this.cacheManager.del(
          this.generateInterpretationCacheKey(chartCacheKey),
        ),
      ]);

      this.logger.log(`Cache invalidated for chart: ${chartCacheKey}`);
    } catch (error) {
      this.logger.error('Error invalidating chart cache:', error);
    }
  }

  /**
   * Obtiene estadísticas de caché (para admin/debug)
   *
   * Nota: La implementación actual retorna valores placeholder.
   * En producción, esto debería consultar el backend de caché (Redis/Memory)
   * para obtener métricas reales.
   *
   * @returns Estadísticas de uso de caché
   */
  getCacheStats(): Promise<{
    chartCalculations: number;
    syntheses: number;
    interpretations: number;
  }> {
    // Nota: La implementación real depende del backend de caché (Redis, Memory)
    // Esta es una implementación placeholder
    return Promise.resolve({
      chartCalculations: 0,
      syntheses: 0,
      interpretations: 0,
    });
  }
}
