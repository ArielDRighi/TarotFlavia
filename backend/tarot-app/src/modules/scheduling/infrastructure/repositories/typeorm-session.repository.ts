import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Session } from '../../entities/session.entity';
import { SessionStatus } from '../../domain/enums/session-status.enum';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';

@Injectable()
export class TypeOrmSessionRepository implements ISessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly repository: Repository<Session>,
  ) {}

  async createSession(sessionData: Partial<Session>): Promise<Session> {
    const session = this.repository.create(sessionData);
    return this.repository.save(session);
  }

  async findSessionById(sessionId: number): Promise<Session | null> {
    return this.repository.findOne({
      where: { id: sessionId },
    });
  }

  async findSessionsByUser(
    userId: number,
    status?: SessionStatus,
  ): Promise<Session[]> {
    const where: {
      userId: number;
      status?: SessionStatus;
    } = { userId };
    if (status) {
      where.status = status;
    }

    return this.repository.find({
      where,
      order: { sessionDate: 'DESC', sessionTime: 'DESC' },
    });
  }

  async findSessionsByTarotist(
    tarotistaId: number,
    date?: string,
  ): Promise<Session[]> {
    const where: {
      tarotistaId: number;
      sessionDate?: string;
    } = { tarotistaId };
    if (date) {
      where.sessionDate = date;
    }

    return this.repository.find({
      where,
      order: { sessionDate: 'ASC', sessionTime: 'ASC' },
    });
  }

  async findSessionsByTarotistAndDateRange(
    tarotistaId: number,
    startDate: string,
    endDate: string,
    statuses: SessionStatus[],
  ): Promise<Session[]> {
    return this.repository
      .createQueryBuilder('session')
      .where('session.tarotistaId = :tarotistaId', { tarotistaId })
      .andWhere('session.sessionDate >= :startDate', { startDate })
      .andWhere('session.sessionDate <= :endDate', { endDate })
      .andWhere('session.status IN (:...statuses)', { statuses })
      .getMany();
  }

  async findPendingSessionByUserAndTarotist(
    userId: number,
    tarotistaId: number,
  ): Promise<Session | null> {
    return this.repository.findOne({
      where: {
        userId,
        tarotistaId,
        status: SessionStatus.PENDING,
      },
    });
  }

  async findConflictingSession(
    tarotistaId: number,
    sessionDate: string,
    sessionTime: string,
    statuses: SessionStatus[],
  ): Promise<Session | null> {
    return this.repository.findOne({
      where: {
        tarotistaId,
        sessionDate,
        sessionTime,
        status: In(statuses),
      },
    });
  }

  async updateSession(session: Session): Promise<Session> {
    return this.repository.save(session);
  }
}
