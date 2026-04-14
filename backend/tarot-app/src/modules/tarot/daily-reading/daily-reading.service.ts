import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import { InterpretationsService } from '../interpretations/interpretations.service';
import { User, UserPlan } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';
import { PlanConfigService } from '../../plan-config/plan-config.service';
import { UsageLimitsService } from '../../usage-limits/usage-limits.service';
import {
  DailyReadingHistoryDto,
  DailyReadingHistoryItemDto,
} from './dto/daily-reading-history.dto';
import { getTodayUTCDateString } from '../../../common/utils/date.utils';

@Injectable()
export class DailyReadingService {
  private readonly logger = new Logger(DailyReadingService.name);

  constructor(
    @InjectRepository(DailyReading)
    private readonly dailyReadingRepository: Repository<DailyReading>,
    @InjectRepository(TarotCard)
    private readonly tarotCardRepository: Repository<TarotCard>,
    private readonly interpretationsService: InterpretationsService,
    private readonly usersService: UsersService,
    private readonly planConfigService: PlanConfigService,
    private readonly usageLimitsService: UsageLimitsService,
  ) {}

  /**
   * Genera la carta del día para un usuario
   * Solo permite 1 carta por día
   * TASK-007: Aplica flujo dual según plan del usuario:
   * - PREMIUM: Genera interpretación con IA (formato Markdown)
   * - FREE/ANONYMOUS: Solo info de DB (texto plano, sin interpretación)
   *
   * @param userId - ID del usuario
   * @param tarotistaId - ID del tarotista
   * @param user - Objeto User completo (opcional). Si no se pasa, se consulta de DB
   */
  async generateDailyCard(
    userId: number,
    tarotistaId: number,
    user?: Partial<User>,
  ): Promise<DailyReading> {
    const todayStr = getTodayUTCDateString();

    // NUEVO: Verificar límite de carta del día ANTES de verificar existencia
    // Si el usuario alcanzó su límite diario de cartas, lanzar error 403

    // Obtener el plan del usuario
    let userPlan: UserPlan = UserPlan.FREE;
    if (user?.plan) {
      userPlan = user.plan;
    } else {
      const fullUser = await this.usersService.findById(userId);
      if (!fullUser) {
        throw new NotFoundException('Usuario no encontrado');
      }
      userPlan = fullUser.plan;
    }

    // BUGFIX: La validación de límites se hace en CheckUsageLimitGuard
    // No necesitamos verificar aquí porque el guard ya lo hizo
    // Solo obtenemos planConfig para decidir si usar IA

    const planConfig = await this.planConfigService.findByPlanType(userPlan);
    if (!planConfig) {
      throw new InternalServerErrorException(
        'No se pudo verificar el límite del plan',
      );
    }

    // Verificar que NO existe carta del día para hoy
    const existingReading = await this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .leftJoinAndSelect('daily_reading.user', 'user')
      .getOne();

    if (existingReading) {
      throw new ConflictException(
        'Ya generaste tu carta del día. Vuelve mañana para una nueva carta.',
      );
    }

    // TASK-007: Ya determinamos el plan arriba para verificar límites
    // userPlan ya está definido

    // T-FR-B03: Seleccionar carta aleatoria
    // FREE/ANONYMOUS → solo Arcanos Mayores (22 cartas)
    // PREMIUM → mazo completo (78 cartas)
    const onlyMajorArcana = userPlan !== UserPlan.PREMIUM;
    const { card, isReversed } = await this.selectRandomCard(onlyMajorArcana);

    // T-FR-B03: Generar interpretación según plan del usuario
    // PREMIUM → interpretación personalizada con IA
    // FREE/ANONYMOUS → texto pre-escrito dailyFreeUpright/Reversed (con fallback a meaningUpright/Reversed)
    let interpretation: string | null = null;
    if (userPlan === UserPlan.PREMIUM) {
      interpretation =
        await this.interpretationsService.generateDailyCardInterpretation(
          card,
          isReversed,
          tarotistaId,
        );
    } else {
      // FREE/ANONYMOUS: usar campos pre-escritos, con fallback
      const freeText = isReversed
        ? card.dailyFreeReversed
        : card.dailyFreeUpright;

      if (freeText) {
        interpretation = freeText;
      } else {
        // Fallback: sin seed aún, usar keywords técnicos
        this.logger.warn(
          `dailyFree${isReversed ? 'Reversed' : 'Upright'} is null for card ${card.id} (${card.name}). Falling back to meaning${isReversed ? 'Reversed' : 'Upright'}.`,
        );
        interpretation = isReversed
          ? card.meaningReversed
          : card.meaningUpright;
      }
    }

    // Guardar en daily_reading
    const dailyReading = this.dailyReadingRepository.create({
      userId,
      tarotistaId,
      cardId: card.id,
      isReversed,
      interpretation,
      // TypeORM acepta string 'YYYY-MM-DD' para columnas de tipo date
      readingDate: todayStr as unknown as Date,
      wasRegenerated: false,
    });

    const saved = await this.dailyReadingRepository.save(dailyReading);

    // Retornar con la relación de card
    const result = await this.dailyReadingRepository.findOne({
      where: { id: saved.id },
      relations: ['card', 'user'],
    });

    if (!result) {
      throw new InternalServerErrorException(
        'Error al guardar la carta del día',
      );
    }

    return result;
  }

