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
import { UserPlan } from '../../users/entities/user.entity';
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
  ) {}

  /**
   * Helper para obtener la fecha local del día actual sin conversión a UTC
   * Esto evita problemas de timezone donde el día puede cambiar al convertir a UTC
   */
  private getTodayLocalDateString(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Genera la carta del día para un usuario
   * Solo permite 1 carta por día
   */
  async generateDailyCard(
    userId: number,
    tarotistaId: number,
  ): Promise<DailyReading> {
    const todayStr = this.getTodayLocalDateString();

    // Verificar que NO existe carta del día para hoy
    const existingReading = await this.dailyReadingRepository
      .createQueryBuilder('daily_reading')
      .where('daily_reading.user_id = :userId', { userId })
      .andWhere('daily_reading.reading_date = :date', { date: todayStr })
      .getOne();

    if (existingReading) {
      throw new ConflictException(
        'Ya generaste tu carta del día. Vuelve mañana para una nueva carta.',
      );
    }

    // Seleccionar carta aleatoria
    const { card, isReversed } = await this.selectRandomCard();

    // Generar interpretación con prompt específico de "carta del día"
    const interpretation =
      await this.interpretationsService.generateDailyCardInterpretation(
        card,
        isReversed,
        tarotistaId,
      );

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
      isReversed: reading.isReversed,
      interpretationSummary: this.truncateInterpretation(
        reading.interpretation,
        150,
      ),
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

  /**
   * Trunca la interpretación a N caracteres
   */
  private truncateInterpretation(text: string, maxLength: number): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + '...';
  }
}
