import { Test, TestingModule } from '@nestjs/testing';
import { DailyReadingService } from './daily-reading.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DailyReading } from './entities/daily-reading.entity';
import { TarotCard } from '../cards/entities/tarot-card.entity';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InterpretationsService } from '../interpretations/interpretations.service';
import { UserPlan } from '../../users/entities/user.entity';

interface MockQueryBuilder {
  where: jest.Mock;
  andWhere: jest.Mock;
  leftJoinAndSelect: jest.Mock;
  orderBy: jest.Mock;
  skip: jest.Mock;
  take: jest.Mock;
  getOne: jest.Mock;
  getManyAndCount: jest.Mock;
}

interface MockRepository {
  create: jest.Mock;
  save: jest.Mock;
  findOne: jest.Mock;
  createQueryBuilder: jest.Mock;
  count: jest.Mock;
}

interface MockInterpretationsService {
  generateDailyCardInterpretation: jest.Mock;
}

describe('DailyReadingService', () => {
  let service: DailyReadingService;
  let mockDailyReadingRepo: MockRepository;
  let mockCardRepo: MockRepository;
  let mockInterpretationsService: MockInterpretationsService;
  let mockDailyReadingQueryBuilder: MockQueryBuilder;
  let mockCardQueryBuilder: MockQueryBuilder;

  beforeEach(async () => {
    // Mock QueryBuilder para DailyReading
    mockDailyReadingQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
    };

    // Mock QueryBuilder para TarotCard
    mockCardQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getOne: jest.fn(),
      getManyAndCount: jest.fn(),
    };

    mockDailyReadingRepo = {
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      count: jest.fn(),
      createQueryBuilder: jest
        .fn()
        .mockReturnValue(mockDailyReadingQueryBuilder),
    };

    mockCardRepo = {
      count: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(mockCardQueryBuilder),
    };

    mockInterpretationsService = {
      generateDailyCardInterpretation: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyReadingService,
        {
          provide: getRepositoryToken(DailyReading),
          useValue: mockDailyReadingRepo,
        },
        {
          provide: getRepositoryToken(TarotCard),
          useValue: mockCardRepo,
        },
        {
          provide: InterpretationsService,
          useValue: mockInterpretationsService,
        },
      ],
    }).compile();

    service = module.get<DailyReadingService>(DailyReadingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('generateDailyCard', () => {
    const userId = 1;
    const tarotistaId = 1;

    it('should throw ConflictException if user already has a daily card for today', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({ id: 1 });

      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(ConflictException);
      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(
        'Ya generaste tu carta del día. Vuelve mañana para una nueva carta.',
      );
    });

    it('should generate a daily card successfully', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        '**Energía del Día**: Poder de manifestación',
      );

      const savedReading = {
        id: 1,
        userId,
        tarotistaId,
        cardId: 1,
        isReversed: false,
        interpretation: '**Energía del Día**: Poder de manifestación',
        readingDate: new Date(),
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(savedReading);
      mockDailyReadingRepo.save.mockResolvedValue(savedReading);
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...savedReading,
        card: { id: 1, name: 'El Mago' },
      });

      const result = await service.generateDailyCard(userId, tarotistaId);

      expect(result.cardId).toBe(1);
      expect(result.interpretation).toContain('Energía del Día');
      expect(
        mockInterpretationsService.generateDailyCardInterpretation,
      ).toHaveBeenCalled();
    });

    it('should throw InternalServerErrorException if save fails', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        name: 'El Mago',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        'interpretation',
      );

      mockDailyReadingRepo.create.mockReturnValue({});
      mockDailyReadingRepo.save.mockResolvedValue({ id: 1 });
      mockDailyReadingRepo.findOne.mockResolvedValue(null); // Simulate save failure

      await expect(
        service.generateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('getTodayCard', () => {
    const userId = 1;

    it('should return null if no card exists for today', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      const result = await service.getTodayCard(userId);

      expect(result).toBeNull();
    });

    it("should return today's card if it exists", async () => {
      const mockReading = {
        id: 1,
        userId,
        cardId: 1,
        card: { id: 1, name: 'El Mago' },
      };

      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(mockReading);

      const result = await service.getTodayCard(userId);

      expect(result).toEqual(mockReading);
      expect(mockDailyReadingRepo.createQueryBuilder).toHaveBeenCalledWith(
        'daily_reading',
      );
    });
  });

  describe('regenerateDailyCard', () => {
    const userId = 1;
    const tarotistaId = 1;

    it('should throw NotFoundException if no daily card exists', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      await expect(
        service.regenerateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not premium', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        userId,
        user: { id: userId, plan: UserPlan.FREE },
      });

      await expect(
        service.regenerateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if user is null', async () => {
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue({
        id: 1,
        userId,
        user: null,
      });

      await expect(
        service.regenerateDailyCard(userId, tarotistaId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should regenerate daily card for premium users', async () => {
      const existingReading = {
        id: 1,
        userId,
        user: { id: userId, plan: UserPlan.PREMIUM },
      };

      mockDailyReadingQueryBuilder.getOne
        .mockResolvedValueOnce(existingReading) // Primera llamada: verificar existencia
        .mockResolvedValueOnce(null); // Segunda llamada en generateDailyCard

      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue({
        id: 2,
        name: 'La Sacerdotisa',
      });

      mockInterpretationsService.generateDailyCardInterpretation.mockResolvedValue(
        'Nueva interpretación',
      );

      const newReading = {
        id: 2,
        userId,
        tarotistaId,
        cardId: 2,
        wasRegenerated: false,
      };

      mockDailyReadingRepo.create.mockReturnValue(newReading);
      mockDailyReadingRepo.save.mockResolvedValue({
        ...newReading,
        wasRegenerated: true,
      });
      mockDailyReadingRepo.findOne.mockResolvedValue({
        ...newReading,
        wasRegenerated: true,
        card: { id: 2, name: 'La Sacerdotisa' },
      });

      const result = await service.regenerateDailyCard(userId, tarotistaId);

      expect(result.wasRegenerated).toBe(true);
      expect(result.card.name).toBe('La Sacerdotisa');
    });
  });

  describe('getDailyHistory', () => {
    const userId = 1;

    it('should return paginated history', async () => {
      const mockReadings = [
        {
          id: 1,
          userId,
          readingDate: '2024-01-01',
          interpretation: 'Test interpretation ' + 'a'.repeat(200),
          wasRegenerated: false,
          createdAt: new Date(),
          card: { name: 'El Mago' },
          isReversed: false,
        },
      ];

      mockDailyReadingQueryBuilder.getManyAndCount.mockResolvedValue([
        mockReadings,
        1,
      ]);

      const result = await service.getDailyHistory(userId, 1, 10);

      expect(result.items.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.items[0].interpretationSummary.length).toBeLessThanOrEqual(
        153,
      ); // 150 + '...'
    });

    it('should handle empty history', async () => {
      mockDailyReadingQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

      const result = await service.getDailyHistory(userId, 1, 10);

      expect(result.items.length).toBe(0);
      expect(result.total).toBe(0);
    });
  });

  describe('selectRandomCard (private)', () => {
    it('should throw InternalServerErrorException if no card found', async () => {
      mockCardRepo.count.mockResolvedValue(78);
      mockCardQueryBuilder.getOne.mockResolvedValue(null);
      mockDailyReadingQueryBuilder.getOne.mockResolvedValue(null);

      await expect(service.generateDailyCard(1, 1)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.generateDailyCard(1, 1)).rejects.toThrow(
        'No se pudo seleccionar una carta',
      );
    });
  });
});
