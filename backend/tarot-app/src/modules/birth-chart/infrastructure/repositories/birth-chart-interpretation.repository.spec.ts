import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { BirthChartInterpretationRepository } from './birth-chart-interpretation.repository';
import { BirthChartInterpretation } from '../../entities/birth-chart-interpretation.entity';
import {
  InterpretationCategory,
  Planet,
  ZodiacSign,
  AspectType,
} from '../../domain/enums';

describe('BirthChartInterpretationRepository', () => {
  let repository: BirthChartInterpretationRepository;
  let mockRepo: Record<string, jest.Mock>;

  // Mock data
  const mockInterpretation: BirthChartInterpretation = {
    id: 1,
    category: InterpretationCategory.PLANET_IN_SIGN,
    planet: Planet.SUN,
    sign: ZodiacSign.ARIES,
    house: null,
    aspectType: null,
    planet2: null,
    content: 'El Sol en Aries representa una personalidad dinámica...',
    summary: 'Personalidad dinámica y emprendedora',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    getBigThree: jest.fn(),
    hasAiSynthesis: jest.fn(),
    getAspectsForPlanet: jest.fn(),
  } as unknown as BirthChartInterpretation;

  beforeEach(async () => {
    // Create mock repository
    mockRepo = {
      findOne: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn(),
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthChartInterpretationRepository,
        {
          provide: getRepositoryToken(BirthChartInterpretation),
          useValue: mockRepo,
        },
      ],
    }).compile();

    repository = module.get<BirthChartInterpretationRepository>(
      BirthChartInterpretationRepository,
    );

    // Clear mocks before each test
    jest.clearAllMocks();
  });

  describe('findPlanetInSign', () => {
    it('should find interpretation for planet in sign', async () => {
      mockRepo.findOne.mockResolvedValue(mockInterpretation);

      const result = await repository.findPlanetInSign(
        Planet.SUN,
        ZodiacSign.ARIES,
      );

      expect(result).toEqual(mockInterpretation);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: {
          category: InterpretationCategory.PLANET_IN_SIGN,
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          isActive: true,
        },
      });
    });

    it('should return null when interpretation not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findPlanetInSign(
        Planet.SUN,
        ZodiacSign.ARIES,
      );

      expect(result).toBeNull();
    });
  });

  describe('findPlanetInHouse', () => {
    it('should find interpretation for planet in house', async () => {
      const houseInterpretation = {
        ...mockInterpretation,
        category: InterpretationCategory.PLANET_IN_HOUSE,
        house: 1,
        sign: null,
      };
      mockRepo.findOne.mockResolvedValue(houseInterpretation);

      const result = await repository.findPlanetInHouse(Planet.SUN, 1);

      expect(result).toEqual(houseInterpretation);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: {
          category: InterpretationCategory.PLANET_IN_HOUSE,
          planet: Planet.SUN,
          house: 1,
          isActive: true,
        },
      });
    });

    it('should return null when interpretation not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findPlanetInHouse(Planet.SUN, 1);

      expect(result).toBeNull();
    });
  });

  describe('findAspect', () => {
    it('should find aspect interpretation in first direction', async () => {
      const aspectInterpretation = {
        ...mockInterpretation,
        category: InterpretationCategory.ASPECT,
        planet: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.CONJUNCTION,
        sign: null,
        house: null,
      };
      mockRepo.findOne.mockResolvedValue(aspectInterpretation);

      const result = await repository.findAspect(
        Planet.SUN,
        Planet.MOON,
        AspectType.CONJUNCTION,
      );

      expect(result).toEqual(aspectInterpretation);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: [
          {
            category: InterpretationCategory.ASPECT,
            planet: Planet.SUN,
            planet2: Planet.MOON,
            aspectType: AspectType.CONJUNCTION,
            isActive: true,
          },
          {
            category: InterpretationCategory.ASPECT,
            planet: Planet.MOON,
            planet2: Planet.SUN,
            aspectType: AspectType.CONJUNCTION,
            isActive: true,
          },
        ],
      });
    });

    it('should find aspect interpretation in reverse direction', async () => {
      const aspectInterpretation = {
        ...mockInterpretation,
        category: InterpretationCategory.ASPECT,
        planet: Planet.MOON,
        planet2: Planet.SUN,
        aspectType: AspectType.CONJUNCTION,
        sign: null,
        house: null,
      };
      mockRepo.findOne.mockResolvedValue(aspectInterpretation);

      const result = await repository.findAspect(
        Planet.SUN,
        Planet.MOON,
        AspectType.CONJUNCTION,
      );

      expect(result).toEqual(aspectInterpretation);
    });

    it('should return null when aspect not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findAspect(
        Planet.SUN,
        Planet.MOON,
        AspectType.CONJUNCTION,
      );

      expect(result).toBeNull();
    });
  });

  describe('findAscendant', () => {
    it('should find ascendant interpretation for sign', async () => {
      const ascendantInterpretation = {
        ...mockInterpretation,
        category: InterpretationCategory.ASCENDANT,
        planet: null,
        sign: ZodiacSign.VIRGO,
        house: null,
      };
      mockRepo.findOne.mockResolvedValue(ascendantInterpretation);

      const result = await repository.findAscendant(ZodiacSign.VIRGO);

      expect(result).toEqual(ascendantInterpretation);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: {
          category: InterpretationCategory.ASCENDANT,
          sign: ZodiacSign.VIRGO,
          isActive: true,
        },
      });
    });

    it('should return null when ascendant interpretation not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findAscendant(ZodiacSign.VIRGO);

      expect(result).toBeNull();
    });
  });

  describe('findPlanetIntro', () => {
    it('should find planet introduction', async () => {
      const planetIntro = {
        ...mockInterpretation,
        category: InterpretationCategory.PLANET_INTRO,
        planet: Planet.SUN,
        sign: null,
        house: null,
      };
      mockRepo.findOne.mockResolvedValue(planetIntro);

      const result = await repository.findPlanetIntro(Planet.SUN);

      expect(result).toEqual(planetIntro);
      expect(mockRepo.findOne).toHaveBeenCalledWith({
        where: {
          category: InterpretationCategory.PLANET_INTRO,
          planet: Planet.SUN,
          isActive: true,
        },
      });
    });

    it('should return null when planet intro not found', async () => {
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findPlanetIntro(Planet.SUN);

      expect(result).toBeNull();
    });
  });

  describe('findBigThree', () => {
    it('should retrieve all big three interpretations', async () => {
      const sunInterpretation = {
        ...mockInterpretation,
        planet: Planet.SUN,
        sign: ZodiacSign.ARIES,
      };
      const moonInterpretation = {
        ...mockInterpretation,
        id: 2,
        planet: Planet.MOON,
        sign: ZodiacSign.TAURUS,
      };
      const ascendantInterpretation = {
        ...mockInterpretation,
        id: 3,
        category: InterpretationCategory.ASCENDANT,
        planet: null,
        sign: ZodiacSign.VIRGO,
      };

      mockRepo.findOne
        .mockResolvedValueOnce(sunInterpretation)
        .mockResolvedValueOnce(moonInterpretation)
        .mockResolvedValueOnce(ascendantInterpretation);

      const result = await repository.findBigThree(
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.VIRGO,
      );

      expect(result).toEqual({
        sun: sunInterpretation,
        moon: moonInterpretation,
        ascendant: ascendantInterpretation,
      });
      expect(mockRepo.findOne).toHaveBeenCalledTimes(3);
    });

    it('should handle missing interpretations in big three', async () => {
      mockRepo.findOne
        .mockResolvedValueOnce(mockInterpretation)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      const result = await repository.findBigThree(
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.VIRGO,
      );

      expect(result).toEqual({
        sun: mockInterpretation,
        moon: null,
        ascendant: null,
      });
    });
  });

  describe('findAllForChart', () => {
    it('should retrieve all interpretations for a complete chart', async () => {
      const planets = [
        {
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          house: 1,
        },
        {
          planet: Planet.MOON,
          sign: ZodiacSign.TAURUS,
          house: 2,
        },
      ];

      const aspects = [
        {
          planet1: Planet.SUN,
          planet2: Planet.MOON,
          aspectType: AspectType.CONJUNCTION,
        },
      ];

      const mockInterpretations = [
        { ...mockInterpretation, id: 1 },
        { ...mockInterpretation, id: 2 },
      ];

      mockRepo.find.mockResolvedValue(mockInterpretations);
      mockRepo.findOne.mockResolvedValue(mockInterpretation);

      const result = await repository.findAllForChart({
        planets,
        aspects,
        ascendantSign: ZodiacSign.VIRGO,
      });

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBeGreaterThan(0);
      expect(mockRepo.find).toHaveBeenCalled();
    });

    it('should handle chart with no aspects', async () => {
      const planets = [
        {
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          house: 1,
        },
      ];

      mockRepo.find.mockResolvedValue([mockInterpretation]);
      mockRepo.findOne.mockResolvedValue(mockInterpretation);

      const result = await repository.findAllForChart({
        planets,
        aspects: [],
        ascendantSign: ZodiacSign.VIRGO,
      });

      expect(result).toBeInstanceOf(Map);
    });

    it('should handle missing interpretations gracefully', async () => {
      const planets = [
        {
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          house: 1,
        },
      ];

      mockRepo.find.mockResolvedValue([]);
      mockRepo.findOne.mockResolvedValue(null);

      const result = await repository.findAllForChart({
        planets,
        aspects: [],
        ascendantSign: ZodiacSign.VIRGO,
      });

      expect(result).toBeInstanceOf(Map);
      expect(result.size).toBe(0);
    });

    it('should generate correct keys for all interpretation types', async () => {
      const planets = [
        {
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          house: 1,
        },
      ];

      const aspects = [
        {
          planet1: Planet.SUN,
          planet2: Planet.MOON,
          aspectType: AspectType.CONJUNCTION,
        },
      ];

      // Mock diferentes tipos de interpretaciones
      const mockPlanetInSign = {
        ...mockInterpretation,
        category: InterpretationCategory.PLANET_IN_SIGN,
        planet: Planet.SUN,
        sign: ZodiacSign.ARIES,
      };

      const mockPlanetInHouse = {
        ...mockInterpretation,
        category: InterpretationCategory.PLANET_IN_HOUSE,
        planet: Planet.SUN,
        house: 1,
      };

      const mockAscendant = {
        ...mockInterpretation,
        category: InterpretationCategory.ASCENDANT,
        sign: ZodiacSign.VIRGO,
      };

      const mockAspect = {
        ...mockInterpretation,
        category: InterpretationCategory.ASPECT,
        planet: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.CONJUNCTION,
      };

      // Setup mocks para retornar las interpretaciones correctas
      mockRepo.find.mockResolvedValue([mockInterpretation]); // PLANET_INTRO
      mockRepo.findOne.mockImplementation((options: unknown) => {
        const opts = options as Record<string, unknown>;
        const where = opts.where as Record<string, unknown>;
        if (where.category === InterpretationCategory.PLANET_IN_SIGN) {
          return Promise.resolve(mockPlanetInSign);
        }
        if (where.category === InterpretationCategory.PLANET_IN_HOUSE) {
          return Promise.resolve(mockPlanetInHouse);
        }
        if (where.category === InterpretationCategory.ASCENDANT) {
          return Promise.resolve(mockAscendant);
        }
        // Para aspectos (bidireccional)
        if (Array.isArray(where)) {
          return Promise.resolve(mockAspect);
        }
        return Promise.resolve(null);
      });

      const result = await repository.findAllForChart({
        planets,
        aspects,
        ascendantSign: ZodiacSign.VIRGO,
      });

      // Verificar que las keys se generan correctamente
      const expectedPlanetInSignKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_SIGN,
        Planet.SUN,
        ZodiacSign.ARIES,
      );
      const expectedPlanetInHouseKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.PLANET_IN_HOUSE,
        Planet.SUN,
        null,
        1,
      );
      const expectedAscendantKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.ASCENDANT,
        null,
        ZodiacSign.VIRGO,
      );
      const expectedAspectKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.ASPECT,
        Planet.SUN,
        null,
        null,
        AspectType.CONJUNCTION,
        Planet.MOON,
      );

      expect(result.has(expectedPlanetInSignKey)).toBe(true);
      expect(result.has(expectedPlanetInHouseKey)).toBe(true);
      expect(result.has(expectedAscendantKey)).toBe(true);
      expect(result.has(expectedAspectKey)).toBe(true);

      // Verificar que las interpretaciones son las correctas
      expect(result.get(expectedPlanetInSignKey)).toEqual(mockPlanetInSign);
      expect(result.get(expectedPlanetInHouseKey)).toEqual(mockPlanetInHouse);
      expect(result.get(expectedAscendantKey)).toEqual(mockAscendant);
      expect(result.get(expectedAspectKey)).toEqual(mockAspect);
    });

    it('should use request params for aspect keys even when found in reverse order', async () => {
      const aspects = [
        {
          planet1: Planet.SUN,
          planet2: Planet.MOON,
          aspectType: AspectType.CONJUNCTION,
        },
      ];

      // Mock de aspecto almacenado en orden inverso (Luna-Sol)
      const mockAspectReverse = {
        ...mockInterpretation,
        category: InterpretationCategory.ASPECT,
        planet: Planet.MOON, // Orden inverso en DB
        planet2: Planet.SUN,
        aspectType: AspectType.CONJUNCTION,
      };

      mockRepo.find.mockResolvedValue([]);
      mockRepo.findOne.mockImplementation((options: unknown) => {
        const opts = options as Record<string, unknown>;
        if (Array.isArray(opts.where)) {
          return Promise.resolve(mockAspectReverse);
        }
        return Promise.resolve(null);
      });

      const result = await repository.findAllForChart({
        planets: [],
        aspects,
        ascendantSign: ZodiacSign.VIRGO,
      });

      // La key debe usar el orden del request (Sol-Luna), no el de DB (Luna-Sol)
      const expectedKey = BirthChartInterpretation.generateKey(
        InterpretationCategory.ASPECT,
        Planet.SUN, // Del request
        null,
        null,
        AspectType.CONJUNCTION,
        Planet.MOON, // Del request
      );

      expect(result.has(expectedKey)).toBe(true);
      expect(result.get(expectedKey)).toEqual(mockAspectReverse);
    });
  });

  describe('countByCategory', () => {
    it('should return count of interpretations by category', async () => {
      const mockCounts = [
        { category: InterpretationCategory.PLANET_INTRO, count: '10' },
        { category: InterpretationCategory.PLANET_IN_SIGN, count: '120' },
        { category: InterpretationCategory.PLANET_IN_HOUSE, count: '120' },
        { category: InterpretationCategory.ASCENDANT, count: '12' },
        { category: InterpretationCategory.ASPECT, count: '225' },
      ];

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue(mockCounts),
      };

      mockRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<BirthChartInterpretation>,
      );

      const result = await repository.countByCategory();

      expect(result).toEqual({
        [InterpretationCategory.PLANET_INTRO]: 10,
        [InterpretationCategory.PLANET_IN_SIGN]: 120,
        [InterpretationCategory.PLANET_IN_HOUSE]: 120,
        [InterpretationCategory.ASCENDANT]: 12,
        [InterpretationCategory.ASPECT]: 225,
      });
      expect(mockQueryBuilder.groupBy).toHaveBeenCalledWith('interp.category');
    });

    it('should handle empty results', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      };

      mockRepo.createQueryBuilder.mockReturnValue(
        mockQueryBuilder as unknown as SelectQueryBuilder<BirthChartInterpretation>,
      );

      const result = await repository.countByCategory();

      expect(result).toEqual({});
    });
  });
});
