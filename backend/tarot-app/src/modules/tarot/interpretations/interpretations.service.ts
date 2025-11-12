import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { TarotInterpretation } from './entities/tarot-interpretation.entity';
import { TarotSpread } from '../spreads/entities/tarot-spread.entity';
import { TarotReading } from '../readings/entities/tarot-reading.entity';
import { Tarotista } from '../../tarotistas/entities/tarotista.entity';
import { AIProviderService } from '../../ai/application/services/ai-provider.service';
import { InterpretationCacheService } from '../../cache/application/services/interpretation-cache.service';
import { PromptBuilderService } from '../../ai/application/services/prompt-builder.service';
import { TarotPrompts } from '../../ai/application/prompts/tarot-prompts';

interface InterpretationResult {
  interpretation: string;
  fromCache: boolean;
  cacheHitRate?: number;
}

@Injectable()
export class InterpretationsService {
  private readonly logger = new Logger(InterpretationsService.name);
  private cacheHits = 0;
  private totalRequests = 0;
  private defaultTarotistaId: number | null = null;

  constructor(
    @InjectRepository(TarotInterpretation)
    private interpretationRepository: Repository<TarotInterpretation>,
    @InjectRepository(Tarotista)
    private tarotistaRepository: Repository<Tarotista>,
    private httpService: HttpService,
    private configService: ConfigService,
    private aiProviderService: AIProviderService,
    private cacheService: InterpretationCacheService,
    private promptBuilder: PromptBuilderService,
  ) {
    this.logger.log(
      'InterpretationsService initialized with AI Provider, Cache, and PromptBuilder',
    );
  }

  /**
   * Get default tarotista (Flavia) ID
   * Caches the result to avoid repeated DB queries
   *
   * IMPORTANT: This method implements graceful degradation with a fallback to ID 1.
   * The fallback strategy is intentional for the following reasons:
   *
   * 1. **Availability over Failure**: If Flavia doesn't exist in the DB (e.g., seed issue,
   *    DB migration problem), throwing an exception would crash ALL interpretation requests
   *    across the entire application. The fallback allows the app to continue functioning.
   *
   * 2. **Production Resilience**: In production, a missing tarotista is a configuration issue
   *    that should be monitored and fixed, but shouldn't cause a total service outage.
   *    This follows the principle of "degrade gracefully" rather than "fail catastrophically".
   *
   * 3. **Default Assumption**: ID 1 is a reasonable fallback because:
   *    - Our seed data consistently assigns Flavia as ID 1
   *    - Even if another tarotista has ID 1, it's better to use their config than crash
   *    - Monitoring logs will alert us to the issue via the error log above
   *
   * Alternative (throwing exception) would require:
   * - Perfect DB consistency at all times (unrealistic in production)
   * - Would convert a data issue into an availability issue
   * - Would require additional error handling in ALL calling code
   *
   * If you need to change this behavior, consider the production implications carefully.
   */
  private async getDefaultTarotista(): Promise<number> {
    if (this.defaultTarotistaId) {
      return this.defaultTarotistaId;
    }

    const flavia = await this.tarotistaRepository.findOne({
      where: { nombrePublico: 'Flavia' },
    });

    if (!flavia) {
      this.logger.error(
        'Default tarotista (Flavia) not found in database. Using fallback ID 1. ' +
          'This indicates a seed data or migration issue that should be investigated.',
      );
      // Intentional fallback for graceful degradation (see method documentation)
      return 1;
    }

    this.defaultTarotistaId = flavia.id;
    return flavia.id;
  }

