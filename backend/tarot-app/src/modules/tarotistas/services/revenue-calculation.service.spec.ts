import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevenueCalculationService } from './revenue-calculation.service';
import { TarotistaRevenueMetrics } from '../entities/tarotista-revenue-metrics.entity';
import { Tarotista } from '../entities/tarotista.entity';
import { User } from '../../users/entities/user.entity';
import {
  CalculateRevenueDto,
  RevenueCalculationResponseDto,
} from '../application/dto/revenue-calculation.dto';
import { SubscriptionType } from '../entities/user-tarotista-subscription.entity';
import { NotFoundException } from '@nestjs/common';

describe('RevenueCalculationService', () => {
  let service: RevenueCalculationService;
  let revenueMetricsRepository: Repository<TarotistaRevenueMetrics>;
  let tarotistaRepository: Repository<Tarotista>;
  let userRepository: Repository<User>;

  const mockTarotista: Partial<Tarotista> = {
    id: 1,
    nombrePublico: 'Flavia',
    comisiónPorcentaje: 30.0, // 30% comisión plataforma, 70% tarotista
    isActive: true,
  };

  const mockUser: Partial<User> = {
    id: 1,
    email: 'user@example.com',
    name: 'Test User',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RevenueCalculationService,
        {
          provide: getRepositoryToken(TarotistaRevenueMetrics),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Tarotista),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RevenueCalculationService>(RevenueCalculationService);
    revenueMetricsRepository = module.get<Repository<TarotistaRevenueMetrics>>(
      getRepositoryToken(TarotistaRevenueMetrics),
    );
    tarotistaRepository = module.get<Repository<Tarotista>>(
      getRepositoryToken(Tarotista),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateRevenue', () => {
    it('should calculate revenue with default 70/30 split', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 50.0,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);

      const result: RevenueCalculationResponseDto =
        await service.calculateRevenue(dto);

      expect(result.totalRevenueUsd).toBe(50.0);
      expect(result.platformFeeUsd).toBe(15.0); // 30%
      expect(result.revenueShareUsd).toBe(35.0); // 70%
      expect(result.commissionPercentage).toBe(30.0);
    });

    it('should calculate revenue with custom commission', async () => {
      const customTarotista = {
        ...mockTarotista,
        comisiónPorcentaje: 20.0, // Negociación especial
      };

      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 100.0,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(customTarotista as Tarotista);

      const result = await service.calculateRevenue(dto);

      expect(result.totalRevenueUsd).toBe(100.0);
      expect(result.platformFeeUsd).toBe(20.0); // 20%
      expect(result.revenueShareUsd).toBe(80.0); // 80%
      expect(result.commissionPercentage).toBe(20.0);
    });

    it('should throw NotFoundException if tarotista not found', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 999,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 50.0,
      };

      jest.spyOn(tarotistaRepository, 'findOne').mockResolvedValue(null);

      await expect(service.calculateRevenue(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle zero revenue', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.FAVORITE,
        totalRevenueUsd: 0.0,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);

      const result = await service.calculateRevenue(dto);

      expect(result.totalRevenueUsd).toBe(0.0);
      expect(result.platformFeeUsd).toBe(0.0);
      expect(result.revenueShareUsd).toBe(0.0);
    });

    it('should handle decimal precision correctly', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 33.33,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);

      const result = await service.calculateRevenue(dto);

      // 30% de 33.33 = 9.999 → 10.00
      // 70% de 33.33 = 23.331 → 23.33
      expect(result.platformFeeUsd).toBe(10.0);
      expect(result.revenueShareUsd).toBe(23.33);
      // Verificar que suma sea correcta
      expect(result.platformFeeUsd + result.revenueShareUsd).toBe(33.33);
    });
  });

  describe('recordRevenue', () => {
    it('should record revenue metrics in database', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 50.0,
        readingId: 123,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const mockRevenueMetric: Partial<TarotistaRevenueMetrics> = {
        id: 1,
        tarotistaId: 1,
        userId: 1,
        readingId: 123,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        revenueShareUsd: 35.0,
        platformFeeUsd: 15.0,
        totalRevenueUsd: 50.0,
        calculationDate: new Date(),
        periodStart: new Date(),
        periodEnd: new Date(),
      };

      jest
        .spyOn(revenueMetricsRepository, 'create')
        .mockReturnValue(mockRevenueMetric as any);
      jest
        .spyOn(revenueMetricsRepository, 'save')
        .mockResolvedValue(mockRevenueMetric as any);

      const result = await service.recordRevenue(dto);

      expect(revenueMetricsRepository.create).toHaveBeenCalled();
      expect(revenueMetricsRepository.save).toHaveBeenCalled();
      expect(result.tarotistaId).toBe(1);
      expect(result.userId).toBe(1);
      expect(result.readingId).toBe(123);
      expect(result.revenueShareUsd).toBe(35.0);
      expect(result.platformFeeUsd).toBe(15.0);
    });

    it('should throw NotFoundException if user not found', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 999,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 50.0,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.recordRevenue(dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should record revenue without readingId (subscription payment)', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        totalRevenueUsd: 100.0,
        // No readingId - pago de suscripción mensual
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const mockRevenueMetric: Partial<TarotistaRevenueMetrics> = {
        id: 1,
        tarotistaId: 1,
        userId: 1,
        readingId: null,
        subscriptionType: SubscriptionType.PREMIUM_ALL_ACCESS,
        revenueShareUsd: 70.0,
        platformFeeUsd: 30.0,
        totalRevenueUsd: 100.0,
        calculationDate: new Date(),
        periodStart: new Date(),
        periodEnd: new Date(),
      };

      jest
        .spyOn(revenueMetricsRepository, 'create')
        .mockReturnValue(mockRevenueMetric as any);
      jest
        .spyOn(revenueMetricsRepository, 'save')
        .mockResolvedValue(mockRevenueMetric as any);

      const result = await service.recordRevenue(dto);

      expect(result.readingId).toBeNull();
      expect(result.subscriptionType).toBe(SubscriptionType.PREMIUM_ALL_ACCESS);
    });

    it('should set correct calculation period (monthly)', async () => {
      const dto: CalculateRevenueDto = {
        tarotistaId: 1,
        userId: 1,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        totalRevenueUsd: 50.0,
      };

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const mockRevenueMetric: Partial<TarotistaRevenueMetrics> = {
        id: 1,
        tarotistaId: 1,
        userId: 1,
        readingId: null,
        subscriptionType: SubscriptionType.PREMIUM_INDIVIDUAL,
        revenueShareUsd: 35.0,
        platformFeeUsd: 15.0,
        totalRevenueUsd: 50.0,
        calculationDate: new Date(),
        periodStart: new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1,
        ),
        periodEnd: new Date(
          new Date().getFullYear(),
          new Date().getMonth() + 1,
          0,
          23,
          59,
          59,
          999,
        ),
      };

      jest
        .spyOn(revenueMetricsRepository, 'create')
        .mockReturnValue(mockRevenueMetric as any);
      jest
        .spyOn(revenueMetricsRepository, 'save')
        .mockResolvedValue(mockRevenueMetric as any);

      const result = await service.recordRevenue(dto);

      expect(result.periodStart).toBeDefined();
      expect(result.periodEnd).toBeDefined();
      // Verificar que periodStart sea inicio del mes actual
      expect(result.periodStart.getDate()).toBe(1);
      expect(result.periodStart.getHours()).toBe(0);
      expect(result.periodStart.getMinutes()).toBe(0);
      // Verificar que periodEnd sea fin del mes actual
      expect(result.periodEnd.getDate()).toBeGreaterThan(27); // Al menos día 28
      expect(result.periodEnd.getHours()).toBe(23);
      expect(result.periodEnd.getMinutes()).toBe(59);
    });
  });

  describe('calculateRevenueForReading', () => {
    it('should calculate and record revenue for a reading', async () => {
      const readingId = 123;
      const tarotistaId = 1;
      const userId = 1;
      const subscriptionType = SubscriptionType.PREMIUM_INDIVIDUAL;
      const totalRevenue = 50.0;

      jest
        .spyOn(tarotistaRepository, 'findOne')
        .mockResolvedValue(mockTarotista as Tarotista);
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser as User);

      const mockRevenueMetric: Partial<TarotistaRevenueMetrics> = {
        id: 1,
        tarotistaId,
        userId,
        readingId,
        subscriptionType,
        revenueShareUsd: 35.0,
        platformFeeUsd: 15.0,
        totalRevenueUsd: 50.0,
        calculationDate: new Date(),
        periodStart: new Date(),
        periodEnd: new Date(),
      };

      jest
        .spyOn(revenueMetricsRepository, 'create')
        .mockReturnValue(mockRevenueMetric as any);
      jest
        .spyOn(revenueMetricsRepository, 'save')
        .mockResolvedValue(mockRevenueMetric as any);

      const result = await service.calculateRevenueForReading(
        readingId,
        tarotistaId,
        userId,
        subscriptionType,
        totalRevenue,
      );

      expect(result.readingId).toBe(readingId);
      expect(result.tarotistaId).toBe(tarotistaId);
      expect(result.userId).toBe(userId);
      expect(result.revenueShareUsd).toBe(35.0);
      expect(result.platformFeeUsd).toBe(15.0);
    });
  });
});
