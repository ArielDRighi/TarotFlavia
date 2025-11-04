import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotInterpretation } from '../interpretations/entities/tarot-interpretation.entity';
import { User, UserPlan } from '../../users/entities/user.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { CreateReadingDto } from './dto/create-reading.dto';
import { InterpretationsService } from '../interpretations/interpretations.service';
import { CardsService } from '../cards/cards.service';
import { SpreadsService } from '../spreads/spreads.service';
import { PredefinedQuestionsService } from '../../predefined-questions/predefined-questions.service';

// Constantes para regeneración
const DEFAULT_SPREAD_ID = 1; // ID del spread por defecto cuando no se especifica
const MAX_REGENERATIONS = 3; // Límite máximo de regeneraciones por lectura
const REGENERATION_AI_CONFIG = {
  model: 'regeneration',
  temperature: 0.7,
  maxTokens: 1000,
  isRegeneration: true,
} as const;

@Injectable()
export class ReadingsService {
  private readonly logger = new Logger(ReadingsService.name);

  constructor(
    @InjectRepository(TarotReading)
    private readingsRepository: Repository<TarotReading>,
    @InjectRepository(TarotInterpretation)
    private interpretationsRepository: Repository<TarotInterpretation>,
    private interpretationsService: InterpretationsService,
    private cardsService: CardsService,
    private spreadsService: SpreadsService,
    private predefinedQuestionsService: PredefinedQuestionsService,
  ) {}

  async create(
    user: User,
    createReadingDto: CreateReadingDto,
  ): Promise<TarotReading> {
    // Determinar tipo de pregunta y establecer campos apropiados
    const questionType = createReadingDto.predefinedQuestionId
      ? ('predefined' as const)
      : ('custom' as const);

    // Crear la lectura primero sin interpretación
    const reading = this.readingsRepository.create({
      predefinedQuestionId: createReadingDto.predefinedQuestionId || null,
      customQuestion: createReadingDto.customQuestion || null,
      questionType,
      user,
      deck: { id: createReadingDto.deckId } as Pick<TarotDeck, 'id'>,
      cardPositions: createReadingDto.cardPositions,
      interpretation: null,
    });

    // Guardar para obtener el ID
    const savedReading = await this.readingsRepository.save(reading);

    // Generar interpretación si se solicita
    if (createReadingDto.generateInterpretation) {
      try {
        this.logger.log(
          `Generating interpretation for reading ${savedReading.id}`,
        );

        // Obtener las cartas
        const cards = await this.cardsService.findByIds(
          createReadingDto.cardIds,
        );

        // Obtener el spread
        const spread = await this.spreadsService.findById(
          createReadingDto.spreadId,
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

        // Generar interpretación con IA
        const result = await this.interpretationsService.generateInterpretation(
          cards,
          createReadingDto.cardPositions,
          question,
          spread,
          undefined, // category - puede agregarse después
          user.id,
          savedReading.id,
        );

        // Actualizar la lectura con la interpretación
        savedReading.interpretation = result.interpretation;
        await this.readingsRepository.save(savedReading);

        // Loggear si vino del caché
        if (result.fromCache) {
          this.logger.log(
            `Interpretation served from cache for reading ${savedReading.id}. Cache hit rate: ${result.cacheHitRate?.toFixed(2)}%`,
          );
        }

        this.logger.log(
          `Interpretation generated successfully for reading ${savedReading.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to generate interpretation for reading ${savedReading.id}`,
          error instanceof Error ? error.stack : error,
        );
        // No fallar toda la creación si la interpretación falla
        savedReading.interpretation =
          'No se pudo generar la interpretación automáticamente. El error ha sido registrado. Por favor, intenta regenerar más tarde.';
        await this.readingsRepository.save(savedReading);
      }
    }

    return savedReading;
  }

  async findAll(userId: number): Promise<TarotReading[]> {
    return this.readingsRepository.find({
      where: { user: { id: userId } },
      relations: ['deck', 'cards', 'user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(
    id: number,
    userId: number,
    isAdmin = false,
  ): Promise<TarotReading> {
    const reading = await this.readingsRepository.findOne({
      where: { id },
      relations: ['deck', 'cards', 'user'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    if (!isAdmin && reading.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this reading',
      );
    }

    return reading;
  }

  async update(
    id: number,
    userId: number,
    updateData: Partial<TarotReading>,
  ): Promise<TarotReading> {
    const reading = await this.findOne(id, userId);

    Object.assign(reading, updateData);

    return this.readingsRepository.save(reading);
  }

  async remove(id: number, userId: number): Promise<void> {
    const reading = await this.findOne(id, userId);

    // Soft delete using TypeORM's DeleteDateColumn
    reading.deletedAt = new Date();
    await this.readingsRepository.save(reading);
  }

  async regenerateInterpretation(
    id: number,
    userId: number,
  ): Promise<TarotReading> {
    // Buscar la lectura
    const reading = await this.readingsRepository.findOne({
      where: { id },
      relations: ['deck', 'cards', 'user'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    // Verificar ownership
    if (reading.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to regenerate this reading',
      );
    }

    // Verificar que el usuario sea premium
    const user = await this.readingsRepository.manager.findOne(User, {
      where: { id: userId },
    });

    if (!user || user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Solo los usuarios premium pueden regenerar interpretaciones',
      );
    }

    // Verificar límite de regeneraciones
    if (reading.regenerationCount >= MAX_REGENERATIONS) {
      throw new HttpException(
        `Has alcanzado el máximo de regeneraciones (${MAX_REGENERATIONS}) para esta lectura`,
        HttpStatus.TOO_MANY_REQUESTS,
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

    // Obtener el spread (si existe, buscar el spread usado originalmente)
    // Como no tenemos spreadId en reading, usamos un spread genérico
    const spread = await this.spreadsService.findById(DEFAULT_SPREAD_ID);

    this.logger.log(
      `Regenerating interpretation for reading ${id} (regeneration #${reading.regenerationCount + 1})`,
    );

    // Modificar la pregunta para solicitar perspectiva alternativa
    const regenerationQuestion = question
      ? `${question} [REGENERACIÓN: Proporciona una perspectiva alternativa y diferente a interpretaciones anteriores]`
      : 'Proporciona una perspectiva alternativa y diferente para esta lectura';

    // Generar nueva interpretación (sin usar caché)
    const result = await this.interpretationsService.generateInterpretation(
      cards,
      reading.cardPositions,
      regenerationQuestion,
      spread,
      undefined,
      userId,
      reading.id,
    );

    // Crear nueva entrada de interpretación
    const newInterpretation = this.interpretationsRepository.create({
      reading,
      content: result.interpretation,
      modelUsed: REGENERATION_AI_CONFIG.model,
      aiConfig: REGENERATION_AI_CONFIG,
    });

    await this.interpretationsRepository.save(newInterpretation);

    // Actualizar la lectura
    reading.interpretation = result.interpretation;
    reading.regenerationCount += 1;
    // updatedAt se actualiza automáticamente por UpdateDateColumn

    const updatedReading = await this.readingsRepository.save(reading);

    this.logger.log(
      `Interpretation regenerated successfully for reading ${id}. Total regenerations: ${updatedReading.regenerationCount}`,
    );

    return updatedReading;
  }
}
