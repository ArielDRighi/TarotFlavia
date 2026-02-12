import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { RitualsService } from './rituals.service';
import { LunarPhaseService } from './lunar-phase.service';
import { Ritual } from '../../entities/ritual.entity';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
} from '../../domain/enums';
import { RitualFiltersDto } from '../dto/ritual-filters.dto';

describe('RitualsService', () => {
  let service: RitualsService;
  let ritualRepository: jest.Mocked<Repository<Ritual>>;
  let lunarPhaseService: jest.Mocked<LunarPhaseService>;

  const mockRitual: Partial<Ritual> = {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Descripción del ritual',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    imageUrl: '/images/ritual.jpg',
    thumbnailUrl: '/images/ritual-thumb.jpg',
    isActive: true,
    isFeatured: false,
    completionCount: 0,
    viewCount: 0,
    bestTimeOfDay: 'Noche',
    purpose: 'Establecer intenciones',
    preparation: 'Preparar el espacio',
    closing: 'Agradecer',
    tips: ['Tip 1', 'Tip 2'],
    audioUrl: null,
    materials: [],
    steps: [],
  };

  const createQueryBuilder: Record<string, jest.Mock> = {
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    getRawMany: jest.fn(),
    getMany: jest.fn(),
    update: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    execute: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RitualsService,
        {
          provide: getRepositoryToken(Ritual),
          useValue: {
            findOne: jest.fn(),

            createQueryBuilder: jest.fn(() => createQueryBuilder),
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

    service = module.get<RitualsService>(RitualsService);
    ritualRepository = module.get(getRepositoryToken(Ritual));
    lunarPhaseService = module.get(LunarPhaseService);

    // Reset mocks
    jest.clearAllMocks();
    Object.keys(createQueryBuilder).forEach((key) => {
      if (typeof createQueryBuilder[key] === 'function') {
        createQueryBuilder[key].mockClear();
        if (key !== 'getMany' && key !== 'getRawMany' && key !== 'execute') {
          createQueryBuilder[key].mockReturnValue(createQueryBuilder);
        }
      }
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all active rituals', async () => {
      const mockRituals = [mockRitual as Ritual];
      createQueryBuilder.getMany.mockResolvedValue(mockRituals);

      const result = await service.findAll();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(createQueryBuilder.where).toHaveBeenCalledWith(
        'ritual.isActive = :isActive',
        { isActive: true },
      );
    });

    it('should filter by category', async () => {
      const filters: RitualFiltersDto = {
        category: RitualCategory.LUNAR,
      };
      createQueryBuilder.getMany.mockResolvedValue([mockRitual as Ritual]);

      await service.findAll(filters);

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ritual.category = :category',
        { category: RitualCategory.LUNAR },
      );
    });

    it('should filter by difficulty', async () => {
      const filters: RitualFiltersDto = {
        difficulty: RitualDifficulty.BEGINNER,
      };
      createQueryBuilder.getMany.mockResolvedValue([mockRitual as Ritual]);

      await service.findAll(filters);

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        'ritual.difficulty = :difficulty',
        { difficulty: RitualDifficulty.BEGINNER },
      );
    });

    it('should filter by lunar phase', async () => {
      const filters: RitualFiltersDto = {
        lunarPhase: LunarPhase.NEW_MOON,
      };
      createQueryBuilder.getMany.mockResolvedValue([mockRitual as Ritual]);

      await service.findAll(filters);

      expect(createQueryBuilder.andWhere).toHaveBeenCalled();
    });

    it('should filter by search term', async () => {
      const filters: RitualFiltersDto = {
        search: 'luna',
      };
      createQueryBuilder.getMany.mockResolvedValue([mockRitual as Ritual]);

      await service.findAll(filters);

      expect(createQueryBuilder.andWhere).toHaveBeenCalledWith(
        '(ritual.title ILIKE :search OR ritual.description ILIKE :search)',
        { search: '%luna%' },
      );
    });

    it('should return rituals in correct format', async () => {
      const ritualWithRelations = {
        ...mockRitual,
        materials: [{ id: 1, name: 'Vela', type: MaterialType.REQUIRED }],
        steps: [{ id: 1, stepNumber: 1, title: 'Paso 1' }],
      };
      createQueryBuilder.getMany.mockResolvedValue([
        ritualWithRelations as Ritual,
      ]);

      const result = await service.findAll();

      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('slug');
      expect(result[0]).toHaveProperty('materialsCount');
      expect(result[0]).toHaveProperty('stepsCount');
      expect(result[0].materialsCount).toBe(1);
      expect(result[0].stepsCount).toBe(1);
    });
  });

  describe('getFeatured', () => {
    it('should return featured rituals based on current lunar phase', async () => {
      lunarPhaseService.getCurrentPhase.mockReturnValue({
        phase: LunarPhase.NEW_MOON,
        phaseName: 'Luna Nueva',
        illumination: 0,
        zodiacSign: 'Aries',
        isGoodFor: ['Nuevos comienzos'],
      });

      createQueryBuilder.getMany.mockResolvedValue([mockRitual as Ritual]);

      const result = await service.getFeatured();

      expect(lunarPhaseService.getCurrentPhase).toHaveBeenCalled();
      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(createQueryBuilder.take).toHaveBeenCalledWith(6);
    });
  });

  describe('findBySlug', () => {
    it('should return ritual by slug', async () => {
      ritualRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockRitual as Ritual);

      const result = await service.findBySlug('ritual-luna-nueva');

      expect(result).toBeDefined();
      expect(result.slug).toBe('ritual-luna-nueva');
      expect(ritualRepository.findOne).toHaveBeenCalledWith({
        where: { slug: 'ritual-luna-nueva', isActive: true },
        relations: ['materials', 'steps'],
      });
    });

    it('should throw NotFoundException when ritual not found', async () => {
      ritualRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findBySlug('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return complete ritual detail', async () => {
      const completeRitual = {
        ...mockRitual,
        materials: [{ id: 1, name: 'Vela', type: MaterialType.REQUIRED }],
        steps: [
          {
            id: 1,
            stepNumber: 1,
            title: 'Paso 1',
            description: 'Desc',
            durationSeconds: 60,
          },
        ],
      };
      ritualRepository.findOne = jest
        .fn()
        .mockResolvedValue(completeRitual as Ritual);

      const result = await service.findBySlug('ritual-luna-nueva');

      expect(result).toHaveProperty('materials');
      expect(result).toHaveProperty('steps');
      expect(result).toHaveProperty('purpose');
      expect(result).toHaveProperty('preparation');
      expect(result).toHaveProperty('closing');
      expect(result).toHaveProperty('tips');
    });
  });

  describe('findById', () => {
    it('should return ritual by id', async () => {
      ritualRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockRitual as Ritual);

      const result = await service.findById(1);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
    });

    it('should throw NotFoundException when ritual not found', async () => {
      ritualRepository.findOne = jest.fn().mockResolvedValue(null);

      await expect(service.findById(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('getCategories', () => {
    it('should return categories with count', async () => {
      const mockCategories = [
        { category: 'lunar', count: 5 },
        { category: 'tarot', count: 3 },
      ];
      createQueryBuilder.getRawMany.mockResolvedValue(mockCategories);

      const result = await service.getCategories();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result).toEqual(mockCategories);
    });
  });

  describe('incrementCompletionCount', () => {
    it('should increment completion counter', async () => {
      createQueryBuilder.execute.mockResolvedValue({ affected: 1 });

      await service.incrementCompletionCount(1);

      expect(createQueryBuilder.update).toHaveBeenCalled();
      expect(createQueryBuilder.set).toHaveBeenCalledWith({
        completionCount: expect.any(Function),
      });
      expect(createQueryBuilder.where).toHaveBeenCalledWith('id = :id', {
        id: 1,
      });
    });
  });
});