  async generateInterpretation(
    cards: TarotCard[],
    positions: { cardId: number; position: string; isReversed: boolean }[],
    question?: string,
    spread?: TarotSpread,
    category?: string,
    userId?: number,
    readingId?: number,
    tarotistaId?: number, // ← NUEVO parámetro opcional para backward compatibility
  ): Promise<InterpretationResult> {
    const startTime = Date.now();
    this.totalRequests++;

    // Determinar tarotistaId: usar el proporcionado o el default (Flavia)
    const finalTarotistaId = tarotistaId || (await this.getDefaultTarotista());

    this.logger.log(
      `Generating interpretation with tarotista ID: ${finalTarotistaId}`,
    );

    // Generar cache key para buscar interpretación cacheada
    const questionText =
      question || 'Pregunta general sobre la situación actual';
    const categoryName = category || 'General';
    const questionHash = this.cacheService.generateQuestionHash(
      categoryName, // Usamos el nombre de la categoría normalizado
      questionText,
    );

    const cardCombination = cards.map((card, index) => ({
      card_id: card.id.toString(),
      position: index,
      is_reversed:
        positions.find((p) => p.cardId === card.id)?.isReversed || false,
    }));

    // Cache key ahora incluye tarotistaId
    const cacheKey = this.buildCacheKey(
      cardCombination,
      spread?.id?.toString() || null,
      questionHash,
      finalTarotistaId,
    );

    // Buscar en caché
    const cachedResult = await this.cacheService.getFromCache(cacheKey);
    if (cachedResult) {
      this.cacheHits++;
      const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;

      this.logger.log(
        `Cache HIT! Returning cached interpretation for tarotista ${finalTarotistaId}. Hit rate: ${cacheHitRate.toFixed(2)}%`,
      );

      return {
        interpretation: cachedResult.interpretation_text,
        fromCache: true,
        cacheHitRate,
      };
    }

    this.logger.log(
      `Cache MISS for tarotista ${finalTarotistaId}. Generating new interpretation with AI...`,
    );

    // Preparar cartas para PromptBuilder
    const selectedCards = positions.map((pos) => ({
      cardId: pos.cardId,
      position: pos.position,
      isReversed: pos.isReversed,
    }));

    try {
      this.logger.log('Generating interpretation with PromptBuilder');

      // Usar PromptBuilder para generar prompts dinámicos
      const { systemPrompt, userPrompt } =
        await this.promptBuilder.buildInterpretationPrompt(
          finalTarotistaId,
          selectedCards,
          questionText,
          categoryName,
        );

      // Intentar generar con el sistema de providers con fallback automático
      const response = await this.aiProviderService.generateCompletion(
        [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        userId,
        readingId,
      );

      const interpretation = response.content;
      const duration = Date.now() - startTime;

      this.logger.log(
        `Interpretation generated successfully with ${response.provider} in ${duration}ms (${response.tokensUsed.total} tokens) for tarotista ${finalTarotistaId}`,
      );

      // Guardar la interpretación con metadata del provider usado
      await this.saveInterpretation(interpretation, response.provider, {
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        duration,
        spread: spread?.name,
        cardCount: cards.length,
        tarotistaId: finalTarotistaId,
      });

      // Guardar en caché para futuras consultas
      await this.cacheService.saveToCache(
        cacheKey,
        spread?.id || null,
        cardCombination,
        questionHash,
        interpretation,
        finalTarotistaId,
      );

      const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;
      this.logger.log(
        `Interpretation cached for tarotista ${finalTarotistaId}. Current hit rate: ${cacheHitRate.toFixed(2)}%`,
      );

      return {
        interpretation,
        fromCache: false,
        cacheHitRate,
      };
    } catch (error) {
      this.logger.error(
        `All AI providers failed for tarotista ${finalTarotistaId}, using fallback`,
        error,
      );

      // Si todos los providers fallan, retornar interpretación de fallback
      const fallbackCards = cards.map((card) => ({
        cardName: card.name,
        meaningUpright: card.meaningUpright,
      }));

      const fallbackInterpretation =
        TarotPrompts.getFallbackInterpretation(fallbackCards);

      // Guardar el fallback también para registro
      await this.saveInterpretation(fallbackInterpretation, 'fallback', {
        provider: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
        cardCount: cards.length,
        tarotistaId: finalTarotistaId,
      });

      const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;

      return {
        interpretation: fallbackInterpretation,
        fromCache: false,
        cacheHitRate,
      };
    }
  }

  /**
   * Build cache key including tarotistaId for separation
   */
  private buildCacheKey(
    cardCombination: {
      card_id: string;
      position: number;
      is_reversed: boolean;
    }[],
    spreadId: string | null,
    questionHash: string,
    tarotistaId: number,
  ): string {
    const baseCacheKey = this.cacheService.generateCacheKey(
      cardCombination,
      spreadId,
      questionHash,
    );

    // Incluir tarotistaId en el cache key para separación
    return `t${tarotistaId}:${baseCacheKey}`;
  }

  private async saveInterpretation(
    content: string,
    modelUsed: string,
    aiConfig: any,
  ) {
    try {
      const interpretation = this.interpretationRepository.create({
        content,
        modelUsed,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aiConfig,
      });
      await this.interpretationRepository.save(interpretation);
    } catch (error) {
      this.logger.error('Error al guardar interpretación:', error);
      // No lanzamos excepción para no interrumpir el flujo principal
    }
  }

  async attachInterpretationToReading(
    readingId: number,
    interpretation: string,
    modelUsed: string,
    aiConfig: any,
  ) {
    try {
      const tarotInterpretation = this.interpretationRepository.create({
        reading: { id: readingId } as Pick<TarotReading, 'id'>,
        content: interpretation,
        modelUsed,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        aiConfig,
      });
      return await this.interpretationRepository.save(tarotInterpretation);
    } catch (error) {
      this.logger.error('Error al asociar interpretación a lectura:', error);
      throw new InternalServerErrorException(
        'Error al guardar la interpretación',
      );
    }
  }

  // Método para regenerar la interpretación de una lectura existente
  private async regenerateInterpretation(
    reading: TarotReading,
  ): Promise<InterpretationResult> {
    const cards = reading.cards;
    const positions = reading.cardPositions;

    const result = await this.generateInterpretation(
      cards as TarotCard[], // TypeORM loads full entities at runtime despite interface type
      positions,
      reading.question,
    );

    // Actualizar la interpretación en la lectura
    reading.interpretation = result.interpretation;

    return result;
  }

  getCacheHitRate(): number {
    return this.totalRequests === 0
      ? 0
      : (this.cacheHits / this.totalRequests) * 100;
  }
}
