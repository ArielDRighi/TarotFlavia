import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { PendulumHistoryService } from './pendulum-history.service';
import { PendulumQuery } from '../../entities/pendulum-query.entity';
import { PendulumResponse } from '../../domain/enums/pendulum.enums';

describe('PendulumHistoryService', () => {
  let service: PendulumHistoryService;
  let repository: Repository<PendulumQuery>;

  const mockQueries: Partial<PendulumQuery>[] = [
    {
      id: 1,
      userId: 1,
      question: '¿Debo aceptar este trabajo?',
      response: PendulumResponse.YES,
      interpretation: 'El universo afirma tu camino.',
      lunarPhase: 'Luna Llena',
      createdAt: new Date('2026-02-01'),
    },
    {
      id: 2,
      userId: 1,
      question: null,
      response: PendulumResponse.NO,
      interpretation: 'El universo sugiere pausa.',
      lunarPhase: 'Luna Nueva',
      createdAt: new Date('2026-02-02'),
    },
    {
      id: 3,
      userId: 1,
      question: '¿Es el momento?',
      response: PendulumResponse.MAYBE,
      interpretation: 'Las energías están en equilibrio.',
      lunarPhase: 'Cuarto Creciente',
      createdAt: new Date('2026-02-03'),
    },
    {
      id: 4,
      userId: 2,
      question: 'Otro usuario',
      response: PendulumResponse.YES,
      interpretation: 'Test',
      lunarPhase: 'Luna Llena',
      createdAt: new Date('2026-02-03'),
    },
  ];

  const createMockQueryBuilder = (results: any[] = []) => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue(results),
      getRawMany: jest.fn().mockResolvedValue(results),
    };
    return mockQueryBuilder as any as SelectQueryBuilder<PendulumQuery>;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PendulumHistoryService,
        {
          provide: getRepositoryToken(PendulumQuery),
          useValue: {
            createQueryBuilder: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<PendulumHistoryService>(PendulumHistoryService);
    repository = module.get<Repository<PendulumQuery>>(
      getRepositoryToken(PendulumQuery),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getUserHistory', () => {
    it('should return user history ordered by createdAt DESC', async () => {
      const userQueries = mockQueries.filter((q) => q.userId === 1);
      const mockQB = createMockQueryBuilder(userQueries);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserHistory(1);

      expect(result).toEqual(userQueries);
      expect(mockQB.where).toHaveBeenCalledWith('query.userId = :userId', {
        userId: 1,
      });
      expect(mockQB.orderBy).toHaveBeenCalledWith('query.createdAt', 'DESC');
      expect(mockQB.take).toHaveBeenCalledWith(20);
    });

    it('should respect custom limit parameter', async () => {
      const mockQB = createMockQueryBuilder([]);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      await service.getUserHistory(1, 50);

      expect(mockQB.take).toHaveBeenCalledWith(50);
    });

    it('should use default limit of 20 when not specified', async () => {
      const mockQB = createMockQueryBuilder([]);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      await service.getUserHistory(1);

      expect(mockQB.take).toHaveBeenCalledWith(20);
    });

    it('should filter by response type when provided', async () => {
      const yesQueries = mockQueries.filter(
        (q) => q.userId === 1 && q.response === PendulumResponse.YES,
      );
      const mockQB = createMockQueryBuilder(yesQueries);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserHistory(1, 20, PendulumResponse.YES);

      expect(result).toEqual(yesQueries);
      expect(mockQB.andWhere).toHaveBeenCalledWith(
        'query.response = :response',
        {
          response: PendulumResponse.YES,
        },
      );
    });

    it('should not add response filter when not provided', async () => {
      const mockQB = createMockQueryBuilder([]);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      await service.getUserHistory(1);

      expect(mockQB.andWhere).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no history', async () => {
      const mockQB = createMockQueryBuilder([]);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserHistory(999);

      expect(result).toEqual([]);
    });
  });

  describe('getUserStats', () => {
    it('should calculate correct stats for user', async () => {
      const statsData = [
        { response: 'yes', count: '5' },
        { response: 'no', count: '3' },
        { response: 'maybe', count: '2' },
      ];
      const mockQB = createMockQueryBuilder(statsData);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserStats(1);

      expect(result).toEqual({
        total: 10,
        yesCount: 5,
        noCount: 3,
        maybeCount: 2,
      });
      expect(mockQB.select).toHaveBeenCalledWith('query.response', 'response');
      expect(mockQB.addSelect).toHaveBeenCalledWith('COUNT(*)', 'count');
      expect(mockQB.where).toHaveBeenCalledWith('query.userId = :userId', {
        userId: 1,
      });
      expect(mockQB.groupBy).toHaveBeenCalledWith('query.response');
    });

    it('should return zeros when user has no history', async () => {
      const mockQB = createMockQueryBuilder([]);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserStats(999);

      expect(result).toEqual({
        total: 0,
        yesCount: 0,
        noCount: 0,
        maybeCount: 0,
      });
    });

    it('should handle missing response types in stats', async () => {
      const statsData = [{ response: 'yes', count: '10' }];
      const mockQB = createMockQueryBuilder(statsData);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserStats(1);

      expect(result).toEqual({
        total: 10,
        yesCount: 10,
        noCount: 0,
        maybeCount: 0,
      });
    });

    it('should parse count strings to numbers correctly', async () => {
      const statsData = [
        { response: 'yes', count: '100' },
        { response: 'no', count: '50' },
      ];
      const mockQB = createMockQueryBuilder(statsData);
      jest.spyOn(repository, 'createQueryBuilder').mockReturnValue(mockQB);

      const result = await service.getUserStats(1);

      expect(result.total).toBe(150);
      expect(result.yesCount).toBe(100);
      expect(result.noCount).toBe(50);
    });
  });

  describe('deleteQuery', () => {
    it('should delete query and return true when successful', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: {} });

      const result = await service.deleteQuery(1, 10);

      expect(result).toBe(true);
      expect(repository.delete).toHaveBeenCalledWith({ id: 10, userId: 1 });
    });

    it('should return false when query not found', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0, raw: {} });

      const result = await service.deleteQuery(1, 999);

      expect(result).toBe(false);
    });

    it('should return false when affected is undefined', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: undefined, raw: {} });

      const result = await service.deleteQuery(1, 10);

      expect(result).toBe(false);
    });

    it('should only delete queries belonging to the user', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 1, raw: {} });

      await service.deleteQuery(1, 10);

      expect(repository.delete).toHaveBeenCalledWith({ id: 10, userId: 1 });
    });

    it('should not delete queries from other users', async () => {
      jest
        .spyOn(repository, 'delete')
        .mockResolvedValue({ affected: 0, raw: {} });

      const result = await service.deleteQuery(1, 4); // Query 4 pertenece al userId 2

      expect(result).toBe(false);
      expect(repository.delete).toHaveBeenCalledWith({ id: 4, userId: 1 });
    });
  });
});
