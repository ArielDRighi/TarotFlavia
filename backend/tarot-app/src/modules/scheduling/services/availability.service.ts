import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { TarotistAvailability, TarotistException, Session } from '../entities';
import {
  SetWeeklyAvailabilityDto,
  AddExceptionDto,
  AvailableSlotDto,
} from '../dto';
import { DayOfWeek, ExceptionType, SessionStatus } from '../enums';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(TarotistAvailability)
    private readonly availabilityRepository: Repository<TarotistAvailability>,
    @InjectRepository(TarotistException)
    private readonly exceptionRepository: Repository<TarotistException>,
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
  ) {}

  /**
   * Establece la disponibilidad semanal del tarotista para un día específico
   */
  async setWeeklyAvailability(
    tarotistaId: number,
    dto: SetWeeklyAvailabilityDto,
  ): Promise<TarotistAvailability> {
    // Validar que startTime < endTime
    if (dto.startTime >= dto.endTime) {
      throw new ConflictException(
        'La hora de inicio debe ser anterior a la hora de fin',
      );
    }

    // Buscar disponibilidad existente para este día
    const existing = await this.availabilityRepository.findOne({
      where: {
        tarotistaId,
        dayOfWeek: dto.dayOfWeek,
      },
    });

    if (existing) {
      // Actualizar existente
      existing.startTime = dto.startTime;
      existing.endTime = dto.endTime;
      existing.isActive = true;
      return this.availabilityRepository.save(existing);
    }

    // Crear nueva disponibilidad
    const availability = this.availabilityRepository.create({
      tarotistaId,
      dayOfWeek: dto.dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
      isActive: true,
    });

    return this.availabilityRepository.save(availability);
  }

  /**
   * Obtiene la disponibilidad semanal del tarotista
   */
  async getWeeklyAvailability(
    tarotistaId: number,
  ): Promise<TarotistAvailability[]> {
    return this.availabilityRepository.find({
      where: { tarotistaId, isActive: true },
      order: { dayOfWeek: 'ASC' },
    });
  }

  /**
   * Elimina la disponibilidad de un día específico
   */
  async removeWeeklyAvailability(
    tarotistaId: number,
    availabilityId: number,
  ): Promise<void> {
    const availability = await this.availabilityRepository.findOne({
      where: { id: availabilityId, tarotistaId },
    });

    if (!availability) {
      throw new NotFoundException('Disponibilidad no encontrada');
    }

    await this.availabilityRepository.remove(availability);
  }

  /**
   * Agrega una excepción (día bloqueado o con horarios custom)
   */
  async addException(
    tarotistaId: number,
    dto: AddExceptionDto,
  ): Promise<TarotistException> {
    // Validar que la fecha sea futura
    const exceptionDate = new Date(dto.exceptionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (exceptionDate < today) {
      throw new ConflictException(
        'No se pueden agregar excepciones en el pasado',
      );
    }

    // Si es custom_hours, validar tiempos
    if (
      dto.exceptionType === ExceptionType.CUSTOM_HOURS &&
      dto.startTime &&
      dto.endTime
    ) {
      if (dto.startTime >= dto.endTime) {
        throw new ConflictException(
          'La hora de inicio debe ser anterior a la hora de fin',
        );
      }
    }

    // Verificar si ya existe excepción para esta fecha
    const existing = await this.exceptionRepository.findOne({
      where: {
        tarotistaId,
        exceptionDate: dto.exceptionDate,
      },
    });

    if (existing) {
      throw new ConflictException('Ya existe una excepción para esta fecha');
    }

    const exception = this.exceptionRepository.create({
      tarotistaId,
      exceptionDate: dto.exceptionDate,
      exceptionType: dto.exceptionType,
      startTime: dto.startTime,
      endTime: dto.endTime,
      reason: dto.reason,
    });

    return this.exceptionRepository.save(exception);
  }

  /**
   * Obtiene las excepciones futuras del tarotista
   */
  async getExceptions(tarotistaId: number): Promise<TarotistException[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return this.exceptionRepository.find({
      where: {
        tarotistaId,
        exceptionDate: Between(today.toISOString().split('T')[0], '2099-12-31'),
      },
      order: { exceptionDate: 'ASC' },
    });
  }

  /**
   * Elimina una excepción
   */
  async removeException(
    tarotistaId: number,
    exceptionId: number,
  ): Promise<void> {
    const exception = await this.exceptionRepository.findOne({
      where: { id: exceptionId, tarotistaId },
    });

    if (!exception) {
      throw new NotFoundException('Excepción no encontrada');
    }

    await this.exceptionRepository.remove(exception);
  }

  /**
   * Genera los slots disponibles para un rango de fechas
   * Algoritmo complejo que considera:
   * - Disponibilidad semanal general
   * - Excepciones (días bloqueados/custom)
   * - Sesiones ya reservadas
   * - Duración de sesión solicitada
   */
  async getAvailableSlots(
    tarotistaId: number,
    startDate: string,
    endDate: string,
    durationMinutes: number,
  ): Promise<AvailableSlotDto[]> {
    const slots: AvailableSlotDto[] = [];

    // Obtener disponibilidad semanal
    const weeklyAvailability = await this.getWeeklyAvailability(tarotistaId);
    if (weeklyAvailability.length === 0) {
      return slots; // No hay disponibilidad configurada
    }

    // Obtener excepciones en el rango
    const exceptions = await this.exceptionRepository.find({
      where: {
        tarotistaId,
        exceptionDate: Between(startDate, endDate),
      },
    });

    // Obtener sesiones en el rango
    const sessions = await this.sessionRepository.find({
      where: {
        tarotistaId,
        sessionDate: Between(startDate, endDate),
        status: In([SessionStatus.PENDING, SessionStatus.CONFIRMED]),
      },
    });

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
