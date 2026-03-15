import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { IHolisticServiceRepository } from '../../domain/interfaces/holistic-service-repository.interface';
import { HOLISTIC_SERVICE_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { IAvailabilityRepository } from '../../../scheduling/domain/interfaces/availability-repository.interface';
import { IExceptionRepository } from '../../../scheduling/domain/interfaces/exception-repository.interface';
import { ISessionRepository } from '../../../scheduling/domain/interfaces/session-repository.interface';
import {
  AVAILABILITY_REPOSITORY,
  EXCEPTION_REPOSITORY,
  SESSION_REPOSITORY,
} from '../../../scheduling/domain/interfaces/repository.tokens';
import { ExceptionType, SessionStatus } from '../../../scheduling/domain/enums';
import { Session } from '../../../scheduling/entities/session.entity';

const FLAVIA_TAROTISTA_ID = 1;
const SLOT_INTERVAL_MINUTES = 30;

export interface ServiceAvailabilitySlot {
  time: string;
  available: boolean;
}

export interface ServiceAvailabilityResponseDto {
  date: string;
  slots: ServiceAvailabilitySlot[];
}

@Injectable()
export class GetServiceAvailabilityUseCase {
  constructor(
    @Inject(HOLISTIC_SERVICE_REPOSITORY)
    private readonly holisticServiceRepo: IHolisticServiceRepository,
    @Inject(AVAILABILITY_REPOSITORY)
    private readonly availabilityRepo: IAvailabilityRepository,
    @Inject(EXCEPTION_REPOSITORY)
    private readonly exceptionRepo: IExceptionRepository,
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(
    slug: string,
    date: string,
  ): Promise<ServiceAvailabilityResponseDto> {
    // 1. Validate and fetch the holistic service
    const service = await this.holisticServiceRepo.findBySlug(slug);
    if (!service || !service.isActive) {
      throw new NotFoundException(`Servicio holístico no encontrado: ${slug}`);
    }

    // 2. Validate date format and ensure it's not in the past
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      throw new BadRequestException(
        'Formato de fecha inválido. Use YYYY-MM-DD',
      );
    }

    const requestedDate = new Date(`${date}T12:00:00`);
    if (isNaN(requestedDate.getTime())) {
      throw new BadRequestException('Fecha inválida');
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (requestedDate < today) {
      throw new BadRequestException(
        'No se puede consultar disponibilidad para fechas pasadas',
      );
    }

    // 3. Fetch scheduling data for Flavia (tarotistaId=1)
    const [weeklyAvailability, exceptions, sessions] = await Promise.all([
      this.availabilityRepo.getWeeklyAvailability(FLAVIA_TAROTISTA_ID),
      this.exceptionRepo.getExceptionsByDateRange(
        FLAVIA_TAROTISTA_ID,
        date,
        date,
      ),
      this.sessionRepo.findSessionsByTarotistAndDateRange(
        FLAVIA_TAROTISTA_ID,
        date,
        date,
        [SessionStatus.PENDING, SessionStatus.CONFIRMED],
      ),
    ]);

    // 4. If no weekly availability is configured, return empty
    if (weeklyAvailability.length === 0) {
      return { date, slots: [] };
    }

    // 5. Check for exceptions on this specific date
    const exception = exceptions.find((ex) => ex.exceptionDate === date);
    if (exception && exception.exceptionType === ExceptionType.BLOCKED) {
      return { date, slots: [] };
    }

    // 6. Determine working hours for this day
    let startTime: string;
    let endTime: string;

    if (exception && exception.exceptionType === ExceptionType.CUSTOM_HOURS) {
      startTime = exception.startTime!;
      endTime = exception.endTime!;
    } else {
      const dayNum = requestedDate.getDay();
      const dayAvailability = weeklyAvailability.find(
        (av) => (av.dayOfWeek as number) === dayNum,
      );
      if (!dayAvailability) {
        return { date, slots: [] };
      }
      startTime = dayAvailability.startTime;
      endTime = dayAvailability.endTime;
    }

    // 7. Generate all 30-minute time slots for this day
    const timeSlots = this.generateTimeSlots(
      startTime,
      endTime,
      SLOT_INTERVAL_MINUTES,
    );

    // 8. Map each slot to available/occupied
    const slots: ServiceAvailabilitySlot[] = timeSlots.map((time) => {
      const available = !this.isSlotOccupied(
        sessions,
        date,
        time,
        service.durationMinutes,
      );
      return { time, available };
    });

    return { date, slots };
  }

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

  private isSlotOccupied(
    sessions: Session[],
    date: string,
    time: string,
    durationMinutes: number,
  ): boolean {
    const [slotHour, slotMin] = time.split(':').map(Number);
    const slotStart = slotHour * 60 + slotMin;
    const slotEnd = slotStart + durationMinutes;

    for (const session of sessions) {
      if (session.sessionDate !== date) {
        continue;
      }

      const [sessionHour, sessionMin] = session.sessionTime
        .split(':')
        .map(Number);
      const sessionStart = sessionHour * 60 + sessionMin;
      const sessionEnd = sessionStart + session.durationMinutes;

      // Overlap check
      if (
        (slotStart >= sessionStart && slotStart < sessionEnd) ||
        (slotEnd > sessionStart && slotEnd <= sessionEnd) ||
        (slotStart <= sessionStart && slotEnd >= sessionEnd)
      ) {
        return true;
      }
    }

    return false;
  }
}
