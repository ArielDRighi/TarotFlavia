import {
  Injectable,
  Inject,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { TarotInterpretation } from '../../../interpretations/entities/tarot-interpretation.entity';
import { InterpretationsService } from '../../../interpretations/interpretations.service';
import { CardsService } from '../../../cards/cards.service';
import { SpreadsService } from '../../../spreads/spreads.service';
import { PredefinedQuestionsService } from '../../../../predefined-questions/predefined-questions.service';
import { AIQuotaService } from '../../../../ai-usage/ai-quota.service';
import {
  UsageLimitsService,
  UsageFeature,
} from '../../../../usage-limits';

const DEFAULT_SPREAD_ID = 1;

// AI config for regeneration
const REGENERATION_AI_CONFIG = {
  model: 'llama-3.3-70b-versatile',
  provider: 'groq',
  temperature: 0.9, // Higher temperature for more creative variations
  maxTokens: 3000, // Sufficient for full structured interpretation
};

@Injectable()
export class RegenerateReadingUseCase {
  private readonly logger = new Logger(RegenerateReadingUseCase.name);

  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    @InjectRepository(TarotInterpretation)
    private readonly interpretationsRepo: Repository<TarotInterpretation>,
    private readonly validator: ReadingValidatorService,
    private readonly interpretationsService: InterpretationsService,
    private readonly cardsService: CardsService,
    private readonly spreadsService: SpreadsService,
    private readonly predefinedQuestionsService: PredefinedQuestionsService,
    private readonly aiQuotaService: AIQuotaService,
    private readonly usageLimitsService: UsageLimitsService,
  ) {}

  async execute(readingId: number, userId: number): Promise<TarotReading> {
    // Verificar que el usuario sea premium
    await this.validator.validateUserIsPremium(userId);

    // Verificar ownership
    const reading = await this.validator.validateReadingOwnership(
      readingId,
      userId,
    );

    // Verificar límite de regeneraciones
    this.validator.validateRegenerationCount(reading);

    // Verificar cuota mensual de AI
    const hasAIQuota = await this.aiQuotaService.checkMonthlyQuota(userId);
    if (!hasAIQuota) {
      const quotaInfo = await this.aiQuotaService.getRemainingQuota(userId);
      const resetDate = quotaInfo.resetDate.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'numeric',
        year: 'numeric',
      });
      throw new ForbiddenException(
        `Has alcanzado tu límite mensual de ${quotaInfo.quotaLimit} interpretaciones de IA. ` +
          `Tu cuota se renovará el ${resetDate}. ` +
          `Actualiza a Premium para interpretaciones ilimitadas.`,
      );
    }

    // Verificar límite diario de regeneraciones
    const hasRegenerationLimit = await this.usageLimitsService.checkLimit(
      userId,
      UsageFeature.INTERPRETATION_REGENERATION,
    );
    if (!hasRegenerationLimit) {
      throw new ForbiddenException(
        'Has alcanzado tu límite diario para esta función. Tu cuota se restablecerá a medianoche (00:00 UTC). Intenta nuevamente mañana o actualiza tu plan para obtener más acceso.',
      );
    }

    // Obtener las cartas
    const cards = await this.cardsService.findByIds(
      reading.cardPositions.map((cp) => cp.cardId),
    );

    // Determinar la pregunta
    let question: string | undefined = reading.customQuestion ?? undefined;
    if (!question && reading.predefinedQuestionId) {
      const predefinedQuestion = await this.predefinedQuestionsService.findOne(
        reading.predefinedQuestionId,
      );

      if (!predefinedQuestion) {
        throw new NotFoundException(
          `Pregunta predefinida con id ${reading.predefinedQuestionId} no encontrada`,
        );
      }

      question = predefinedQuestion.questionText;
    }

    // Obtener el spread
    const spread = await this.spreadsService.findById(DEFAULT_SPREAD_ID);

    this.logger.log(
      `Regenerating interpretation for reading ${readingId} (regeneration #${reading.regenerationCount + 1})`,
    );

    // Determinar tarotista a usar
    const tarotistaId = reading.tarotistaId || 1;

    // Modificar la pregunta para solicitar perspectiva alternativa
    const regenerationQuestion = question
      ? `${question} [REGENERACIÓN: Proporciona una perspectiva alternativa y diferente a interpretaciones anteriores]`
      : 'Proporciona una perspectiva alternativa y diferente para esta lectura';

    // Generar nueva interpretación
    const result = await this.interpretationsService.generateInterpretation(
      cards,
      reading.cardPositions,
      regenerationQuestion,
      spread,
      undefined,
      userId,
      reading.id,
      tarotistaId,
    );

    // Crear nueva entrada de interpretación
    const newInterpretation = this.interpretationsRepo.create({
      reading: { id: reading.id } as TarotReading,
      content: result.interpretation,
      modelUsed: REGENERATION_AI_CONFIG.model,
      aiConfig: REGENERATION_AI_CONFIG,
    });

    await this.interpretationsRepo.save(newInterpretation);

    // Actualizar la lectura
    const updatedReading = await this.readingRepo.update(readingId, {
      interpretation: result.interpretation,
      regenerationCount: reading.regenerationCount + 1,
    });

    this.logger.log(
      `Interpretation regenerated successfully for reading ${readingId}. Total regenerations: ${updatedReading.regenerationCount}`,
    );

    // Incrementar el uso después de la regeneración exitosa
    await this.usageLimitsService.incrementUsage(
      userId,
      UsageFeature.INTERPRETATION_REGENERATION,
    );

    return updatedReading;
  }
}
