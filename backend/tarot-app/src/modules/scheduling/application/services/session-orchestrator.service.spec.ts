import { Test, TestingModule } from '@nestjs/testing';
import { SessionOrchestratorService } from './session-orchestrator.service';
import { BookSessionUseCase } from '../use-cases/book-session.use-case';
import { CancelSessionUseCase } from '../use-cases/cancel-session.use-case';
import { ConfirmSessionUseCase } from '../use-cases/confirm-session.use-case';
import { CompleteSessionUseCase } from '../use-cases/complete-session.use-case';
import { SessionStatus, SessionType, PaymentStatus } from '../../domain/enums';
import { SessionResponseDto } from '../dto/session-response.dto';

describe('SessionOrchestratorService', () => {
  let service: SessionOrchestratorService;
  let bookSessionUseCase: jest.Mocked<BookSessionUseCase>;
  let cancelSessionUseCase: jest.Mocked<CancelSessionUseCase>;
  let confirmSessionUseCase: jest.Mocked<ConfirmSessionUseCase>;
  let completeSessionUseCase: jest.Mocked<CompleteSessionUseCase>;

  const mockSessionResponse: SessionResponseDto = {
    id: 1,
    tarotistaId: 1,
    userId: 1,
    sessionDate: '2025-01-15',
    sessionTime: '10:00',
    durationMinutes: 60,
    sessionType: SessionType.TAROT_READING,
    status: SessionStatus.PENDING,
    priceUsd: 50.0,
    paymentStatus: PaymentStatus.PENDING,
    googleMeetLink: 'https://meet.google.com/test',
    userEmail: 'test@example.com',
    userNotes: 'Test session',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockBookSessionUseCase = {
      execute: jest.fn(),
    };
    const mockCancelSessionUseCase = {
      execute: jest.fn(),
    };
    const mockConfirmSessionUseCase = {
      execute: jest.fn(),
    };
    const mockCompleteSessionUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionOrchestratorService,
        {
          provide: BookSessionUseCase,
          useValue: mockBookSessionUseCase,
        },
        {
          provide: CancelSessionUseCase,
          useValue: mockCancelSessionUseCase,
        },
        {
          provide: ConfirmSessionUseCase,
          useValue: mockConfirmSessionUseCase,
        },
        {
          provide: CompleteSessionUseCase,
          useValue: mockCompleteSessionUseCase,
        },
      ],
    }).compile();

    service = module.get<SessionOrchestratorService>(
      SessionOrchestratorService,
    );
    bookSessionUseCase = module.get(BookSessionUseCase);
    cancelSessionUseCase = module.get(CancelSessionUseCase);
    confirmSessionUseCase = module.get(ConfirmSessionUseCase);
    completeSessionUseCase = module.get(CompleteSessionUseCase);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bookSession', () => {
    it('should call book session use case with correct parameters', async () => {
      const dto = {
        tarotistaId: 1,
        sessionDate: '2025-01-15',
        sessionTime: '10:00',
        durationMinutes: 60,
        sessionType: SessionType.TAROT_READING,
        userNotes: 'Test session',
      };
      bookSessionUseCase.execute.mockResolvedValue(mockSessionResponse);

      const result = await service.bookSession(1, 'test@example.com', dto);

      expect(bookSessionUseCase.execute).toHaveBeenCalledWith(
        1,
        'test@example.com',
        dto,
      );
      expect(result).toEqual(mockSessionResponse);
    });

    it('should propagate errors from use case', async () => {
      const dto = {
        tarotistaId: 1,
        sessionDate: '2025-01-15',
        sessionTime: '10:00',
        durationMinutes: 60,
        sessionType: SessionType.TAROT_READING,
      };
      const error = new Error('Booking failed');
      bookSessionUseCase.execute.mockRejectedValue(error);

      await expect(
        service.bookSession(1, 'test@example.com', dto),
      ).rejects.toThrow('Booking failed');
    });
  });

  describe('cancelSession', () => {
    it('should call cancel session use case with correct parameters', async () => {
      const dto = {
        reason: 'User requested',
      };
      const cancelledSession = {
        ...mockSessionResponse,
        status: SessionStatus.CANCELLED_BY_USER,
      };
      cancelSessionUseCase.execute.mockResolvedValue(cancelledSession);

      const result = await service.cancelSession(1, 1, dto);

      expect(cancelSessionUseCase.execute).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual(cancelledSession);
      expect(result.status).toBe(SessionStatus.CANCELLED_BY_USER);
    });

    it('should propagate errors from use case', async () => {
      const dto = { reason: 'Test' };
      const error = new Error('Cancellation failed');
      cancelSessionUseCase.execute.mockRejectedValue(error);

      await expect(service.cancelSession(1, 1, dto)).rejects.toThrow(
        'Cancellation failed',
      );
    });
  });

  describe('confirmSession', () => {
    it('should call confirm session use case with correct parameters', async () => {
      const dto = {
        notes: 'Confirmed successfully',
      };
      const confirmedSession = {
        ...mockSessionResponse,
        status: SessionStatus.CONFIRMED,
      };
      confirmSessionUseCase.execute.mockResolvedValue(confirmedSession);

      const result = await service.confirmSession(1, 1, dto);

      expect(confirmSessionUseCase.execute).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual(confirmedSession);
      expect(result.status).toBe(SessionStatus.CONFIRMED);
    });

    it('should propagate errors from use case', async () => {
      const dto = { notes: 'Test confirmation' };
      const error = new Error('Confirmation failed');
      confirmSessionUseCase.execute.mockRejectedValue(error);

      await expect(service.confirmSession(1, 1, dto)).rejects.toThrow(
        'Confirmation failed',
      );
    });
  });

  describe('completeSession', () => {
    it('should call complete session use case with correct parameters', async () => {
      const dto = {
        tarotistNotes: 'Session completed successfully',
      };
      const completedSession = {
        ...mockSessionResponse,
        status: SessionStatus.COMPLETED,
      };
      completeSessionUseCase.execute.mockResolvedValue(completedSession);

      const result = await service.completeSession(1, 1, dto);

      expect(completeSessionUseCase.execute).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual(completedSession);
      expect(result.status).toBe(SessionStatus.COMPLETED);
    });

    it('should propagate errors from use case', async () => {
      const dto = { tarotistNotes: 'Test' };
      const error = new Error('Completion failed');
      completeSessionUseCase.execute.mockRejectedValue(error);

      await expect(service.completeSession(1, 1, dto)).rejects.toThrow(
        'Completion failed',
      );
    });
  });
});
