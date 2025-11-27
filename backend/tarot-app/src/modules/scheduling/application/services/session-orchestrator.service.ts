import { Injectable } from '@nestjs/common';
import { BookSessionUseCase } from '../use-cases/book-session.use-case';
import { CancelSessionUseCase } from '../use-cases/cancel-session.use-case';
import { ConfirmSessionUseCase } from '../use-cases/confirm-session.use-case';
import { CompleteSessionUseCase } from '../use-cases/complete-session.use-case';
import { BookSessionDto } from '../dto/book-session.dto';
import { CancelSessionDto } from '../dto/cancel-session.dto';
import { ConfirmSessionDto } from '../dto/confirm-session.dto';
import { CompleteSessionDto } from '../dto/complete-session.dto';
import { SessionResponseDto } from '../dto/session-response.dto';

@Injectable()
export class SessionOrchestratorService {
  constructor(
    private readonly bookSessionUseCase: BookSessionUseCase,
    private readonly cancelSessionUseCase: CancelSessionUseCase,
    private readonly confirmSessionUseCase: ConfirmSessionUseCase,
    private readonly completeSessionUseCase: CompleteSessionUseCase,
  ) {}

  async bookSession(
    userId: number,
    userEmail: string,
    dto: BookSessionDto,
  ): Promise<SessionResponseDto> {
    return this.bookSessionUseCase.execute(userId, userEmail, dto);
  }

  async cancelSession(
    sessionId: number,
    userId: number,
    dto: CancelSessionDto,
  ): Promise<SessionResponseDto> {
    return this.cancelSessionUseCase.execute(sessionId, userId, dto);
  }

  async confirmSession(
    sessionId: number,
    tarotistaId: number,
    dto: ConfirmSessionDto,
  ): Promise<SessionResponseDto> {
    return this.confirmSessionUseCase.execute(sessionId, tarotistaId, dto);
  }

  async completeSession(
    sessionId: number,
    tarotistaId: number,
    dto: CompleteSessionDto,
  ): Promise<SessionResponseDto> {
    return this.completeSessionUseCase.execute(sessionId, tarotistaId, dto);
  }
}