  /**
   * Obtiene la carta del día de hoy si existe
   */
  async getTodayCard(userId: number): Promise<DailyReading | null> {
    const todayStr = getTodayUTCDateString();

    return this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .leftJoinAndSelect('daily_reading.card', 'card')
      .getOne();
  }

  /**
   * Obtiene la carta del día por fingerprint
   * @param fingerprint - Fingerprint del usuario anónimo
   * @param date - Fecha en formato YYYY-MM-DD
   */
  async findOneByFingerprint(
    fingerprint: string,
    date: string,
  ): Promise<DailyReading | null> {
    return this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.anonymous_fingerprint = :fingerprint', {
        fingerprint,
      })
      .andWhere('daily_reading.reading_date = :date', { date })
      .leftJoinAndSelect('daily_reading.card', 'card')
      .getOne();
  }

  /**
   * Obtiene la carta del día de hoy para acceso público (sin autenticación)
   * Retorna la primera carta del día generada hoy (carta oficial del día)
   * No incluye interpretación IA (solo info de DB)
   */
  async getTodayCardPublic(): Promise<DailyReading | null> {
    const todayStr = getTodayUTCDateString();

    return this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.reading_date = :date', { date: todayStr })
      .leftJoinAndSelect('daily_reading.card', 'card')
      .orderBy('daily_reading.created_at', 'ASC')
      .limit(1)
      .getOne();
  }

  /**
   * Genera una carta del día aleatoria para usuario anónimo
   * Cada fingerprint recibe una carta única y aleatoria
   * No usa IA, solo información de la base de datos
   */
  async generateAnonymousDailyCard(
    fingerprint: string,
    tarotistaId: number,
  ): Promise<DailyReading> {
    const todayStr = getTodayUTCDateString();

    // Verificar que NO existe carta del día para este fingerprint hoy
    const existingReading = await this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.anonymous_fingerprint = :fingerprint', {
        fingerprint,
      })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .getOne();

    if (existingReading) {
      throw new ConflictException(
        'Ya viste tu carta del día. Regístrate para más lecturas.',
      );
    }

    // T-FR-B03: Seleccionar carta aleatoria — solo Arcanos Mayores para anónimos
    const { card, isReversed } = await this.selectRandomCard(true);

    // T-FR-B03: Usar texto pre-escrito dailyFreeUpright/Reversed, con fallback a meaningUpright/Reversed
    const freeText = isReversed
      ? card.dailyFreeReversed
      : card.dailyFreeUpright;
    let interpretation: string | null;

    if (freeText) {
      interpretation = freeText;
    } else {
      this.logger.warn(
        `dailyFree${isReversed ? 'Reversed' : 'Upright'} is null for card ${card.id} (${card.name}). Falling back to meaning${isReversed ? 'Reversed' : 'Upright'}.`,
      );
      interpretation = isReversed ? card.meaningReversed : card.meaningUpright;
    }

    // Guardar en daily_reading
    const dailyReading = this.dailyReadingRepository.create({
      userId: null,
      anonymousFingerprint: fingerprint,
      tarotistaId,
      cardId: card.id,
      isReversed,
      interpretation,
      readingDate: todayStr as unknown as Date,
      wasRegenerated: false,
    });

    const saved = await this.dailyReadingRepository.save(dailyReading);

    // Retornar con la relación de card
    const result = await this.dailyReadingRepository.findOne({
      where: { id: saved.id },
      relations: ['card'],
    });

    if (!result) {
      throw new InternalServerErrorException(
        'Error al guardar la carta del día',
      );
    }

    return result;
  }

  /**
   * Regenera la carta del día (solo usuarios premium)
   */
  async regenerateDailyCard(
    userId: number,
    tarotistaId: number,
  ): Promise<DailyReading> {
    const todayStr = getTodayUTCDateString();

    // Buscar carta del día existente
    const existingReading = await this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .leftJoinAndSelect('daily_reading.user', 'user')
      .getOne();

    if (!existingReading) {
      throw new NotFoundException('No tienes una carta del día para regenerar');
    }

    // Verificar que usuario sea premium
    if (
      !existingReading.user ||
      existingReading.user.plan !== UserPlan.PREMIUM
    ) {
      throw new ForbiddenException(
        'Solo usuarios premium pueden regenerar la carta del día',
      );
    }

    // Seleccionar nueva carta aleatoria
    const { card, isReversed } = await this.selectRandomCard();

    // Generar nueva interpretación
    const interpretation =
      await this.interpretationsService.generateDailyCardInterpretation(
        card,
        isReversed,
        tarotistaId,
      );

    // Actualizar registro existente
    existingReading.cardId = card.id;
    existingReading.isReversed = isReversed;
    existingReading.interpretation = interpretation;
    existingReading.wasRegenerated = true;

    const updated = await this.dailyReadingRepository.save(existingReading);

    // Retornar con la relación de card
    const result = await this.dailyReadingRepository.findOne({
      where: { id: updated.id },
      relations: ['card'],
    });

    if (!result) {
      throw new InternalServerErrorException(
        'Error al regenerar la carta del día',
      );
    }

    return result;
  }

  /**
   * Obtiene el historial de cartas del día
   */
  async getDailyHistory(
    userId: number,
    page: number = 1,
    limit: number = 10,
  ): Promise<DailyReadingHistoryDto> {
    const skip = (page - 1) * limit;

    const [readings, total] = await this.dailyReadingRepository
      .createQueryBuilder('dr')
      .where('dr.userId = :userId', { userId })
      .leftJoinAndSelect('dr.card', 'card')
      .orderBy('dr.readingDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const items: DailyReadingHistoryItemDto[] = readings.map((reading) => {
      // For PREMIUM users: use AI interpretation
      // For FREE users: use card meaning from DB as fallback
      let displayText: string | null = reading.interpretation;

      if (!displayText && reading.card) {
        // Fallback to card meaning for FREE users
        const meaning = reading.isReversed
          ? reading.card.meaningReversed
          : reading.card.meaningUpright;
        displayText = meaning || null;
      }

      return {
        id: reading.id,
        readingDate: reading.readingDate.toString(),
        cardName: reading.card.name,
        cardImageUrl: reading.card.imageUrl,
        isReversed: reading.isReversed,
        interpretationSummary: displayText,
        wasRegenerated: reading.wasRegenerated,
        createdAt: reading.createdAt,
      };
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Selecciona una carta aleatoria del mazo.
   * Incluye probabilidad 50% de que esté invertida.
   *
   * @param onlyMajorArcana - Si true, selecciona solo entre los 22 Arcanos Mayores (para FREE/anónimos)
   */
  private async selectRandomCard(onlyMajorArcana: boolean = false): Promise<{
    card: TarotCard;
    isReversed: boolean;
  }> {
    const totalCards = await this.tarotCardRepository.count(
      onlyMajorArcana ? { where: { category: 'arcanos_mayores' } } : undefined,
    );

    const randomIndex = Math.floor(Math.random() * totalCards);
    const isReversed = Math.random() < 0.5;

    const cardQueryBuilder = this.tarotCardRepository
      .createQueryBuilder('card')
      .orderBy('card.id', 'ASC')
      .skip(randomIndex)
      .take(1);

    if (onlyMajorArcana) {
      cardQueryBuilder.where('card.category = :category', {
        category: 'arcanos_mayores',
      });
    }

    const card = await cardQueryBuilder.getOne();

    if (!card) {
      throw new InternalServerErrorException(
        'No se pudo seleccionar una carta',
      );
    }

    return { card, isReversed };
  }
}
