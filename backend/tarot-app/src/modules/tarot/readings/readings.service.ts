import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TarotReading } from './entities/tarot-reading.entity';
import { User } from '../../users/entities/user.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { CreateReadingDto } from './dto/create-reading.dto';
import { InterpretationsService } from '../interpretations/interpretations.service';
import { CardsService } from '../cards/cards.service';
import { SpreadsService } from '../spreads/spreads.service';
import { PredefinedQuestionsService } from '../../predefined-questions/predefined-questions.service';

@Injectable()
export class ReadingsService {
  private readonly logger = new Logger(ReadingsService.name);

  constructor(
    @InjectRepository(TarotReading)
    private readingsRepository: Repository<TarotReading>,
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
        const interpretation =
          await this.interpretationsService.generateInterpretation(
            cards,
            createReadingDto.cardPositions,
            question,
            spread,
            undefined, // category - puede agregarse después
            user.id,
            savedReading.id,
          );

        // Actualizar la lectura con la interpretación
        savedReading.interpretation = interpretation;
        await this.readingsRepository.save(savedReading);

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
}
