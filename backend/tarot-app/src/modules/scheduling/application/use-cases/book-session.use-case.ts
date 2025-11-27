import {
  Injectable,
  Inject,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';
import { SESSION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { BookSessionDto } from '../dto/book-session.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SessionStatus, SessionType, PaymentStatus } from '../../domain/enums';
import { generateGoogleMeetLink } from '../helpers/google-meet.helper';
import { GetAvailableSlotsUseCase } from './get-available-slots.use-case';
import { Session } from '../../entities/session.entity';

@Injectable()
export class BookSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
    private readonly getAvailableSlotsUseCase: GetAvailableSlotsUseCase,
    private readonly dataSource: DataSource,
  ) {}

  async execute(
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
    const existingPending =
      await this.sessionRepo.findPendingSessionByUserAndTarotist(
        userId,
        dto.tarotistaId,
      );

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
      const slots = await this.getAvailableSlotsUseCase.execute(
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
          status: SessionStatus.PENDING,
        },
      });

      if (conflicting) {
        throw new ConflictException(
          'Este slot acaba de ser reservado por otro usuario. Por favor elige otro horario.',
        );
      }

      // Calcular precio
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

      return this.mapToResponseDto(savedSession);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
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
