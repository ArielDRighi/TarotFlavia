import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Session } from '../entities';
import {
  BookSessionDto,
  CancelSessionDto,
  ConfirmSessionDto,
  CompleteSessionDto,
  SessionResponseDto,
} from '../dto';
import { SessionStatus, SessionType, PaymentStatus } from '../domain/enums';
import { generateGoogleMeetLink } from '../helpers/google-meet.helper';
import { AvailabilityService } from './availability.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepository: Repository<Session>,
    private readonly availabilityService: AvailabilityService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Reserva una sesión para un usuario
   * Usa transacciones para prevenir double-booking (optimistic locking)
   */
  async bookSession(
    userId: number,
    userEmail: string,
    dto: BookSessionDto,
  ): Promise<SessionResponseDto> {
    // Validar que la fecha sea futura
    const sessionDateTime = new Date(`${dto.sessionDate}T${dto.sessionTime}`);
    const now = new Date();
    const minDateTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 horas

    if (sessionDateTime < minDateTime) {
      throw new BadRequestException(
        'Las sesiones deben reservarse con al menos 2 horas de anticipación',
      );
    }

    // Verificar que el usuario no tenga ya una sesión pending con este tarotista
    const existingPending = await this.sessionRepository.findOne({
      where: {
        userId,
        tarotistaId: dto.tarotistaId,
        status: SessionStatus.PENDING,
      },
    });

    if (existingPending) {
      throw new ConflictException(
        'Ya tienes una sesión pendiente con este tarotista. Completa o cancela la sesión anterior primero.',
      );
    }

    // Usar transacción para prevenir double-booking
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar disponibilidad dentro de la transacción
      const slots = await this.availabilityService.getAvailableSlots(
        dto.tarotistaId,
        dto.sessionDate,
        dto.sessionDate,
        dto.durationMinutes,
      );

      const slotAvailable = slots.find(
        (slot) =>
          slot.date === dto.sessionDate &&
          slot.time === dto.sessionTime &&
          slot.available,
      );

      if (!slotAvailable) {
        throw new ConflictException(
          'El slot seleccionado no está disponible. Por favor elige otro horario.',
        );
      }

      // Verificar nuevamente que no esté reservado (double-check dentro de transacción)
      const conflicting = await queryRunner.manager.findOne(Session, {
        where: {
          tarotistaId: dto.tarotistaId,
          sessionDate: dto.sessionDate,
          sessionTime: dto.sessionTime,
          status: SessionStatus.PENDING || SessionStatus.CONFIRMED,
        },
      });

      if (conflicting) {
        throw new ConflictException(
          'Este slot acaba de ser reservado por otro usuario. Por favor elige otro horario.',
        );
      }

      // Calcular precio (por ahora hardcoded, en futuro traer de tarotista)
      const priceUsd = this.calculatePrice(
        dto.sessionType,
        dto.durationMinutes,
      );

      // Generar link de Google Meet
      const googleMeetLink = generateGoogleMeetLink();

      // Crear sesión
      const session = queryRunner.manager.create(Session, {
        userId,
        tarotistaId: dto.tarotistaId,
        sessionDate: dto.sessionDate,
        sessionTime: dto.sessionTime,
        durationMinutes: dto.durationMinutes,
        sessionType: dto.sessionType,
        status: SessionStatus.PENDING,
        priceUsd,
        paymentStatus: PaymentStatus.PENDING,
        googleMeetLink,
        userEmail,
        userNotes: dto.userNotes,
      });

      const savedSession = await queryRunner.manager.save(session);

      await queryRunner.commitTransaction();

      // TODO: Enviar emails a usuario y tarotista (TASK-016 EmailService)
      // await this.emailService.sendSessionBookedToUser(savedSession);
      // await this.emailService.sendSessionBookedToTarotist(savedSession);

      return this.mapToResponseDto(savedSession);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Obtiene las sesiones de un usuario
   */
  async getUserSessions(
    userId: number,
    status?: SessionStatus,
  ): Promise<SessionResponseDto[]> {
    const where: {
      userId: number;
      status?: SessionStatus;
    } = { userId };
    if (status) {
      where.status = status;
    }

    const sessions = await this.sessionRepository.find({
      where,
      order: { sessionDate: 'DESC', sessionTime: 'DESC' },
    });

    return sessions.map((session) => this.mapToResponseDto(session));
  }

  /**
   * Obtiene las sesiones de un tarotista
   */
  async getTarotistSessions(
    tarotistaId: number,
    date?: string,
  ): Promise<SessionResponseDto[]> {
    const where: {
      tarotistaId: number;
      sessionDate?: string;
    } = { tarotistaId };
    if (date) {
      where.sessionDate = date;
    }

    const sessions = await this.sessionRepository.find({
      where,
      order: { sessionDate: 'ASC', sessionTime: 'ASC' },
    });

    return sessions.map((session) => this.mapToResponseDto(session));
  }

  /**
   * Confirma una sesión (por parte del tarotista)
   */
  async confirmSession(
    sessionId: number,
    tarotistaId: number,
    dto: ConfirmSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, tarotistaId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (session.status !== SessionStatus.PENDING) {
      throw new BadRequestException(
        'Solo se pueden confirmar sesiones pendientes',
      );
    }

    session.status = SessionStatus.CONFIRMED;
    session.confirmedAt = new Date();
    if (dto.notes) {
      session.tarotistNotes = dto.notes;
    }

    const updated = await this.sessionRepository.save(session);

    // TODO: Enviar email de confirmación al usuario
    // await this.emailService.sendSessionConfirmedToUser(updated);

    return this.mapToResponseDto(updated);
  }

  /**
   * Cancela una sesión (por parte del usuario)
   */
  async cancelSession(
    sessionId: number,
    userId: number,
    dto: CancelSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, userId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (
      session.status === SessionStatus.COMPLETED ||
      session.status === SessionStatus.CANCELLED_BY_USER ||
      session.status === SessionStatus.CANCELLED_BY_TAROTIST
    ) {
      throw new BadRequestException('Esta sesión ya está finalizada');
    }

    // Validar política de cancelación: >24h de anticipación
    const sessionDateTime = new Date(
      `${session.sessionDate}T${session.sessionTime}`,
    );
    const now = new Date();
    const hoursUntilSession =
      (sessionDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

    if (hoursUntilSession < 24) {
      throw new BadRequestException(
        'Las sesiones solo pueden cancelarse con al menos 24 horas de anticipación',
      );
    }

    session.status = SessionStatus.CANCELLED_BY_USER;
    session.cancelledAt = new Date();
    session.cancellationReason = dto.reason;

    const updated = await this.sessionRepository.save(session);

    // TODO: Enviar emails de cancelación
    // await this.emailService.sendSessionCancelledToTarotist(updated);
    // await this.emailService.sendSessionCancelledToUser(updated);

    return this.mapToResponseDto(updated);
  }

  /**
   * Cancela una sesión (por parte del tarotista)
   */
  async cancelSessionByTarotist(
    sessionId: number,
    tarotistaId: number,
    dto: CancelSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, tarotistaId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (
      session.status === SessionStatus.COMPLETED ||
      session.status === SessionStatus.CANCELLED_BY_USER ||
      session.status === SessionStatus.CANCELLED_BY_TAROTIST
    ) {
      throw new BadRequestException('Esta sesión ya está finalizada');
    }

    session.status = SessionStatus.CANCELLED_BY_TAROTIST;
    session.cancelledAt = new Date();
    session.cancellationReason = dto.reason;

    const updated = await this.sessionRepository.save(session);

    // TODO: Enviar emails de cancelación
    // await this.emailService.sendSessionCancelledByTarotistToUser(updated);

    return this.mapToResponseDto(updated);
  }

  /**
   * Completa una sesión (por parte del tarotista)
   */
  async completeSession(
    sessionId: number,
    tarotistaId: number,
    dto: CompleteSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepository.findOne({
      where: { id: sessionId, tarotistaId },
    });

    if (!session) {
      throw new NotFoundException('Sesión no encontrada');
    }

    if (session.status !== SessionStatus.CONFIRMED) {
      throw new BadRequestException(
        'Solo se pueden completar sesiones confirmadas',
      );
    }

    session.status = SessionStatus.COMPLETED;
    session.completedAt = new Date();
    if (dto.tarotistNotes) {
      session.tarotistNotes = dto.tarotistNotes;
    }

    const updated = await this.sessionRepository.save(session);

    return this.mapToResponseDto(updated);
  }

  /**
   * Calcula el precio de una sesión según tipo y duración
   * TODO: Traer precios de la configuración del tarotista
   */
  private calculatePrice(
    sessionType: SessionType,
    durationMinutes: number,
  ): number {
    // Precios base por minuto según tipo de sesión
    const baseRates = {
      [SessionType.TAROT_READING]: 0.83, // $50/60min
      [SessionType.ENERGY_CLEANING]: 1.0, // $60/60min
      [SessionType.HEBREW_PENDULUM]: 0.67, // $40/60min
      [SessionType.CONSULTATION]: 0.5, // $30/60min
    };

    const rate = baseRates[sessionType] || 0.5;
    return Number((rate * durationMinutes).toFixed(2));
  }

  /**
   * Mapea entidad a DTO de respuesta
   */
  private mapToResponseDto(session: Session): SessionResponseDto {
    return {
      id: session.id,
      tarotistaId: session.tarotistaId,
      userId: session.userId,
      sessionDate: session.sessionDate,
      sessionTime: session.sessionTime,
      durationMinutes: session.durationMinutes,
      sessionType: session.sessionType,
      status: session.status,
      priceUsd: session.priceUsd,
      paymentStatus: session.paymentStatus,
      googleMeetLink: session.googleMeetLink,
      userEmail: session.userEmail,
      userNotes: session.userNotes ?? undefined,
      tarotistNotes: session.tarotistNotes ?? undefined,
      cancelledAt: session.cancelledAt ?? undefined,
      cancellationReason: session.cancellationReason ?? undefined,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      confirmedAt: session.confirmedAt ?? undefined,
      completedAt: session.completedAt ?? undefined,
    };
  }
}
