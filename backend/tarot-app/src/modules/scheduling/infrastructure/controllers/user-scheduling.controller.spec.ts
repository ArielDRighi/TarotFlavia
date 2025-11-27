import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UserSchedulingController } from './user-scheduling.controller';
import { SessionService, AvailabilityService } from '../../services';
import { SessionStatus, SessionType, PaymentStatus } from '../../domain/enums';
import { SessionResponseDto, AvailableSlotDto } from '../../application/dto';

describe('UserSchedulingController', () => {
  let controller: UserSchedulingController;
  let sessionService: jest.Mocked<SessionService>;
  let availabilityService: jest.Mocked<AvailabilityService>;

  const mockAvailableSlots: AvailableSlotDto[] = [
    {
      date: '2025-01-15',
      time: '10:00',
      durationMinutes: 60,
      available: true,
    },
  ];

  const mockSession: SessionResponseDto = {
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

  const mockRequest = {
    user: {
      id: 1,
      email: 'test@example.com',
    },
  } as any;

  beforeEach(async () => {
    const mockSessionService = {
      bookSession: jest.fn(),
      getUserSessions: jest.fn(),
      cancelSession: jest.fn(),
    };

    const mockAvailabilityService = {
      getAvailableSlots: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserSchedulingController],
      providers: [
        {
          provide: SessionService,
          useValue: mockSessionService,
        },
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    }).compile();

    controller = module.get<UserSchedulingController>(UserSchedulingController);
    sessionService = module.get(SessionService);
    availabilityService = module.get(AvailabilityService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getAvailableSlots', () => {
    it('should return available slots', async () => {
      availabilityService.getAvailableSlots.mockResolvedValue(
        mockAvailableSlots,
      );

      const result = await controller.getAvailableSlots(
        1,
        '2025-01-15',
        '2025-01-15',
        60,
      );

      expect(availabilityService.getAvailableSlots).toHaveBeenCalledWith(
        1,
        '2025-01-15',
        '2025-01-15',
        60,
      );
      expect(result).toEqual(mockAvailableSlots);
    });

    it('should return empty array when no slots available', async () => {
      availabilityService.getAvailableSlots.mockResolvedValue([]);

      const result = await controller.getAvailableSlots(
        1,
        '2025-01-15',
        '2025-01-15',
        60,
      );

      expect(result).toEqual([]);
    });
  });

  describe('bookSession', () => {
    it('should book a session successfully', async () => {
      const dto = {
        tarotistaId: 1,
        sessionDate: '2025-01-15',
        sessionTime: '10:00',
        durationMinutes: 60,
        sessionType: SessionType.TAROT_READING,
        userNotes: 'Test session',
      };
      sessionService.bookSession.mockResolvedValue(mockSession);

      const result = await controller.bookSession(mockRequest, dto);

      expect(sessionService.bookSession).toHaveBeenCalledWith(
        1,
        'test@example.com',
        dto,
      );
      expect(result).toEqual(mockSession);
    });
  });

  describe('getUserSessions', () => {
    it('should return user sessions without filter', async () => {
      sessionService.getUserSessions.mockResolvedValue([mockSession]);

      const result = await controller.getUserSessions(mockRequest);

      expect(sessionService.getUserSessions).toHaveBeenCalledWith(1, undefined);
      expect(result).toEqual([mockSession]);
    });

    it('should return user sessions filtered by status', async () => {
      sessionService.getUserSessions.mockResolvedValue([mockSession]);

      const result = await controller.getUserSessions(
        mockRequest,
        SessionStatus.PENDING,
      );

      expect(sessionService.getUserSessions).toHaveBeenCalledWith(
        1,
        SessionStatus.PENDING,
      );
      expect(result).toEqual([mockSession]);
    });
  });

  describe('getSessionDetail', () => {
    it('should return session detail', async () => {
      sessionService.getUserSessions.mockResolvedValue([mockSession]);

      const result = await controller.getSessionDetail(mockRequest, 1);

      expect(sessionService.getUserSessions).toHaveBeenCalledWith(1);
      expect(result).toEqual(mockSession);
    });

    it('should throw NotFoundException when session not found', async () => {
      sessionService.getUserSessions.mockResolvedValue([]);

      await expect(
        controller.getSessionDetail(mockRequest, 999),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelSession', () => {
    it('should cancel a session successfully', async () => {
      const dto = {
        reason: 'User requested',
      };
      const cancelledSession = {
        ...mockSession,
        status: SessionStatus.CANCELLED_BY_USER,
      };
      sessionService.cancelSession.mockResolvedValue(cancelledSession);

      const result = await controller.cancelSession(mockRequest, 1, dto);

      expect(sessionService.cancelSession).toHaveBeenCalledWith(1, 1, dto);
      expect(result).toEqual(cancelledSession);
      expect(result.status).toBe(SessionStatus.CANCELLED_BY_USER);
    });
  });
});
