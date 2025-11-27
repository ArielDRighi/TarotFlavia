import { Injectable, Inject } from '@nestjs/common';
import { IAvailabilityRepository } from '../../domain/interfaces/availability-repository.interface';
import { IExceptionRepository } from '../../domain/interfaces/exception-repository.interface';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';
import {
  AVAILABILITY_REPOSITORY,
  EXCEPTION_REPOSITORY,
  SESSION_REPOSITORY,
} from '../../domain/interfaces/repository.tokens';
import { AvailableSlotDto } from '../dto/session-response.dto';
import { DayOfWeek, ExceptionType, SessionStatus } from '../../domain/enums';
import { Session } from '../../entities/session.entity';

@Injectable()
export class GetAvailableSlotsUseCase {
  constructor(
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepo: IExceptionRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(
    tarotistaId: number,
    startDate: string,
    endDate: string,
    durationMinutes: number,
  ): Promise<AvailableSlotDto[]> {
    const slots: AvailableSlotDto[] = [];

    // Obtener disponibilidad semanal
    const weeklyAvailability =
      await this.availabilityRepo.getWeeklyAvailability(tarotistaId);
    if (weeklyAvailability.length === 0) {
      return slots; // No hay disponibilidad configurada
    }

    // Obtener excepciones en el rango
    const exceptions = await this.exceptionRepo.getExceptionsByDateRange(
      tarotistaId,
      startDate,
      endDate,
    );

    // Obtener sesiones en el rango
    const sessions = await this.sessionRepo.findSessionsByTarotistAndDateRange(
      tarotistaId,
      startDate,
      endDate,
      [SessionStatus.PENDING, SessionStatus.CONFIRMED],
    );

    // Iterar por cada día en el rango
    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();
    const minAdvanceHours = 2; // Mínimo 2 horas de anticipación

    for (
      let date = new Date(start);
      date <= end;
      date.setDate(date.getDate() + 1)
    ) {
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = date.getDay() as DayOfWeek;

      // 1. Verificar si hay excepción para esta fecha
      const exception = exceptions.find((ex) => ex.exceptionDate === dateStr);

      if (exception && exception.exceptionType === ExceptionType.BLOCKED) {
        continue; // Día bloqueado, saltar
      }

      // 2. Determinar horarios disponibles
      let startTime: string;
      let endTime: string;

      if (exception && exception.exceptionType === ExceptionType.CUSTOM_HOURS) {
        startTime = exception.startTime!;
        endTime = exception.endTime!;
      } else {
        const dayAvailability = weeklyAvailability.find(
          (av) => av.dayOfWeek === dayOfWeek,
        );
        if (!dayAvailability) {
          continue; // No hay disponibilidad este día de semana
        }
        startTime = dayAvailability.startTime;
        endTime = dayAvailability.endTime;
      }

      // 3. Generar slots cada 30 minutos
      const slots30min = this.generateTimeSlots(startTime, endTime, 30);

      for (const slotTime of slots30min) {
        // Verificar que el slot esté en el futuro con mínimo de anticipación
        const slotDateTime = new Date(`${dateStr}T${slotTime}`);
        const minDateTime = new Date(
          now.getTime() + minAdvanceHours * 60 * 60 * 1000,
        );

        if (slotDateTime < minDateTime) {
          continue; // Slot demasiado pronto
        }

        // Verificar si el slot está ocupado
        const isOccupied = this.isSlotOccupied(
          sessions,
          dateStr,
          slotTime,
          durationMinutes,
        );

        if (!isOccupied) {
          slots.push({
            date: dateStr,
            time: slotTime,
            durationMinutes,
            available: true,
          });
        }
      }
    }

    return slots;
  }

  /**
   * Genera slots de tiempo cada X minutos entre startTime y endTime
   */
  private generateTimeSlots(
    startTime: string,
    endTime: string,
    intervalMinutes: number,
  ): string[] {
    const slots: string[] = [];
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes < endMinutes) {
      const hour = Math.floor(currentMinutes / 60);
      const min = currentMinutes % 60;
      slots.push(
        `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`,
      );
      currentMinutes += intervalMinutes;
    }

    return slots;
  }

  /**
   * Verifica si un slot está ocupado por una sesión existente
   */
  private isSlotOccupied(
    sessions: Session[],
    date: string,
    time: string,
    durationMinutes: number,
  ): boolean {
    const [slotHour, slotMin] = time.split(':').map(Number);
    const slotStartMinutes = slotHour * 60 + slotMin;
    const slotEndMinutes = slotStartMinutes + durationMinutes;

    for (const session of sessions) {
      if (session.sessionDate !== date) {
        continue;
      }

      const [sessionHour, sessionMin] = session.sessionTime
        .split(':')
        .map(Number);
      const sessionStartMinutes = sessionHour * 60 + sessionMin;
      const sessionEndMinutes = sessionStartMinutes + session.durationMinutes;

      // Verificar solapamiento
      if (
        (slotStartMinutes >= sessionStartMinutes &&
          slotStartMinutes < sessionEndMinutes) ||
        (slotEndMinutes > sessionStartMinutes &&
          slotEndMinutes <= sessionEndMinutes) ||
        (slotStartMinutes <= sessionStartMinutes &&
          slotEndMinutes >= sessionEndMinutes)
      ) {
        return true; // Hay solapamiento
      }
    }

    return false;
  }
}
