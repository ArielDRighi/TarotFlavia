import { Injectable, Inject, Logger, NotFoundException } from '@nestjs/common';
import { IReadingRepository } from '../../domain/interfaces/reading-repository.interface';
import { ReadingValidatorService } from '../services/reading-validator.service';
import { CreateReadingDto } from '../../dto/create-reading.dto';
import { TarotReading } from '../../entities/tarot-reading.entity';
import { User } from '../../../../users/entities/user.entity';
import { InterpretationsService } from '../../../interpretations/interpretations.service';
import { CardsService } from '../../../cards/cards.service';
import { SpreadsService } from '../../../spreads/spreads.service';
import { DecksService } from '../../../decks/decks.service';
import { PredefinedQuestionsService } from '../../../../predefined-questions/predefined-questions.service';

const DEFAULT_TAROTISTA_ID = 1;

@Injectable()
export class CreateReadingUseCase {
  private readonly logger = new Logger(CreateReadingUseCase.name);

  constructor(
    @Inject('IReadingRepository')
    private readonly readingRepo: IReadingRepository,
    private readonly validator: ReadingValidatorService,
    private readonly interpretationsService: InterpretationsService,
    private readonly cardsService: CardsService,
    private readonly spreadsService: SpreadsService,
    private readonly decksService: DecksService,
    private readonly predefinedQuestionsService: PredefinedQuestionsService,
  ) {}

  async execute(
    user: User,
    createReadingDto: CreateReadingDto,
  ): Promise<TarotReading> {
    // Validar usuario
    await this.validator.validateUser(user.id);

    // Validar que el deck existe
    const deck = await this.decksService.findDeckById(createReadingDto.deckId);
    if (!deck) {
      throw new NotFoundException(
        `Deck with ID ${createReadingDto.deckId} not found`,
      );
    }

    // Validar que el spread existe (antes de crear la lectura)
    const spread = await this.spreadsService.findById(
      createReadingDto.spreadId,
    );
    if (!spread) {
      throw new NotFoundException(
        `Spread with ID ${createReadingDto.spreadId} not found`,
      );
    }

    // Determinar tipo de pregunta
    const questionType = createReadingDto.predefinedQuestionId
      ? ('predefined' as const)
      : ('custom' as const);

    // Determinar qué tarotista usar (por ahora siempre Flavia)
    const tarotistaId = DEFAULT_TAROTISTA_ID;

    // Obtener las cartas antes de crear la lectura (esto también valida que existan)
    const cards = await this.cardsService.findByIds(createReadingDto.cardIds);

    // Crear la lectura primero sin interpretación
    const reading = await this.readingRepo.create({
      predefinedQuestionId: createReadingDto.predefinedQuestionId || null,
      customQuestion: createReadingDto.customQuestion || null,
      questionType,
      user,
      tarotistaId,
      deck, // Usar el deck validado
      cards, // Agregar las cartas a la lectura
      cardPositions: createReadingDto.cardPositions,
      interpretation: null,
    });

    // Generar interpretación si se solicita
    if (createReadingDto.generateInterpretation) {
      try {
        this.logger.log(
          `Generating interpretation for reading ${reading.id} with tarotista ${tarotistaId}`,
        );

        // Determinar la pregunta a usar
        let question: string | undefined = createReadingDto.customQuestion;
        if (!question && createReadingDto.predefinedQuestionId) {
          const predefinedQuestion =
            await this.predefinedQuestionsService.findOne(
              createReadingDto.predefinedQuestionId,
            );
          question = predefinedQuestion.questionText;
        }

        // Generar interpretación con IA (ya tenemos las cards y spread del paso anterior)
        const result = await this.interpretationsService.generateInterpretation(
          cards,
          createReadingDto.cardPositions,
          question,
          spread,
          undefined, // category - puede agregarse después
          user.id,
          reading.id,
          tarotistaId,
        );

        // Actualizar la lectura con la interpretación
        const updatedReading = await this.readingRepo.update(reading.id, {
          interpretation: result.interpretation,
        });

        // Loggear si vino del caché
        if (result.fromCache) {
          this.logger.log(
            `Interpretation served from cache for reading ${reading.id}. Cache hit rate: ${result.cacheHitRate?.toFixed(2)}%`,
          );
        }

        this.logger.log(
          `Interpretation generated successfully for reading ${reading.id}`,
        );

        return updatedReading;
      } catch (error) {
        this.logger.error(
          `Failed to generate interpretation for reading ${reading.id}`,
          error instanceof Error ? error.stack : error,
        );
        // No fallar toda la creación si la interpretación falla
        return this.readingRepo.update(reading.id, {
          interpretation:
            'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.',
        });
      }
    }

    return reading;
  }
}
