import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { UserRitualHistory } from '../../entities/user-ritual-history.entity';
import { LunarPhaseService } from './lunar-phase.service';
import { RitualsService } from './rituals.service';
import { CompleteRitualDto } from '../dto/complete-ritual.dto';

/**
 * Estadísticas de usuario sobre rituales
 */
export interface UserStats {
  totalCompleted: number;
  favoriteCategory: string | null;
  currentStreak: number;
  thisMonthCount: number;
}

/**
 * Servicio para gestión del historial de rituales de usuarios
 *
 * Responsabilidades:
 * - Registrar rituales completados
 * - Obtener historial de rituales
 * - Calcular estadísticas de usuario
 * - Calcular rachas de días consecutivos
 */
@Injectable()
export class RitualHistoryService {
  constructor(
    @InjectRepository(UserRitualHistory)
    private readonly historyRepository: Repository<UserRitualHistory>,
    private readonly ritualsService: RitualsService,
    private readonly lunarPhaseService: LunarPhaseService,
  ) {}

  /**
   * Registra un ritual como completado
   */
  async completeRitual(
    userId: number,
    ritualId: number,
    dto: CompleteRitualDto,
  ): Promise<UserRitualHistory> {
    // Verificar si ya se completó hoy
    const alreadyCompleted = await this.hasCompletedToday(userId, ritualId);
    if (alreadyCompleted) {
      throw new Error(
        'Este ritual ya fue completado hoy. Solo se permite un registro por día.',
      );
    }

    const lunarInfo = this.lunarPhaseService.getCurrentPhase();

    const history = this.historyRepository.create({
      userId,
      ritualId,
      completedAt: new Date(),
      lunarPhase: lunarInfo.phase,
      lunarSign: lunarInfo.zodiacSign,
      notes: dto.notes,
      rating: dto.rating,
      durationMinutes: dto.durationMinutes,
    });

    await this.historyRepository.save(history);

    // Incrementar contador del ritual
    await this.ritualsService.incrementCompletionCount(ritualId);

    return history;
  }

  /**
   * Obtiene el historial de rituales de un usuario
   */
  async getUserHistory(
    userId: number,
    limit: number = 20,
  ): Promise<UserRitualHistory[]> {
    return this.historyRepository.find({
      where: { userId },
      relations: ['ritual'],
      order: { completedAt: 'DESC' },
      take: limit,
    });
  }

  /**
   * Obtiene estadísticas del usuario
   */
  async getUserStats(userId: number): Promise<UserStats> {
    const totalCompleted = await this.historyRepository.count({
      where: { userId },
    });

    // Categoría favorita
    const categoryResult: { category: string; count: string } | undefined =
      await this.historyRepository
        .createQueryBuilder('history')
        .innerJoin('history.ritual', 'ritual')
        .select('ritual.category', 'category')
        .addSelect('COUNT(*)', 'count')
        .where('history.userId = :userId', { userId })
        .groupBy('ritual.category')
        .orderBy('count', 'DESC')
        .limit(1)
        .getRawOne();

    // Racha actual
    const currentStreak = await this.calculateStreak(userId);

    // Rituales completados este mes
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthCount = await this.historyRepository.count({
      where: {
        userId,
        completedAt: Between(startOfMonth, new Date()),
      },
    });

    return {
      totalCompleted,
      favoriteCategory: categoryResult?.category || null,
      currentStreak,
      thisMonthCount,
    };
  }

  /**
   * Verifica si el usuario completó un ritual hoy
   */
  async hasCompletedToday(userId: number, ritualId: number): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const count = await this.historyRepository.count({
      where: {
        userId,
        ritualId,
        completedAt: Between(today, tomorrow),
      },
    });

    return count > 0;
  }

  /**
   * Calcula la racha de días consecutivos con rituales completados
   */
  private async calculateStreak(userId: number): Promise<number> {
    const history = await this.historyRepository.find({
      where: { userId },
      order: { completedAt: 'DESC' },
      take: 30,
    });

    if (history.length === 0) return 0;

    let streak = 0;
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Helper para convertir Date a string local YYYY-MM-DD
    const toLocalDateString = (date: Date): string => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    // Agrupar por fecha local
    const dateSet = new Set<string>();
    history.forEach((h) => {
      const date = new Date(h.completedAt);
      date.setHours(0, 0, 0, 0);
      dateSet.add(toLocalDateString(date));
    });

    // Contar días consecutivos hacia atrás
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(currentDate);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = toLocalDateString(checkDate);

      if (dateSet.has(dateStr)) {
        streak++;
      } else if (i > 0) {
        // Si no es hoy y no hay registro, termina la racha
        break;
      }
    }

    return streak;
  }
}
