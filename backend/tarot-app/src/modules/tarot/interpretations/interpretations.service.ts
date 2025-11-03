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
import { AIProviderService } from './ai-provider.service';
import { InterpretationCacheService } from './interpretation-cache.service';
import { TarotPrompts } from './tarot-prompts';

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

  constructor(
    @InjectRepository(TarotInterpretation)
    private interpretationRepository: Repository<TarotInterpretation>,
    private httpService: HttpService,
    private configService: ConfigService,
    private aiProviderService: AIProviderService,
    private cacheService: InterpretationCacheService,
  ) {
    this.logger.log(
      'InterpretationsService initialized with AI Provider and Cache',
    );
  }

  async generateInterpretation(
    cards: TarotCard[],
    positions: { cardId: number; position: string; isReversed: boolean }[],
    question?: string,
    spread?: TarotSpread,
    category?: string,
    userId?: number,
    readingId?: number,
  ): Promise<InterpretationResult> {
    const startTime = Date.now();
    this.totalRequests++;

    // Preparar información de las cartas con posiciones en el formato requerido
    const cardDetails = cards.map((card) => {
      const position = positions.find((p) => p.cardId === card.id);
      const positionName = position?.position || 'Posición no especificada';

      // Buscar la descripción de la posición en el spread
      const positionInfo = spread?.positions?.find(
        (p) => p.name === positionName,
      );

      return {
        cardName: card.name,
        positionName: positionName,
        positionDescription:
          positionInfo?.description || 'Sin descripción de posición',
        isReversed: position?.isReversed || false,
        meaningUpright: card.meaningUpright,
        meaningReversed: card.meaningReversed,
        keywords: card.keywords,
      };
    });

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

    const cacheKey = this.cacheService.generateCacheKey(
      cardCombination,
      spread?.id?.toString() || null,
      questionHash,
    );

    // Buscar en caché
    const cachedResult = await this.cacheService.getFromCache(cacheKey);
    if (cachedResult) {
      this.cacheHits++;
      const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;

      this.logger.log(
        `Cache HIT! Returning cached interpretation. Hit rate: ${cacheHitRate.toFixed(2)}%`,
      );

      return {
        interpretation: cachedResult.interpretation_text,
        fromCache: true,
        cacheHitRate,
      };
    }

    this.logger.log('Cache MISS. Generating new interpretation with AI...');

    // Usar los prompts optimizados para Llama
    const systemPrompt = TarotPrompts.getSystemPrompt();
    const userPrompt = TarotPrompts.buildUserPrompt({
      question: question || 'Pregunta general sobre la situación actual',
      category: category || 'General',
      spreadName: spread?.name || 'Tirada libre',
      spreadDescription: spread?.description || 'Tirada personalizada',
      cards: cardDetails,
    });

    try {
      this.logger.log('Generating interpretation with AI Provider');

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
        `Interpretation generated successfully with ${response.provider} in ${duration}ms (${response.tokensUsed.total} tokens)`,
      );

      // Guardar la interpretación con metadata del provider usado
      await this.saveInterpretation(interpretation, response.provider, {
        provider: response.provider,
        model: response.model,
        tokensUsed: response.tokensUsed,
        duration,
        spread: spread?.name,
        cardCount: cards.length,
      });

      // Guardar en caché para futuras consultas
      await this.cacheService.saveToCache(
        cacheKey,
        spread?.id?.toString() || null,
        cardCombination,
        questionHash,
        interpretation,
      );

      const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;
      this.logger.log(
        `Interpretation cached. Current hit rate: ${cacheHitRate.toFixed(2)}%`,
      );

      return {
        interpretation,
        fromCache: false,
        cacheHitRate,
      };
    } catch (error) {
      this.logger.error('All AI providers failed, using fallback', error);

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
      });

      const cacheHitRate = (this.cacheHits / this.totalRequests) * 100;

      return {
        interpretation: fallbackInterpretation,
        fromCache: false,
        cacheHitRate,
      };
    }
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
  async regenerateInterpretation(
    reading: TarotReading,
  ): Promise<InterpretationResult> {
    const cards = reading.cards;
    const positions = reading.cardPositions;

    const result = await this.generateInterpretation(
      cards,
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
