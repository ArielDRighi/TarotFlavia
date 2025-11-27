import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';
import { SESSION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { ConfirmSessionDto } from '../dto/confirm-session.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SessionStatus } from '../../domain/enums';

import { Session } from '../../entities/session.entity';

@Injectable()
export class ConfirmSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(
    sessionId: number,
    tarotistaId: number,
    dto: ConfirmSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session || session.tarotistaId !== tarotistaId) {
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

    const updated = await this.sessionRepo.updateSession(session);

    // TODO: Enviar email de confirmación al usuario

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
