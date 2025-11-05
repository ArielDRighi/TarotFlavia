import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder, ObjectLiteral } from 'typeorm';
import * as crypto from 'crypto';
import { TarotReading } from './entities/tarot-reading.entity';
import { TarotInterpretation } from '../interpretations/entities/tarot-interpretation.entity';
import { User, UserPlan } from '../../users/entities/user.entity';
import { TarotDeck } from '../decks/entities/tarot-deck.entity';
import { CreateReadingDto } from './dto/create-reading.dto';
import { QueryReadingsDto } from './dto/query-readings.dto';
import { PaginatedReadingsResponseDto } from './dto/paginated-readings-response.dto';
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
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

  async findAll(
    userId: number,
    queryDto?: QueryReadingsDto,
  ): Promise<PaginatedReadingsResponseDto> {
    const page = queryDto?.page ?? 1;
    const limit = queryDto?.limit ?? 10;
    const sortBy = queryDto?.sortBy ?? 'created_at';
    const sortOrder = queryDto?.sortOrder ?? 'DESC';

    // Get user to check plan
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Calculate total items (respecting free user limit)
    let totalQuery = this.readingsRepository
      .createQueryBuilder('reading')
      .where('reading.userId = :userId', { userId })
      .andWhere('reading.deletedAt IS NULL')
      .orderBy(
        `reading.${sortBy === 'created_at' ? 'createdAt' : 'updatedAt'}`,
        sortOrder,
      );

    // Apply common filters
    if (queryDto) {
      totalQuery = this.applyReadingFilters(totalQuery, queryDto);
    }

    const totalItems = await totalQuery.getCount();

    // Free users can only see 10 most recent readings
    const isFreeUser = user.plan === UserPlan.FREE;
    const effectiveTotalItems = isFreeUser
      ? Math.min(totalItems, 10)
      : totalItems;

    // Calculate pagination metadata
    const totalPages = Math.ceil(effectiveTotalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPreviousPage = page > 1;

    // Fetch paginated data with eager loading
    const skip = (page - 1) * limit;
    let query = this.readingsRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.category', 'category')
      .where('reading.userId = :userId', { userId })
      .andWhere('reading.deletedAt IS NULL')
      .orderBy(
        `reading.${sortBy === 'created_at' ? 'createdAt' : 'updatedAt'}`,
        sortOrder,
      )
      .skip(skip)
      .take(isFreeUser ? Math.min(limit, 10 - skip) : limit);

    // Apply common filters
    if (queryDto) {
      query = this.applyReadingFilters(query, queryDto);
    }

    const data = await query.getMany();

    return {
      data,
      meta: {
        page,
        limit,
        totalItems: effectiveTotalItems,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };
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

    // Soft delete using TypeORM's softRemove
    await this.readingsRepository.softRemove(reading);
  }

  async findTrashedReadings(userId: number): Promise<TarotReading[]> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return this.readingsRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.category', 'category')
      .where('reading.userId = :userId', { userId })
      .andWhere('reading.deletedAt IS NOT NULL')
      .andWhere('reading.deletedAt > :thirtyDaysAgo', { thirtyDaysAgo })
      .withDeleted()
      .orderBy('reading.deletedAt', 'DESC')
      .getMany();
  }

  async restore(id: number, userId: number): Promise<TarotReading> {
    // Buscar la lectura incluyendo eliminadas
    const reading = await this.readingsRepository.findOne({
      where: { id },
      withDeleted: true,
      relations: ['user', 'deck', 'cards', 'category'],
    });

    if (!reading) {
      throw new NotFoundException(`Reading with ID ${id} not found`);
    }

    if (reading.user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to restore this reading',
      );
    }

    if (!reading.deletedAt) {
      throw new HttpException('Reading is not deleted', HttpStatus.BAD_REQUEST);
    }

    // Restaurar limpiando deletedAt
    // Usamos restore para TypeORM gestione correctamente la columna
    await this.readingsRepository.restore({ id });

    // Retornar la lectura restaurada
    const restored = await this.readingsRepository.findOne({
      where: { id },
      relations: ['user', 'deck', 'cards', 'category'],
    });

    if (!restored) {
      throw new NotFoundException(
        `Reading with ID ${id} not found after restore`,
      );
    }

    return restored;
  }

  async findAllForAdmin(
    includeDeleted = false,
  ): Promise<PaginatedReadingsResponseDto> {
    // Create separate query builder for counting (without .take())
    const countQueryBuilder = this.readingsRepository
      .createQueryBuilder('reading')
      .leftJoin('reading.deck', 'deck')
      .leftJoin('reading.cards', 'cards')
      .leftJoin('reading.user', 'user')
      .leftJoin('reading.category', 'category');

    if (includeDeleted) {
      countQueryBuilder.withDeleted();
    }

    const totalItems = await countQueryBuilder.getCount();

    // Create query builder for fetching data (with .take())
    const queryBuilder = this.readingsRepository
      .createQueryBuilder('reading')
      .leftJoinAndSelect('reading.deck', 'deck')
      .leftJoinAndSelect('reading.cards', 'cards')
      .leftJoinAndSelect('reading.user', 'user')
      .leftJoinAndSelect('reading.category', 'category')
      .orderBy('reading.createdAt', 'DESC')
      .take(50);

    if (includeDeleted) {
      queryBuilder.withDeleted();
    }

    const data = await queryBuilder.getMany();

    return {
      data,
      meta: {
        page: 1,
        limit: 50,
        totalItems,
        totalPages: Math.ceil(totalItems / 50),
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  async cleanupOldDeletedReadings(): Promise<number> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const readingsToDelete = await this.readingsRepository
      .createQueryBuilder('reading')
      .where('reading.deletedAt IS NOT NULL')
      .andWhere('reading.deletedAt < :thirtyDaysAgo', { thirtyDaysAgo })
      .withDeleted()
      .getMany();

    if (readingsToDelete.length === 0) {
      return 0;
    }

    // Hard delete (remove permanently)
    await this.readingsRepository.remove(readingsToDelete);

    return readingsToDelete.length;
  }

  async regenerateInterpretation(
    id: number,
    userId: number,
  ): Promise<TarotReading> {
    // DEBUG: Log incoming parameters
    console.log('DEBUG regenerateInterpretation called with:', { id, userId });

    // Buscar la lectura
    const reading = await this.readingsRepository.findOne({
      where: { id },
      relations: ['deck', 'cards', 'user'],
    });

    console.log(
      'DEBUG reading found:',
      reading
        ? {
            id: reading.id,
            hasUser: !!reading.user,
            hasCards: !!reading.cards,
            cardCount: reading.cards?.length,
          }
        : 'NULL',
    );

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

  /**
   * Genera un token único para compartir una lectura
   * Solo usuarios premium pueden compartir lecturas
   */
  async shareReading(
    id: number,
    userId: number,
  ): Promise<{ sharedToken: string; shareUrl: string; isPublic: boolean }> {
    // Verificar que el usuario sea premium
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    if (user.plan !== UserPlan.PREMIUM) {
      throw new ForbiddenException(
        'Solo los usuarios premium pueden compartir lecturas',
      );
    }

    // Obtener la lectura
    const reading = await this.findOne(id, userId);

    // Si ya tiene un token, retornarlo
    if (reading.sharedToken && reading.isPublic) {
      return {
        sharedToken: reading.sharedToken,
        shareUrl: this.buildShareUrl(reading.sharedToken),
        isPublic: reading.isPublic,
      };
    }

    // Generar nuevo token único
    let sharedToken: string;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      sharedToken = this.generateToken();
      attempts++;

      // Verificar si el token ya existe
      const existing = await this.readingsRepository.findOne({
        where: { sharedToken },
      });

      if (!existing) {
        break;
      }

      if (attempts >= maxAttempts) {
        throw new HttpException(
          'No se pudo generar un token único. Intente nuevamente.',
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    } while (attempts < maxAttempts);

    // Actualizar la lectura
    reading.sharedToken = sharedToken;
    reading.isPublic = true;
    await this.readingsRepository.save(reading);

    this.logger.log(`Reading ${id} shared with token ${sharedToken}`);

    return {
      sharedToken,
      shareUrl: this.buildShareUrl(sharedToken),
      isPublic: true,
    };
  }

  /**
   * Deja de compartir una lectura
   */
  async unshareReading(
    id: number,
    userId: number,
  ): Promise<{
    message: string;
    isPublic: boolean;
    sharedToken: string | null;
  }> {
    // Obtener la lectura (valida que pertenezca al usuario)
    const reading = await this.findOne(id, userId);

    // Remover el token y marcar como no pública
    reading.sharedToken = null;
    reading.isPublic = false;
    await this.readingsRepository.save(reading);

    this.logger.log(`Reading ${id} unshared`);

    return {
      message: 'Lectura dejó de ser compartida con éxito',
      isPublic: false,
      sharedToken: null,
    };
  }

  /**
   * Obtiene una lectura compartida públicamente mediante su token
   * No requiere autenticación
   * Incrementa el contador de visualizaciones
   */
  async getSharedReading(token: string): Promise<TarotReading> {
    const reading = await this.readingsRepository.findOne({
      where: { sharedToken: token, isPublic: true },
      relations: ['cards', 'deck', 'category'],
    });

    if (!reading) {
      throw new NotFoundException(
        'Lectura compartida no encontrada o no está pública',
      );
    }

    // Incrementar el contador de visualizaciones
    reading.viewCount += 1;
    await this.readingsRepository.save(reading);

    this.logger.log(
      `Shared reading ${reading.id} viewed (count: ${reading.viewCount})`,
    );

    return reading;
  }

  /**
   * Genera un token alfanumérico criptográficamente seguro de 8-12 caracteres
   */
  private generateToken(): string {
    const length = Math.floor(crypto.randomInt(5)) + 8; // Entre 8 y 12 caracteres
    const chars =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';

    for (let i = 0; i < length; i++) {
      const randomIndex = crypto.randomInt(chars.length);
      token += chars.charAt(randomIndex);
    }

    return token;
  }

  /**
   * Construye la URL completa para compartir una lectura
   */
  private buildShareUrl(token: string): string {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    return `${baseUrl}/shared/${token}`;
  }

  /**
   * Applies common filters to a query builder based on query parameters
   * @param query The query builder to apply filters to
   * @param queryDto The query parameters containing filter criteria
   * @returns The query builder with filters applied
   */
  private applyReadingFilters<T extends ObjectLiteral>(
    query: SelectQueryBuilder<T>,
    queryDto: QueryReadingsDto,
  ): SelectQueryBuilder<T> {
    if (queryDto?.categoryId !== undefined) {
      query.andWhere('reading.categoryId = :categoryId', {
        categoryId: queryDto.categoryId,
      });
    }
    if (queryDto?.dateFrom) {
      query.andWhere('reading.createdAt >= :dateFrom', {
        dateFrom: new Date(queryDto.dateFrom),
      });
    }
    if (queryDto?.dateTo) {
      query.andWhere('reading.createdAt <= :dateTo', {
        dateTo: new Date(queryDto.dateTo),
      });
    }
    return query;
  }
}
