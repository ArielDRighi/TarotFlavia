import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';
import { SESSION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { CancelSessionDto } from '../dto/cancel-session.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SessionStatus } from '../../domain/enums';
import { Session } from '../../entities/session.entity';

@Injectable()
export class CancelSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(
    sessionId: number,
    userId: number,
    dto: CancelSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session || session.userId !== userId) {
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

    const updated = await this.sessionRepo.updateSession(session);

    // TODO: Enviar emails de cancelación

    return this.mapToResponseDto(updated);
  }

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
