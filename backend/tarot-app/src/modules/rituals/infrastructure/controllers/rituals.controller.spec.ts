import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { RitualsController } from './rituals.controller';
import { RitualsService } from '../../application/services/rituals.service';
import { RitualHistoryService } from '../../application/services/ritual-history.service';
import { LunarPhaseService } from '../../application/services/lunar-phase.service';
import { ReadingPatternAnalyzerService } from '../../application/services/reading-pattern-analyzer.service';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  MaterialType,
} from '../../domain/enums';

describe('RitualsController', () => {
  let controller: RitualsController;
  let ritualsService: jest.Mocked<RitualsService>;
  let historyService: jest.Mocked<RitualHistoryService>;
  let lunarPhaseService: jest.Mocked<LunarPhaseService>;

  const mockRitualSummary = {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Ceremonia para establecer intenciones',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    imageUrl: '/images/rituals/luna-nueva.jpg',
    materialsCount: 3,
    stepsCount: 7,
  };

  const mockRitualDetail = {
    ...mockRitualSummary,
    bestTimeOfDay: 'Noche',
    purpose: 'Establecer intenciones',
    preparation: 'Buscar espacio tranquilo',
    closing: 'Agradecer a la luna',
    tips: ['Escribe en presente', 'Sé específico'],
    audioUrl: null,
    materials: [
      {
        id: 1,
        name: 'Vela blanca',
        description: null,
        type: MaterialType.REQUIRED,
        alternative: null,
        quantity: 1,
        unit: 'unidad',
      },
    ],
    steps: [
      {
        id: 1,
        stepNumber: 1,
        title: 'Preparar el espacio',
        description: 'Limpia el área',
        durationSeconds: 180,
        imageUrl: null,
        mantra: null,
        visualization: null,
      },
    ],
    completionCount: 42,
  };

  const mockLunarInfo = {
    phase: LunarPhase.FULL_MOON,
    phaseName: 'Luna Llena',
    illumination: 100,
    zodiacSign: 'Leo',
    isGoodFor: ['Culminación', 'Celebración', 'Liberación'],
  };

  const mockUser = {
    userId: 1,
    email: 'user@test.com',
    username: 'testuser',
  };

  const mockHistory = {
    id: 1,
    userId: 1,
    ritualId: 1,
    completedAt: new Date('2026-01-20'),
    lunarPhase: LunarPhase.FULL_MOON,
    lunarSign: 'Leo',
    notes: 'Fue muy tranquilo',
    rating: 5,
    durationMinutes: 30,
    ritual: {
      id: 1,
      slug: 'ritual-luna-nueva',
      title: 'Ritual de Luna Nueva',
      category: RitualCategory.LUNAR,
    },
  };

  beforeEach(async () => {
    const mockRitualsService = {
      findAll: jest.fn(),
      getFeatured: jest.fn(),
      getCategories: jest.fn(),
      findBySlug: jest.fn(),
      incrementCompletionCount: jest.fn(),
    };

    const mockHistoryService = {
      completeRitual: jest.fn(),
      getUserHistory: jest.fn(),
      getUserStats: jest.fn(),
    };

    const mockLunarPhaseService = {
      getCurrentPhase: jest.fn(),
    };

    const mockPatternAnalyzer = {
      analyzeUserPatterns: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [RitualsController],
      providers: [
        {
          provide: RitualsService,
          useValue: mockRitualsService,
        },
        {
          provide: RitualHistoryService,
          useValue: mockHistoryService,
        },
        {
          provide: LunarPhaseService,
          useValue: mockLunarPhaseService,
        },
        {
          provide: ReadingPatternAnalyzerService,
          useValue: mockPatternAnalyzer,
        },
      ],
    }).compile();

    controller = module.get<RitualsController>(RitualsController);
    ritualsService = module.get(RitualsService);
    historyService = module.get(RitualHistoryService);
    lunarPhaseService = module.get(LunarPhaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getRituals', () => {
    it('debe retornar lista de rituales', async () => {
      ritualsService.findAll.mockResolvedValue([mockRitualSummary]);

      const result = await controller.getRituals({});

      expect(result).toEqual([mockRitualSummary]);
      expect(ritualsService.findAll).toHaveBeenCalledWith({});
    });

    it('debe pasar filtros al servicio', async () => {
      const filters = {
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
      };
      ritualsService.findAll.mockResolvedValue([mockRitualSummary]);

      await controller.getRituals(filters);

      expect(ritualsService.findAll).toHaveBeenCalledWith(filters);
    });

    it('debe retornar array vacío si no hay rituales', async () => {
      ritualsService.findAll.mockResolvedValue([]);

      const result = await controller.getRituals({});

      expect(result).toEqual([]);
    });
  });

  describe('getFeatured', () => {
    it('debe retornar rituales destacados', async () => {
      ritualsService.getFeatured.mockResolvedValue([mockRitualSummary]);

      const result = await controller.getFeatured();

      expect(result).toEqual([mockRitualSummary]);
      expect(ritualsService.getFeatured).toHaveBeenCalledTimes(1);
    });

    it('debe retornar array vacío si no hay destacados', async () => {
      ritualsService.getFeatured.mockResolvedValue([]);

      const result = await controller.getFeatured();

      expect(result).toEqual([]);
    });
  });

  describe('getCategories', () => {
    it('debe retornar categorías con conteo', async () => {
      const categories = [
        { category: 'lunar', count: 5 },
        { category: 'tarot', count: 3 },
      ];
      ritualsService.getCategories.mockResolvedValue(categories);

      const result = await controller.getCategories();

      expect(result).toEqual(categories);
      expect(ritualsService.getCategories).toHaveBeenCalledTimes(1);
    });
  });

  describe('getLunarInfo', () => {
    it('debe retornar información lunar actual', () => {
      lunarPhaseService.getCurrentPhase.mockReturnValue(mockLunarInfo);

      const result = controller.getLunarInfo();

      expect(result).toEqual(mockLunarInfo);
      expect(lunarPhaseService.getCurrentPhase).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRitualBySlug', () => {
    it('debe retornar detalle de ritual', async () => {
      ritualsService.findBySlug.mockResolvedValue(mockRitualDetail);

      const result = await controller.getRitualBySlug('ritual-luna-nueva');

      expect(result).toEqual(mockRitualDetail);
      expect(ritualsService.findBySlug).toHaveBeenCalledWith(
        'ritual-luna-nueva',
      );
    });

    it('debe lanzar NotFoundException si no existe', async () => {
      ritualsService.findBySlug.mockRejectedValue(
        new NotFoundException('Ritual "invalid" no encontrado'),
      );

      await expect(controller.getRitualBySlug('invalid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('completeRitual', () => {
    it('debe registrar ritual completado', async () => {
      const dto = {
        notes: 'Fue muy tranquilo',
        rating: 5,
        durationMinutes: 30,
      };
      const mockHistoryEntry = {
        id: 1,
        lunarPhase: LunarPhase.FULL_MOON,
        lunarSign: 'Leo',
      };
      historyService.completeRitual.mockResolvedValue(
        mockHistoryEntry as never,
      );

      const result = await controller.completeRitual(mockUser as never, 1, dto);

      expect(result).toEqual({
        message: 'Ritual completado exitosamente',
        historyId: 1,
        lunarPhase: LunarPhase.FULL_MOON,
        lunarSign: 'Leo',
      });
      expect(historyService.completeRitual).toHaveBeenCalledWith(1, 1, dto);
    });

    it('debe permitir completar sin notas ni rating', async () => {
      const dto = {};
      const mockHistoryEntry = {
        id: 2,
        lunarPhase: LunarPhase.NEW_MOON,
        lunarSign: 'Aries',
      };
      historyService.completeRitual.mockResolvedValue(
        mockHistoryEntry as never,
      );

      const result = await controller.completeRitual(mockUser as never, 1, dto);

      expect(result.message).toBe('Ritual completado exitosamente');
      expect(historyService.completeRitual).toHaveBeenCalledWith(1, 1, dto);
    });
  });

  describe('getHistory', () => {
    it('debe retornar historial del usuario', async () => {
      historyService.getUserHistory.mockResolvedValue([mockHistory] as never);

      const result = await controller.getHistory(mockUser as never, undefined);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 1,
        ritual: {
          id: 1,
          slug: 'ritual-luna-nueva',
          title: 'Ritual de Luna Nueva',
          category: RitualCategory.LUNAR,
        },
        completedAt: mockHistory.completedAt,
        notes: 'Fue muy tranquilo',
        rating: 5,
      });
      expect(historyService.getUserHistory).toHaveBeenCalledWith(1, 20);
    });

    it('debe respetar el límite personalizado', async () => {
      historyService.getUserHistory.mockResolvedValue([]);

      await controller.getHistory(mockUser as never, 10);

      expect(historyService.getUserHistory).toHaveBeenCalledWith(1, 10);
    });

    it('debe usar límite por defecto de 20 si no se especifica', async () => {
      historyService.getUserHistory.mockResolvedValue([]);

      await controller.getHistory(mockUser as never, undefined);

      expect(historyService.getUserHistory).toHaveBeenCalledWith(1, 20);
    });
  });

  describe('getStats', () => {
    it('debe retornar estadísticas del usuario', async () => {
      const mockStats = {
        totalCompleted: 15,
        favoriteCategory: 'lunar',
        currentStreak: 7,
        thisMonthCount: 5,
      };
      historyService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockUser as never);

      expect(result).toEqual(mockStats);
      expect(historyService.getUserStats).toHaveBeenCalledWith(1);
    });

    it('debe manejar usuario sin historial', async () => {
      const mockStats = {
        totalCompleted: 0,
        favoriteCategory: null,
        currentStreak: 0,
        thisMonthCount: 0,
      };
      historyService.getUserStats.mockResolvedValue(mockStats);

      const result = await controller.getStats(mockUser as never);

      expect(result.totalCompleted).toBe(0);
      expect(result.favoriteCategory).toBeNull();
    });
  });
});
