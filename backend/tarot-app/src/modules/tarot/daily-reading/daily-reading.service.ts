import {
  Injectable,
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
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

@Injectable()
export class DailyReadingService {
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
   * Helper para obtener la fecha local del día actual sin conversión a UTC
   * Esto evita problemas de timezone donde el día puede cambiar al convertir a UTC
   */
  private getTodayLocalDateString(): string {
    const now = new Date();
    // BUGFIX: Use UTC date to match the guard's date filtering logic
    // This ensures consistency: both daily card creation and limit checking
    // use the same timezone (UTC), preventing timezone mismatches
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

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
    const todayStr = this.getTodayLocalDateString();

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

    // Seleccionar carta aleatoria
    const { card, isReversed } = await this.selectRandomCard();

    // TASK-007: Generar interpretación solo si el usuario es PREMIUM
    let interpretation: string | null = null;
    if (userPlan === UserPlan.PREMIUM) {
      interpretation =
        await this.interpretationsService.generateDailyCardInterpretation(
          card,
          isReversed,
          tarotistaId,
        );
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
    const todayStr = this.getTodayLocalDateString();

    return this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .leftJoinAndSelect('daily_reading.card', 'card')
      .getOne();
  }

  /**
   * Obtiene la carta del día de hoy para acceso público (sin autenticación)
   * Retorna la primera carta del día generada hoy (carta oficial del día)
   * No incluye interpretación IA (solo info de DB)
   */
  async getTodayCardPublic(): Promise<DailyReading | null> {
    const todayStr = this.getTodayLocalDateString();

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
    const todayStr = this.getTodayLocalDateString();

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

    // Seleccionar carta aleatoria
    const { card, isReversed } = await this.selectRandomCard();

    // NO generar interpretación IA para usuarios anónimos
    // Guardar en daily_reading
    const dailyReading = this.dailyReadingRepository.create({
      userId: null,
      anonymousFingerprint: fingerprint,
      tarotistaId,
      cardId: card.id,
      isReversed,
      interpretation: null, // Sin IA para anónimos
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
    const todayStr = this.getTodayLocalDateString();

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

    const items: DailyReadingHistoryItemDto[] = readings.map((reading) => ({
      id: reading.id,
      readingDate: reading.readingDate.toString(),
      cardName: reading.card.name,
      cardImageUrl: reading.card.imageUrl,
      isReversed: reading.isReversed,
      // Return full interpretation since cards are self-contained (no detail page)
      interpretationSummary: reading.interpretation || null,
      wasRegenerated: reading.wasRegenerated,
      createdAt: reading.createdAt,
    }));

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Selecciona una carta aleatoria del mazo
   * Incluye probabilidad 50% de que esté invertida
   */
  private async selectRandomCard(): Promise<{
    card: TarotCard;
    isReversed: boolean;
  }> {
    const totalCards = await this.tarotCardRepository.count();
    const randomIndex = Math.floor(Math.random() * totalCards);
    const isReversed = Math.random() < 0.5;

    const card = await this.tarotCardRepository
      .createQueryBuilder('card')
      .orderBy('card.id', 'ASC')
      .skip(randomIndex)
      .take(1)
      .getOne();

    if (!card) {
      throw new InternalServerErrorException(
        'No se pudo seleccionar una carta',
      );
    }

    return { card, isReversed };
  }
}
