import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { DataSource, QueryRunner, EntityManager } from 'typeorm';
import { BookSessionUseCase } from './book-session.use-case';
import { ISessionRepository } from '../../domain/interfaces/session-repository.interface';
import { IServicePurchaseRepository } from '../../../holistic-services/domain/interfaces/service-purchase-repository.interface';
import { GetAvailableSlotsUseCase } from './get-available-slots.use-case';
import { BookSessionDto } from '../dto/book-session.dto';
import { Session } from '../../entities/session.entity';
import { SessionStatus, SessionType, PaymentStatus } from '../../domain/enums';
import { ServicePurchase } from '../../../holistic-services/entities/service-purchase.entity';
import { PurchaseStatus } from '../../../holistic-services/domain/enums/purchase-status.enum';

const HOLISTIC_SESSION_TYPES = [
  SessionType.FAMILY_TREE,
  SessionType.ENERGY_CLEANING,
  SessionType.HEBREW_PENDULUM,
];

describe('BookSessionUseCase', () => {
  let useCase: BookSessionUseCase;
  let mockSessionRepo: jest.Mocked<ISessionRepository>;
  let mockServicePurchaseRepo: jest.Mocked<IServicePurchaseRepository>;
  let mockGetAvailableSlotsUseCase: jest.Mocked<GetAvailableSlotsUseCase>;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockQueryRunner: jest.Mocked<QueryRunner>;
  let mockManager: jest.Mocked<EntityManager>;

  const futureDate = new Date();
  futureDate.setDate(futureDate.getDate() + 1);
  const futureDateStr = futureDate.toISOString().split('T')[0];

  const baseDto: BookSessionDto = {
    tarotistaId: 10,
    sessionDate: futureDateStr,
    sessionTime: '10:00',
    durationMinutes: 60,
    sessionType: SessionType.TAROT_READING,
  };

  const mockSession = {
    id: 1,
    tarotistaId: 10,
    userId: 1,
    sessionDate: futureDateStr,
    sessionTime: '10:00',
    durationMinutes: 60,
    sessionType: SessionType.TAROT_READING,
    status: SessionStatus.PENDING,
    priceUsd: 50,
    paymentStatus: PaymentStatus.PENDING,
    googleMeetLink: 'https://meet.google.com/test-link',
    userEmail: 'user@test.com',
    userNotes: null,
    tarotistNotes: null,
    cancelledAt: null,
    cancellationReason: null,
    confirmedAt: null,
    completedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as Session;

  const mockPurchase: ServicePurchase = {
    id: 5,
    userId: 1,
    holisticServiceId: 3,
    sessionId: null,
    paymentStatus: PurchaseStatus.PAID,
    amountArs: 5000,
    paymentReference: null,
    paidAt: new Date(),
    approvedByAdminId: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as ServicePurchase;

  beforeEach(() => {
    mockManager = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
      manager: mockManager,
    } as unknown as jest.Mocked<QueryRunner>;

    mockDataSource = {
      createQueryRunner: jest.fn().mockReturnValue(mockQueryRunner),
    } as unknown as jest.Mocked<DataSource>;

    mockSessionRepo = {
      findPendingSessionByUserAndTarotist: jest.fn(),
      createSession: jest.fn(),
      findSessionById: jest.fn(),
      findSessionsByUser: jest.fn(),
      findSessionsByTarotist: jest.fn(),
      findSessionsByTarotistAndDateRange: jest.fn(),
      findConflictingSession: jest.fn(),
      updateSession: jest.fn(),
    } as jest.Mocked<ISessionRepository>;

    mockServicePurchaseRepo = {
      save: jest.fn(),
      findById: jest.fn(),
      findByUserId: jest.fn(),
      findByUserIdWithService: jest.fn(),
      findPendingByUserAndService: jest.fn(),
      findPendingPayments: jest.fn(),
      findByIdWithRelations: jest.fn(),
      updateStatus: jest.fn(),
      findPaidUnassignedByUserAndSessionType: jest.fn(),
      findByMercadoPagoPaymentId: jest.fn(),
      findByPreferenceId: jest.fn(),
    } as jest.Mocked<IServicePurchaseRepository>;

    mockGetAvailableSlotsUseCase = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<GetAvailableSlotsUseCase>;

    useCase = new BookSessionUseCase(
      mockSessionRepo,
      mockServicePurchaseRepo,
      mockGetAvailableSlotsUseCase,
      mockDataSource,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute - standard (non-holistic) session', () => {
    beforeEach(() => {
      mockSessionRepo.findPendingSessionByUserAndTarotist.mockResolvedValue(
        null,
      );
      mockGetAvailableSlotsUseCase.execute.mockResolvedValue([
        {
          date: futureDateStr,
          time: '10:00',
          available: true,
          durationMinutes: 60,
        },
      ]);
      (mockManager.findOne as jest.Mock).mockResolvedValue(null);
      (mockManager.create as jest.Mock).mockReturnValue(mockSession);
      (mockManager.save as jest.Mock).mockResolvedValue(mockSession);
    });

    it('should book a tarot reading session with Google Meet link', async () => {
      const result = await useCase.execute(1, 'user@test.com', {
        ...baseDto,
        sessionType: SessionType.TAROT_READING,
      });

      expect(result.googleMeetLink).toBeTruthy();
      expect(result.googleMeetLink).toMatch(/^https:\/\/meet\.google\.com\//);
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it('should book a consultation session with Google Meet link', async () => {
      const consultationSession = {
        ...mockSession,
        sessionType: SessionType.CONSULTATION,
        googleMeetLink: 'https://meet.google.com/consult',
      } as unknown as Session;
      (mockManager.create as jest.Mock).mockReturnValue(consultationSession);
      (mockManager.save as jest.Mock).mockResolvedValue(consultationSession);

      const result = await useCase.execute(1, 'user@test.com', {
        ...baseDto,
        sessionType: SessionType.CONSULTATION,
      });

      expect(result.googleMeetLink).toBeTruthy();
    });

    it('should throw ConflictException when session is less than 2 hours away', async () => {
      const now = new Date();
      const soonDate = now.toISOString().split('T')[0];
      const soonTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      await expect(
        useCase.execute(1, 'user@test.com', {
          ...baseDto,
          sessionDate: soonDate,
          sessionTime: soonTime,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when user has pending session with tarotist', async () => {
      mockSessionRepo.findPendingSessionByUserAndTarotist.mockResolvedValue(
        mockSession,
      );

      await expect(
        useCase.execute(1, 'user@test.com', baseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when slot is not available', async () => {
      mockGetAvailableSlotsUseCase.execute.mockResolvedValue([
        {
          date: futureDateStr,
          time: '10:00',
          available: false,
          durationMinutes: 60,
        },
      ]);

      await expect(
        useCase.execute(1, 'user@test.com', baseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should throw ConflictException when slot is already booked (double-booking)', async () => {
      (mockManager.findOne as jest.Mock).mockResolvedValue(mockSession);

      await expect(
        useCase.execute(1, 'user@test.com', baseDto),
      ).rejects.toThrow(ConflictException);
    });

    it('should rollback transaction on error', async () => {
      (mockManager.save as jest.Mock).mockRejectedValue(new Error('DB error'));

      await expect(
        useCase.execute(1, 'user@test.com', baseDto),
      ).rejects.toThrow('DB error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe('execute - holistic sessions', () => {
    it.each(HOLISTIC_SESSION_TYPES)(
      'should throw NotFoundException for %s when no paid purchase exists',
      async (sessionType) => {
        mockSessionRepo.findPendingSessionByUserAndTarotist.mockResolvedValue(
          null,
        );
        mockServicePurchaseRepo.findPaidUnassignedByUserAndSessionType.mockResolvedValue(
          null,
        );

        await expect(
          useCase.execute(1, 'user@test.com', { ...baseDto, sessionType }),
        ).rejects.toThrow(NotFoundException);
      },
    );

    it.each(HOLISTIC_SESSION_TYPES)(
      'should book %s session without Google Meet link when paid purchase exists',
      async (sessionType) => {
        const holisticSession = {
          ...mockSession,
          sessionType,
          googleMeetLink: '',
        } as unknown as Session;

        mockSessionRepo.findPendingSessionByUserAndTarotist.mockResolvedValue(
          null,
        );
        mockServicePurchaseRepo.findPaidUnassignedByUserAndSessionType
          .mockResolvedValueOnce(mockPurchase)
          .mockResolvedValueOnce(mockPurchase);
        mockGetAvailableSlotsUseCase.execute.mockResolvedValue([
          {
            date: futureDateStr,
            time: '10:00',
            available: true,
            durationMinutes: 60,
          },
        ]);
        (mockManager.findOne as jest.Mock).mockResolvedValue(null);
        (mockManager.create as jest.Mock).mockReturnValue(holisticSession);
        (mockManager.save as jest.Mock).mockResolvedValue(holisticSession);
        mockServicePurchaseRepo.updateStatus.mockResolvedValue({
          ...mockPurchase,
          sessionId: holisticSession.id,
        } as ServicePurchase);

        const result = await useCase.execute(1, 'user@test.com', {
          ...baseDto,
          sessionType,
        });

        expect(result.googleMeetLink).toBeFalsy();
        expect(
          mockServicePurchaseRepo.findPaidUnassignedByUserAndSessionType,
        ).toHaveBeenCalledWith(1, sessionType);
        expect(mockServicePurchaseRepo.updateStatus).toHaveBeenCalledWith(
          mockPurchase.id,
          PurchaseStatus.PAID,
          { sessionId: holisticSession.id },
        );
        expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      },
    );

    it('should rollback transaction and re-throw on holistic session save error', async () => {
      mockSessionRepo.findPendingSessionByUserAndTarotist.mockResolvedValue(
        null,
      );
      mockServicePurchaseRepo.findPaidUnassignedByUserAndSessionType.mockResolvedValue(
        mockPurchase,
      );
      mockGetAvailableSlotsUseCase.execute.mockResolvedValue([
        {
          date: futureDateStr,
          time: '10:00',
          available: true,
          durationMinutes: 60,
        },
      ]);
      (mockManager.findOne as jest.Mock).mockResolvedValue(null);
      (mockManager.create as jest.Mock).mockReturnValue({
        ...mockSession,
        sessionType: SessionType.FAMILY_TREE,
        googleMeetLink: '',
      } as unknown as Session);
      (mockManager.save as jest.Mock).mockRejectedValue(
        new Error('DB save error'),
      );

      await expect(
        useCase.execute(1, 'user@test.com', {
          ...baseDto,
          sessionType: SessionType.FAMILY_TREE,
        }),
      ).rejects.toThrow('DB save error');

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });
});
