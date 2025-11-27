import { Session } from '../../entities/session.entity';
import { BookSessionDto } from '../../application/dto/book-session.dto';
import { SessionStatus } from '../enums/session-status.enum';

export interface ISessionRepository {
  createSession(session: Partial<Session>): Promise<Session>;

  findSessionById(sessionId: number): Promise<Session | null>;

  findSessionsByUser(
    userId: number,
    status?: SessionStatus,
  ): Promise<Session[]>;

  findSessionsByTarotist(
    tarotistaId: number,
    date?: string,
  ): Promise<Session[]>;

  findSessionsByTarotistAndDateRange(
    tarotistaId: number,
    startDate: string,
    endDate: string,
    statuses: SessionStatus[],
  ): Promise<Session[]>;

  findPendingSessionByUserAndTarotist(
    userId: number,
    tarotistaId: number,
  ): Promise<Session | null>;

  findConflictingSession(
    tarotistaId: number,
    sessionDate: string,
    sessionTime: string,
    statuses: SessionStatus[],
  ): Promise<Session | null>;

  updateSession(session: Session): Promise<Session>;
}
