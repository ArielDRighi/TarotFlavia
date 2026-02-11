import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RitualHistoryService } from './ritual-history.service';
import { RitualsService } from './rituals.service';
import { LunarPhaseService } from './lunar-phase.service';
import { UserRitualHistory } from '../../entities/user-ritual-history.entity';
import { Ritual } from '../../entities/ritual.entity';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
} from '../../domain/enums';
import { CompleteRitualDto } from '../dto/complete-ritual.dto';

describe('RitualHistoryService', () => {
  let service: RitualHistoryService;
  let historyRepository: jest.Mocked<Repository<UserRitualHistory>>;
  let ritualsService: jest.Mocked<RitualsService>;
  let lunarPhaseService: jest.Mocked<LunarPhaseService>;

  const mockRitual: Partial<Ritual> = {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
  };

  const mockHistory: Partial<UserRitualHistory> = {
    id: 1,
    userId: 1,
    ritualId: 1,
    completedAt: new Date(),
    lunarPhase: LunarPhase.NEW_MOON,
    lunarSign: 'Aries',
    notes: 'Me sentí bien',
    rating: 5,
    durationMinutes: 30,
  };

  const createQueryBuilder: Record<string, jest.Mock> = {
    innerJoin: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualHistoryService,
        {
          provide: getRepositoryToken(UserRitualHistory),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            count: jest.fn(),

            createQueryBuilder: jest.fn(() => createQueryBuilder),
          },
        },
        {
          provide: RitualsService,
          useValue: {
            incrementCompletionCount: jest.fn(),
          },
        },
        {
          provide: LunarPhaseService,
          useValue: {
            getCurrentPhase: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<RitualHistoryService>(RitualHistoryService);
    historyRepository = module.get(getRepositoryToken(UserRitualHistory));
    ritualsService = module.get(RitualsService);
    lunarPhaseService = module.get(LunarPhaseService);

    jest.clearAllMocks();
    Object.keys(createQueryBuilder).forEach((key) => {
      if (typeof createQueryBuilder[key] === 'function') {
        createQueryBuilder[key].mockClear();
        if (key !== 'getRawOne') {
          createQueryBuilder[key].mockReturnValue(createQueryBuilder);
        }
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('completeRitual', () => {
    it('should register ritual completion with lunar info', async () => {
      const dto: CompleteRitualDto = {
        notes: 'Muy relajante',
        rating: 5,
        durationMinutes: 30,
      };

      lunarPhaseService.getCurrentPhase.mockReturnValue({
        phase: LunarPhase.NEW_MOON,
        phaseName: 'Luna Nueva',
        illumination: 0,
        zodiacSign: 'Aries',
        isGoodFor: ['Nuevos comienzos'],
      });

      historyRepository.create = jest
        .fn()
        .mockReturnValue(mockHistory as UserRitualHistory);
      historyRepository.save = jest
        .fn()
        .mockResolvedValue(mockHistory as UserRitualHistory);

      const result = await service.completeRitual(1, 1, dto);

      expect(lunarPhaseService.getCurrentPhase).toHaveBeenCalled();
      expect(historyRepository.create).toHaveBeenCalledWith({
        userId: 1,
        ritualId: 1,
        completedAt: expect.any(Date),
        lunarPhase: LunarPhase.NEW_MOON,
        lunarSign: 'Aries',
        notes: dto.notes,
        rating: dto.rating,
        durationMinutes: dto.durationMinutes,
      });
      expect(historyRepository.save).toHaveBeenCalled();
      expect(ritualsService.incrementCompletionCount).toHaveBeenCalledWith(1);
      expect(result).toBeDefined();
    });

    it('should register completion without optional fields', async () => {
      const dto: CompleteRitualDto = {};

      lunarPhaseService.getCurrentPhase.mockReturnValue({
        phase: LunarPhase.NEW_MOON,
        phaseName: 'Luna Nueva',
        illumination: 0,
        zodiacSign: 'Aries',
        isGoodFor: ['Nuevos comienzos'],
      });

      historyRepository.create = jest
        .fn()
        .mockReturnValue(mockHistory as UserRitualHistory);
      historyRepository.save = jest
        .fn()
        .mockResolvedValue(mockHistory as UserRitualHistory);

      await service.completeRitual(1, 1, dto);

      expect(historyRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          ritualId: 1,
          notes: undefined,
          rating: undefined,
          durationMinutes: undefined,
        }),
      );
    });
  });

  describe('getUserHistory', () => {
    it('should return user history with default limit', async () => {
      const mockHistories = [
        { ...mockHistory, ritual: mockRitual },
      ] as UserRitualHistory[];
      historyRepository.find = jest.fn().mockResolvedValue(mockHistories);

      const result = await service.getUserHistory(1);

      expect(historyRepository.find).toHaveBeenCalledWith({
        where: { userId: 1 },
        relations: ['ritual'],
        order: { completedAt: 'DESC' },
        take: 20,
      });
      expect(result).toEqual(mockHistories);
    });

    it('should return user history with custom limit', async () => {
      const mockHistories = [] as UserRitualHistory[];
      historyRepository.find = jest.fn().mockResolvedValue(mockHistories);

      await service.getUserHistory(1, 10);

      expect(historyRepository.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });

  describe('getUserStats', () => {
    it('should return user statistics', async () => {
      historyRepository.count = jest.fn().mockResolvedValue(10);
      createQueryBuilder.getRawOne.mockResolvedValue({
        category: 'lunar',
        count: 5,
      });

      // Mock para racha actual
      historyRepository.find = jest
        .fn()
        .mockResolvedValue([
          { ...mockHistory, completedAt: new Date() },
        ] as UserRitualHistory[]);

      const result = await service.getUserStats(1);

      expect(result).toBeDefined();
      expect(result).toHaveProperty('totalCompleted');
      expect(result).toHaveProperty('favoriteCategory');
      expect(result).toHaveProperty('currentStreak');
      expect(result).toHaveProperty('thisMonthCount');
      expect(typeof result.totalCompleted).toBe('number');
    });

    it('should return null favorite category when no completions', async () => {
      historyRepository.count = jest.fn().mockResolvedValue(0);
      createQueryBuilder.getRawOne.mockResolvedValue(null);
      historyRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.getUserStats(1);

      expect(result.totalCompleted).toBe(0);
      expect(result.favoriteCategory).toBeNull();
    });

    it('should calculate this month count correctly', async () => {
      historyRepository.count = jest
        .fn()
        .mockResolvedValueOnce(10) // Total count
        .mockResolvedValueOnce(3); // This month count

      createQueryBuilder.getRawOne.mockResolvedValue({
        category: 'lunar',
        count: 5,
      });
      historyRepository.find = jest.fn().mockResolvedValue([]);

      const result = await service.getUserStats(1);

      expect(result.thisMonthCount).toBe(3);
      expect(historyRepository.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            completedAt: expect.any(Object),
          }),
        }),
      );
    });
  });

  describe('hasCompletedToday', () => {
    it('should return true when ritual completed today', async () => {
      historyRepository.count = jest.fn().mockResolvedValue(1);

      const result = await service.hasCompletedToday(1, 1);

      expect(result).toBe(true);
      expect(historyRepository.count).toHaveBeenCalledWith({
        where: {
          userId: 1,
          ritualId: 1,
          completedAt: expect.any(Object),
        },
      });
    });

    it('should return false when ritual not completed today', async () => {
      historyRepository.count = jest.fn().mockResolvedValue(0);

      const result = await service.hasCompletedToday(1, 1);

      expect(result).toBe(false);
    });
  });

  describe('calculateStreak', () => {
    it('should calculate streak of consecutive days', async () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const histories = [
        { ...mockHistory, completedAt: today },
        { ...mockHistory, completedAt: yesterday },
      ] as UserRitualHistory[];

      historyRepository.find = jest.fn().mockResolvedValue(histories);

      const result = await service.getUserStats(1);

      expect(result.currentStreak).toBeGreaterThan(0);
    });

    it('should return 0 streak when no recent completions', async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      historyRepository.count = jest.fn().mockResolvedValue(1);
      createQueryBuilder.getRawOne.mockResolvedValue(null);
      historyRepository.find = jest
        .fn()
        .mockResolvedValue([
          { ...mockHistory, completedAt: oldDate },
        ] as UserRitualHistory[]);

      const result = await service.getUserStats(1);

      expect(result.currentStreak).toBe(0);
    });
  });
});
