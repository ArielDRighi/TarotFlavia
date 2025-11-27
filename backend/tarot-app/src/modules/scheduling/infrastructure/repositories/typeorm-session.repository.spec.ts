import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TypeOrmSessionRepository } from './typeorm-session.repository';
import { Session } from '../../entities/session.entity';
import { SessionStatus, SessionType, PaymentStatus } from '../../domain/enums';

describe('TypeOrmSessionRepository', () => {
  let repository: TypeOrmSessionRepository;
  let typeOrmRepository: jest.Mocked<Repository<Session>>;

  const mockSession: Session = {
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
  } as Session;

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  };

  beforeEach(async () => {
    const mockTypeOrmRepository = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => mockQueryBuilder),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmSessionRepository,
        {
          provide: getRepositoryToken(Session),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmSessionRepository>(TypeOrmSessionRepository);
    typeOrmRepository = module.get(getRepositoryToken(Session));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create and save a new session', async () => {
      const sessionData: Partial<Session> = {
        tarotistaId: 1,
        userId: 1,
        sessionDate: '2025-01-15',
        sessionTime: '10:00',
        durationMinutes: 60,
      };

      typeOrmRepository.create.mockReturnValue(mockSession);
      typeOrmRepository.save.mockResolvedValue(mockSession);

      const result = await repository.createSession(sessionData);

      expect(typeOrmRepository.create).toHaveBeenCalledWith(sessionData);
      expect(typeOrmRepository.save).toHaveBeenCalledWith(mockSession);
      expect(result).toEqual(mockSession);
    });
  });

  describe('findSessionById', () => {
    it('should find a session by id', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockSession);

      const result = await repository.findSessionById(1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null when session not found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findSessionById(999);

      expect(result).toBeNull();
    });
  });

  describe('findSessionsByUser', () => {
    it('should find sessions by user id without status filter', async () => {
      typeOrmRepository.find.mockResolvedValue([mockSession]);

      const result = await repository.findSessionsByUser(1);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        order: { sessionDate: 'DESC', sessionTime: 'DESC' },
      });
      expect(result).toEqual([mockSession]);
    });

    it('should find sessions by user id with status filter', async () => {
      typeOrmRepository.find.mockResolvedValue([mockSession]);

      const result = await repository.findSessionsByUser(
        1,
        SessionStatus.PENDING,
      );

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { userId: 1, status: SessionStatus.PENDING },
        order: { sessionDate: 'DESC', sessionTime: 'DESC' },
      });
      expect(result).toEqual([mockSession]);
    });
  });

  describe('findSessionsByTarotist', () => {
    it('should find sessions by tarotist id without date filter', async () => {
      typeOrmRepository.find.mockResolvedValue([mockSession]);

      const result = await repository.findSessionsByTarotist(1);

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { tarotistaId: 1 },
        order: { sessionDate: 'ASC', sessionTime: 'ASC' },
      });
      expect(result).toEqual([mockSession]);
    });

    it('should find sessions by tarotist id with date filter', async () => {
      typeOrmRepository.find.mockResolvedValue([mockSession]);

      const result = await repository.findSessionsByTarotist(1, '2025-01-15');

      expect(typeOrmRepository.find).toHaveBeenCalledWith({
        where: { tarotistaId: 1, sessionDate: '2025-01-15' },
        order: { sessionDate: 'ASC', sessionTime: 'ASC' },
      });
      expect(result).toEqual([mockSession]);
    });
  });

  describe('findSessionsByTarotistAndDateRange', () => {
    it('should find sessions by tarotist and date range with statuses', async () => {
      const statuses = [SessionStatus.PENDING, SessionStatus.CONFIRMED];
      mockQueryBuilder.getMany.mockResolvedValue([mockSession]);

      const result = await repository.findSessionsByTarotistAndDateRange(
        1,
        '2025-01-01',
        '2025-01-31',
        statuses,
      );

      expect(typeOrmRepository.createQueryBuilder).toHaveBeenCalledWith(
        'session',
      );
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'session.tarotistaId = :tarotistaId',
        { tarotistaId: 1 },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'session.sessionDate >= :startDate',
        { startDate: '2025-01-01' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'session.sessionDate <= :endDate',
        { endDate: '2025-01-31' },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'session.status IN (:...statuses)',
        { statuses },
      );
      expect(mockQueryBuilder.getMany).toHaveBeenCalled();
      expect(result).toEqual([mockSession]);
    });
  });

  describe('findPendingSessionByUserAndTarotist', () => {
    it('should find pending session by user and tarotist', async () => {
      typeOrmRepository.findOne.mockResolvedValue(mockSession);

      const result = await repository.findPendingSessionByUserAndTarotist(1, 1);

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          userId: 1,
          tarotistaId: 1,
          status: SessionStatus.PENDING,
        },
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null when no pending session found', async () => {
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findPendingSessionByUserAndTarotist(1, 1);

      expect(result).toBeNull();
    });
  });

  describe('findConflictingSession', () => {
    it('should find conflicting session', async () => {
      const statuses = [SessionStatus.PENDING, SessionStatus.CONFIRMED];
      typeOrmRepository.findOne.mockResolvedValue(mockSession);

      const result = await repository.findConflictingSession(
        1,
        '2025-01-15',
        '10:00',
        statuses,
      );

      expect(typeOrmRepository.findOne).toHaveBeenCalledWith({
        where: {
          tarotistaId: 1,
          sessionDate: '2025-01-15',
          sessionTime: '10:00',
          status: expect.anything(), // In matcher
        },
      });
      expect(result).toEqual(mockSession);
    });

    it('should return null when no conflicting session found', async () => {
      const statuses = [SessionStatus.PENDING, SessionStatus.CONFIRMED];
      typeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findConflictingSession(
        1,
        '2025-01-15',
        '10:00',
        statuses,
      );

      expect(result).toBeNull();
    });
  });

  describe('updateSession', () => {
    it('should update and save a session', async () => {
      const updatedSession = {
        ...mockSession,
        status: SessionStatus.CONFIRMED,
      };
      typeOrmRepository.save.mockResolvedValue(updatedSession);

      const result = await repository.updateSession(updatedSession);

      expect(typeOrmRepository.save).toHaveBeenCalledWith(updatedSession);
      expect(result).toEqual(updatedSession);
    });
  });
});
