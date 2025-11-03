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
import { TarotPrompts } from './tarot-prompts';

@Injectable()
export class InterpretationsService {
  private readonly logger = new Logger(InterpretationsService.name);

  constructor(
    @InjectRepository(TarotInterpretation)
    private interpretationRepository: Repository<TarotInterpretation>,
    private httpService: HttpService,
    private configService: ConfigService,
    private aiProviderService: AIProviderService,
  ) {
    this.logger.log('InterpretationsService initialized with AI Provider');
  }

  async generateInterpretation(
    cards: TarotCard[],
    positions: { cardId: number; position: string; isReversed: boolean }[],
    question?: string,
    spread?: TarotSpread,
    category?: string,
  ): Promise<string> {
    const startTime = Date.now();

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
      const response = await this.aiProviderService.generateCompletion([
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ]);

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

      return interpretation;
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

      return fallbackInterpretation;
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
      console.error('Error al guardar interpretación:', error);
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
      console.error('Error al asociar interpretación a lectura:', error);
      throw new InternalServerErrorException(
        'Error al guardar la interpretación',
      );
    }
  }

  // Método para regenerar la interpretación de una lectura existente
  async regenerateInterpretation(reading: TarotReading): Promise<string> {
    const cards = reading.cards;
    const positions = reading.cardPositions;

    const newInterpretation = await this.generateInterpretation(
      cards,
      positions,
      reading.question,
    );

    // Actualizar la interpretación en la lectura
    reading.interpretation = newInterpretation;

    return newInterpretation;
  }
}
