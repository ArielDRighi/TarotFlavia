import { Injectable, Logger } from '@nestjs/common';
import { CacheStrategyService } from './cache-strategy.service';
import { InterpretationsService } from '../../../tarot/interpretations/interpretations.service';
import { CacheWarmingStatusDto } from '../dto/cache-analytics.dto';
import { CACHE_WARMING } from '../constants/cache-strategy.constants';

interface WarmingResult {
  started: boolean;
  totalCombinations?: number;
  estimatedTimeMinutes?: number;
  message?: string;
}

interface CardCombination {
  card_id: string;
  position: number;
  is_reversed: boolean;
}

/**
 * Servicio para pre-generar caché de interpretaciones populares
 * Implementa warming strategy con batching para evitar saturar el AI provider
 */
@Injectable()
export class CacheWarmingService {
  private readonly logger = new Logger(CacheWarmingService.name);
  private isWarmingInProgress = false;
  private warmingProgress = 0;
  private warmingTotal = 0;
  private warmingSuccess = 0;
  private warmingErrors = 0;
  private warmingStartTime: Date | null = null;

  constructor(
    private readonly cacheStrategyService: CacheStrategyService,
    private readonly interpretationsService: InterpretationsService,
  ) {}

  /**
   * Inicia el proceso de cache warming para las N combinaciones más populares
   * @param topN - Número de combinaciones a pre-generar (default: 100)
   * @returns Estado inicial del warming
   */
  async warmCache(
    topN: number = CACHE_WARMING.TOP_COMBINATIONS,
  ): Promise<WarmingResult> {
    if (this.isWarmingInProgress) {
      this.logger.warn(
        'Cache warming already in progress, skipping new request',
      );
      return {
        started: false,
        message: 'Cache warming already in progress',
      };
    }

    this.logger.log(`Starting cache warming for top ${topN} combinations`);

    // Obtener las top combinaciones
    const topCombinations =
      await this.cacheStrategyService.getTopCachedCombinations(topN);

    if (topCombinations.length === 0) {
      this.logger.warn('No combinations found to warm cache');
      return {
        started: false,
        message: 'No combinations found to warm',
      };
    }

    // Inicializar estado
    this.isWarmingInProgress = true;
    this.warmingProgress = 0;
    this.warmingTotal = topCombinations.length;
    this.warmingSuccess = 0;
    this.warmingErrors = 0;
    this.warmingStartTime = new Date();

    // Calcular tiempo estimado (asumiendo ~3 segundos por interpretación + delays)
    const estimatedSeconds =
      (topCombinations.length / CACHE_WARMING.BATCH_SIZE) *
        (CACHE_WARMING.BATCH_DELAY_MS / 1000) +
      topCombinations.length * 3;
    const estimatedMinutes = Math.ceil(estimatedSeconds / 60);

    // Procesar en background (no await)
    this.processWarmingBatches(topCombinations).catch((error) => {
      this.logger.error('Error during cache warming process', error);
      this.isWarmingInProgress = false;
    });

    return {
      started: true,
      totalCombinations: topCombinations.length,
      estimatedTimeMinutes: estimatedMinutes,
    };
  }

  /**
   * Procesa las combinaciones en batches para evitar saturar el AI provider
   */
  private async processWarmingBatches(
    combinations: {
      cardCombination: CardCombination[];
      spreadId: number | null;
      hitCount: number;
    }[],
  ): Promise<void> {
    const batchSize = CACHE_WARMING.BATCH_SIZE;
    const delayMs = CACHE_WARMING.BATCH_DELAY_MS;

    for (let i = 0; i < combinations.length; i += batchSize) {
      if (!this.isWarmingInProgress) {
        this.logger.log('Cache warming stopped by user');
        break;
      }

      const batch = combinations.slice(i, i + batchSize);

      // Procesar batch en paralelo
      const promises = batch.map((combo) =>
        this.warmSingleCombination(combo.cardCombination, combo.spreadId),
      );

      await Promise.allSettled(promises);

      this.warmingProgress = Math.min(i + batchSize, combinations.length);

      this.logger.log(
        `Cache warming progress: ${this.warmingProgress}/${combinations.length} ` +
          `(success: ${this.warmingSuccess}, errors: ${this.warmingErrors})`,
      );

      // Delay entre batches para no saturar
      if (i + batchSize < combinations.length) {
        await this.delay(delayMs);
      }
    }

    this.isWarmingInProgress = false;
    this.logger.log(
      `Cache warming completed: ${this.warmingSuccess} successful, ${this.warmingErrors} errors`,
    );
  }

  /**
   * Pre-genera caché para una combinación específica
   */
  private async warmSingleCombination(
    cardCombination: CardCombination[],
    spreadId: number | null,
  ): Promise<void> {
    try {
      // Convertir card_id de string a number
      const cardIds = cardCombination.map((c) => parseInt(c.card_id, 10));

      // Generar interpretación (esto automáticamente la cachea)
      await this.interpretationsService.generateInterpretationForCacheWarming(
        cardIds,
        spreadId,
        cardCombination,
      );

      this.warmingSuccess++;
    } catch (error) {
      this.warmingErrors++;
      this.logger.error(
        `Error warming cache for combination: ${JSON.stringify(cardCombination)}`,
        error,
      );
    }
  }

  /**
   * Obtiene el estado actual del proceso de warming
   */
  getStatus(): CacheWarmingStatusDto {
    const progress =
      this.warmingTotal > 0
        ? (this.warmingProgress / this.warmingTotal) * 100
        : 0;

    // Calcular tiempo restante estimado
    let estimatedTimeRemainingMinutes = 0;
    if (
      this.isWarmingInProgress &&
      this.warmingStartTime &&
      this.warmingProgress > 0
    ) {
      const elapsedMs = Date.now() - this.warmingStartTime.getTime();
      const avgTimePerCombo = elapsedMs / this.warmingProgress;
      const remainingCombos = this.warmingTotal - this.warmingProgress;
      const remainingMs = avgTimePerCombo * remainingCombos;
      estimatedTimeRemainingMinutes = Math.ceil(remainingMs / 60000);
    }

    return {
      isRunning: this.isWarmingInProgress,
      progress: Math.round(progress * 100) / 100, // 2 decimales
      totalCombinations: this.warmingTotal,
      processedCombinations: this.warmingProgress,
      successCount: this.warmingSuccess,
      errorCount: this.warmingErrors,
      estimatedTimeRemainingMinutes,
    };
  }

  /**
   * Detiene el proceso de warming en curso
   */
  stopWarming(): void {
    if (this.isWarmingInProgress) {
      this.logger.log('Stopping cache warming process');
      this.isWarmingInProgress = false;
    }
  }

  /**
   * Utility: Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
