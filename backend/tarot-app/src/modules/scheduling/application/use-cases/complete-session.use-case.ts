import {
  Injectable,
  Inject,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';
import { SESSION_REPOSITORY } from '../../domain/interfaces/repository.tokens';
import { CompleteSessionDto } from '../dto/complete-session.dto';
import { SessionResponseDto } from '../dto/session-response.dto';
import { SessionStatus } from '../../domain/enums';

@Injectable()
export class CompleteSessionUseCase {
  constructor(
    @Inject(SESSION_REPOSITORY)
    private readonly sessionRepo: ISessionRepository,
  ) {}

  async execute(
    sessionId: number,
    tarotistaId: number,
    dto: CompleteSessionDto,
  ): Promise<SessionResponseDto> {
    const session = await this.sessionRepo.findSessionById(sessionId);

    if (!session || session.tarotistaId !== tarotistaId) {
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

    const updated = await this.sessionRepo.updateSession(session);

    return this.mapToResponseDto(updated);
  }

  private mapToResponseDto(session: any): SessionResponseDto {
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
