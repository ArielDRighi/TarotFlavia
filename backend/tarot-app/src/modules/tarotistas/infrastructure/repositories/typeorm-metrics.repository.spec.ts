import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { TypeOrmMetricsRepository } from './typeorm-metrics.repository';
import { TarotistaRevenueMetrics } from '../../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../../entities/tarotista.entity';
import { TarotReading } from '../../../tarot/readings/entities/tarot-reading.entity';
import { Session } from '../../../scheduling/entities/session.entity';
import {
  MetricsQueryDto,
  PlatformMetricsQueryDto,
  MetricsPeriod,
} from '../../application/dto/metrics-query.dto';
import { SessionStatus } from '../../../scheduling/domain/enums';

type MockRepository<T extends ObjectLiteral> = jest.Mocked<
  Pick<Repository<T>, 'findOne' | 'find' | 'count' | 'create' | 'save'> & {
    createQueryBuilder: jest.Mock;
  }
>;

function createMockRepo<T extends ObjectLiteral>(): MockRepository<T> {
  return {
    findOne: jest.fn(),
    find: jest.fn(),
    count: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };
}

function buildQbChain(rawOneResult: unknown, rawManyResult: unknown[] = []) {
  const qb = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    distinct: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue(rawOneResult),
    getRawMany: jest.fn().mockResolvedValue(rawManyResult),
  };
  return qb;
}

describe('TypeOrmMetricsRepository', () => {
  let repository: TypeOrmMetricsRepository;
  let revenueRepo: MockRepository<TarotistaRevenueMetrics>;
  let tarotistaRepo: MockRepository<Tarotista>;
  let readingRepo: MockRepository<TarotReading>;
  let sessionRepo: MockRepository<Session>;

  const mockTarotista = {
    id: 1,
    nombrePublico: 'Flavia',
    ratingPromedio: 4.8,
    totalReviews: 50,
  } as Tarotista;

  beforeEach(async () => {
    revenueRepo = createMockRepo<TarotistaRevenueMetrics>();
    tarotistaRepo = createMockRepo<Tarotista>();
    readingRepo = createMockRepo<TarotReading>();
    sessionRepo = createMockRepo<Session>();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TypeOrmMetricsRepository,
        {
          provide: getRepositoryToken(TarotistaRevenueMetrics),
          useValue: revenueRepo,
        },
        {
          provide: getRepositoryToken(Tarotista),
          useValue: tarotistaRepo,
        },
        {
          provide: getRepositoryToken(TarotReading),
          useValue: readingRepo,
        },
        {
          provide: getRepositoryToken(Session),
          useValue: sessionRepo,
        },
      ],
    }).compile();

    repository = module.get<TypeOrmMetricsRepository>(TypeOrmMetricsRepository);
    jest.clearAllMocks();
  });

  describe('getTarotistaMetrics', () => {
    const dto: MetricsQueryDto = {
      tarotistaId: 1,
      period: MetricsPeriod.MONTH,
    };

    it('should return metrics with completedSessions for a tarotista', async () => {
      const revenueRaw = {
        totalReadings: '150',
        totalRevenueShare: '5250.00',
        totalPlatformFee: '2250.00',
        totalGrossRevenue: '7500.00',
      };

      tarotistaRepo.findOne.mockResolvedValue(mockTarotista);
      revenueRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(revenueRaw) as unknown as ReturnType<
          Repository<TarotistaRevenueMetrics>['createQueryBuilder']
        >,
      );
      sessionRepo.count.mockResolvedValue(12);

      const result = await repository.getTarotistaMetrics(dto);

      expect(result.completedSessions).toBe(12);
      expect(result.tarotistaId).toBe(1);
      expect(result.totalReadings).toBe(150);
    });

    it('should return completedSessions = 0 when no sessions in period', async () => {
      tarotistaRepo.findOne.mockResolvedValue(mockTarotista);
      revenueRepo.createQueryBuilder.mockReturnValue(
        buildQbChain({}) as unknown as ReturnType<
          Repository<TarotistaRevenueMetrics>['createQueryBuilder']
        >,
      );
      sessionRepo.count.mockResolvedValue(0);

      const result = await repository.getTarotistaMetrics(dto);

      expect(result.completedSessions).toBe(0);
    });

    it('should throw NotFoundException when tarotista does not exist', async () => {
      tarotistaRepo.findOne.mockResolvedValue(null);

      await expect(repository.getTarotistaMetrics(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should filter completedSessions by tarotista and period', async () => {
      tarotistaRepo.findOne.mockResolvedValue(mockTarotista);
      revenueRepo.createQueryBuilder.mockReturnValue(
        buildQbChain({}) as unknown as ReturnType<
          Repository<TarotistaRevenueMetrics>['createQueryBuilder']
        >,
      );
      sessionRepo.count.mockResolvedValue(5);

      await repository.getTarotistaMetrics(dto);

      expect(sessionRepo.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tarotistaId: 1,
            status: SessionStatus.COMPLETED,
          }),
        }),
      );
    });
  });

  describe('getPlatformMetrics', () => {
    const dto: PlatformMetricsQueryDto = {
      period: MetricsPeriod.MONTH,
    };

    it('should return platform metrics with global completedSessions', async () => {
      const totalMetricsRaw = {
        totalReadings: '1500',
        totalRevenueShare: '52500.00',
        totalPlatformFee: '22500.00',
        totalGrossRevenue: '75000.00',
      };

      revenueRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(totalMetricsRaw, [
          { tarotistaId: 1 },
          { tarotistaId: 2 },
        ]) as unknown as ReturnType<
          Repository<TarotistaRevenueMetrics>['createQueryBuilder']
        >,
      );
      readingRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(null, [{ userId: 1 }]) as unknown as ReturnType<
          Repository<TarotReading>['createQueryBuilder']
        >,
      );
      sessionRepo.count.mockResolvedValue(42);
      // Aggregated GROUP BY query for topTarotistas (returns empty - no tarotistas found)
      sessionRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(null, []) as unknown as ReturnType<
          Repository<Session>['createQueryBuilder']
        >,
      );
      tarotistaRepo.find.mockResolvedValue([]);

      const result = await repository.getPlatformMetrics(dto);

      expect(result.completedSessions).toBe(42);
      expect(result.totalReadings).toBe(1500);
    });

    it('should return completedSessions = 0 when no sessions exist in period', async () => {
      revenueRepo.createQueryBuilder.mockReturnValue(
        buildQbChain({}, []) as unknown as ReturnType<
          Repository<TarotistaRevenueMetrics>['createQueryBuilder']
        >,
      );
      readingRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(null, []) as unknown as ReturnType<
          Repository<TarotReading>['createQueryBuilder']
        >,
      );
      sessionRepo.count.mockResolvedValue(0);
      tarotistaRepo.find.mockResolvedValue([]);

      const result = await repository.getPlatformMetrics(dto);

      expect(result.completedSessions).toBe(0);
    });

    it('should include completedSessions per tarotista in topTarotistas', async () => {
      const revenueRaw = {
        totalReadings: '100',
        totalRevenueShare: '3500.00',
        totalPlatformFee: '1500.00',
        totalGrossRevenue: '5000.00',
      };

      // getPlatformMetrics calls revenueRepo.createQueryBuilder 4 times:
      // 1. getRawOne  - total metrics aggregation
      // 2. getRawMany - distinct active tarotistas
      // 3. getRawMany - top tarotistas by revenue (inside getTopTarotistasInternal)
      // 4. getRawOne  - per-tarotista revenue metrics (inside getTopTarotistasInternal)
      revenueRepo.createQueryBuilder
        .mockReturnValueOnce(
          buildQbChain(revenueRaw) as unknown as ReturnType<
            Repository<TarotistaRevenueMetrics>['createQueryBuilder']
          >,
        )
        .mockReturnValueOnce(
          buildQbChain(null, [{ tarotistaId: 1 }]) as unknown as ReturnType<
            Repository<TarotistaRevenueMetrics>['createQueryBuilder']
          >,
        )
        .mockReturnValueOnce(
          buildQbChain(null, [
            { tarotistaId: 1, totalRevenue: '3500.00' },
          ]) as unknown as ReturnType<
            Repository<TarotistaRevenueMetrics>['createQueryBuilder']
          >,
        )
        .mockReturnValue(
          buildQbChain(revenueRaw) as unknown as ReturnType<
            Repository<TarotistaRevenueMetrics>['createQueryBuilder']
          >,
        );

      readingRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(null, [{ userId: 1 }]) as unknown as ReturnType<
          Repository<TarotReading>['createQueryBuilder']
        >,
      );

      // sessionRepo.count is called once for platform-wide total
      sessionRepo.count.mockResolvedValue(42);

      // sessionRepo.createQueryBuilder is called once inside getTopTarotistasInternal
      // for the aggregated GROUP BY query replacing the N+1 counts
      sessionRepo.createQueryBuilder.mockReturnValue(
        buildQbChain(null, [
          { tarotistaId: 1, count: '8' },
        ]) as unknown as ReturnType<Repository<Session>['createQueryBuilder']>,
      );

      tarotistaRepo.find.mockResolvedValue([mockTarotista]);

      const result = await repository.getPlatformMetrics(dto);

      expect(result.completedSessions).toBe(42);
      expect(result.topTarotistas[0].completedSessions).toBe(8);
    });
  });
});
