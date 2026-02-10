import { Test, TestingModule } from '@nestjs/testing';
import { ChartInterpretationService } from './chart-interpretation.service';
import {
  IBirthChartInterpretationRepository,
  BIRTH_CHART_INTERPRETATION_REPOSITORY,
} from '../../domain/interfaces';
import { BirthChartInterpretation } from '../../entities/birth-chart-interpretation.entity';
import {
  Planet,
  ZodiacSign,
  AspectType,
  InterpretationCategory,
} from '../../domain/enums';
import {
  ChartData,
  PlanetPosition,
  ChartAspect,
  HouseCusp,
  ChartDistribution,
} from '../../entities/birth-chart.entity';

describe('ChartInterpretationService', () => {
  let service: ChartInterpretationService;
  let mockInterpretationRepo: jest.Mocked<IBirthChartInterpretationRepository>;

  // Mocks de interpretaciones
  const mockSunInAriesInterpretation: BirthChartInterpretation = {
    id: 1,
    category: InterpretationCategory.PLANET_IN_SIGN,
    planet: Planet.SUN,
    sign: ZodiacSign.ARIES,
    house: null,
    aspectType: null,
    planet2: null,
    content:
      'Tu Sol en Aries representa energía emprendedora, valentía y liderazgo natural.',
    summary: 'Liderazgo y valentía',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BirthChartInterpretation;

  const mockMoonInTaurusInterpretation: BirthChartInterpretation = {
    id: 2,
    category: InterpretationCategory.PLANET_IN_SIGN,
    planet: Planet.MOON,
    sign: ZodiacSign.TAURUS,
    house: null,
    aspectType: null,
    planet2: null,
    content:
      'Tu Luna en Tauro busca seguridad emocional, estabilidad y placeres sensoriales.',
    summary: 'Estabilidad emocional',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BirthChartInterpretation;

  const mockAscendantLeoInterpretation: BirthChartInterpretation = {
    id: 3,
    category: InterpretationCategory.ASCENDANT,
    planet: null,
    sign: ZodiacSign.LEO,
    house: null,
    aspectType: null,
    planet2: null,
    content:
      'Tu Ascendente en Leo proyecta carisma, confianza y presencia magnética.',
    summary: 'Carisma natural',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BirthChartInterpretation;

  const mockPlanetIntroSun: BirthChartInterpretation = {
    id: 10,
    category: InterpretationCategory.PLANET_INTRO,
    planet: Planet.SUN,
    sign: null,
    house: null,
    aspectType: null,
    planet2: null,
    content:
      'El Sol representa tu esencia, tu identidad central y tu propósito vital.',
    summary: 'Identidad y propósito',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BirthChartInterpretation;

  const mockSunInHouse1: BirthChartInterpretation = {
    id: 11,
    category: InterpretationCategory.PLANET_IN_HOUSE,
    planet: Planet.SUN,
    sign: null,
    house: 1,
    aspectType: null,
    planet2: null,
    content:
      'El Sol en Casa 1 enfatiza tu personalidad, presencia y cómo te proyectas al mundo.',
    summary: 'Presencia fuerte',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BirthChartInterpretation;

  const mockAspectSunConjunctionMoon: BirthChartInterpretation = {
    id: 20,
    category: InterpretationCategory.ASPECT,
    planet: Planet.SUN,
    sign: null,
    house: null,
    aspectType: AspectType.CONJUNCTION,
    planet2: Planet.MOON,
    content:
      'La conjunción Sol-Luna indica unidad entre tu yo consciente y tus emociones.',
    summary: 'Unidad interna',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as BirthChartInterpretation;

  // Mock de ChartData completo
  const mockChartData: ChartData = {
    planets: [
      {
        planet: Planet.SUN,
        longitude: 15.5,
        sign: ZodiacSign.ARIES,
        signDegree: 15.5,
        house: 1,
        isRetrograde: false,
      },
      {
        planet: Planet.MOON,
        longitude: 45.3,
        sign: ZodiacSign.TAURUS,
        signDegree: 15.3,
        house: 2,
        isRetrograde: false,
      },
      {
        planet: Planet.MERCURY,
        longitude: 30.0,
        sign: ZodiacSign.TAURUS,
        signDegree: 0.0,
        house: 1,
        isRetrograde: true,
      },
    ] as PlanetPosition[],
    houses: [
      { house: 1, longitude: 0, sign: ZodiacSign.ARIES, signDegree: 0 },
      { house: 2, longitude: 30, sign: ZodiacSign.TAURUS, signDegree: 0 },
    ] as HouseCusp[],
    aspects: [
      {
        planet1: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.CONJUNCTION,
        angle: 29.8,
        orb: 0.2,
        isApplying: true,
      },
    ] as ChartAspect[],
    ascendant: {
      planet: 'ascendant',
      longitude: 120.0,
      sign: ZodiacSign.LEO,
      signDegree: 0.0,
      house: 1,
      isRetrograde: false,
    } as PlanetPosition,
    midheaven: {
      planet: 'midheaven',
      longitude: 210.0,
      sign: ZodiacSign.SCORPIO,
      signDegree: 0.0,
      house: 10,
      isRetrograde: false,
    } as PlanetPosition,
    distribution: {
      elements: { fire: 4, earth: 3, air: 2, water: 2 },
      modalities: { cardinal: 3, fixed: 5, mutable: 3 },
      polarity: { masculine: 6, feminine: 5 },
    } as ChartDistribution,
  };

  beforeEach(async () => {
    // Mock del repositorio
    mockInterpretationRepo = {
      findPlanetInSign: jest.fn(),
      findPlanetInHouse: jest.fn(),
      findAspect: jest.fn(),
      findAscendant: jest.fn(),
      findPlanetIntro: jest.fn(),
      findBigThree: jest.fn(),
      findAllForChart: jest.fn(),
      countByCategory: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartInterpretationService,
        {
          provide: BIRTH_CHART_INTERPRETATION_REPOSITORY,
          useValue: mockInterpretationRepo,
        },
      ],
    }).compile();

    service = module.get<ChartInterpretationService>(
      ChartInterpretationService,
    );
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateBigThreeInterpretation', () => {
    it('should generate Big Three interpretation with existing data', async () => {
      // Arrange
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.LEO,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.sun.sign).toBe(ZodiacSign.ARIES);
      expect(result.sun.signName).toBe('Aries');
      expect(result.sun.interpretation).toBe(
        mockSunInAriesInterpretation.content,
      );
      expect(result.moon.sign).toBe(ZodiacSign.TAURUS);
      expect(result.moon.interpretation).toBe(
        mockMoonInTaurusInterpretation.content,
      );
      expect(result.ascendant.sign).toBe(ZodiacSign.LEO);
      expect(result.ascendant.interpretation).toBe(
        mockAscendantLeoInterpretation.content,
      );
      expect(mockInterpretationRepo.findBigThree).toHaveBeenCalledWith(
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.LEO,
      );
    });

    it('should provide default interpretations when DB data is missing', async () => {
      // Arrange
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: null,
        moon: null,
        ascendant: null,
      });

      // Act
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.ARIES,
        ZodiacSign.TAURUS,
        ZodiacSign.LEO,
      );

      // Assert
      expect(result).toBeDefined();
      expect(result.sun.interpretation).toContain('Sol en Aries');
      expect(result.moon.interpretation).toContain('Luna en Tauro');
      expect(result.ascendant.interpretation).toContain('Ascendente en Leo');
    });
  });

  describe('generateFullInterpretation', () => {
    it('should generate full chart interpretation', async () => {
      // Arrange
      const mockInterpretationsMap = new Map<
        string,
        BirthChartInterpretation
      >();
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_IN_SIGN}:${Planet.SUN}:${ZodiacSign.ARIES}:::`,
        mockSunInAriesInterpretation,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_IN_SIGN}:${Planet.MOON}:${ZodiacSign.TAURUS}:::`,
        mockMoonInTaurusInterpretation,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.ASCENDANT}::${ZodiacSign.LEO}:::`,
        mockAscendantLeoInterpretation,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_INTRO}:${Planet.SUN}::::`,
        mockPlanetIntroSun,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_IN_HOUSE}:${Planet.SUN}::1::`,
        mockSunInHouse1,
      );

      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        mockInterpretationsMap,
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(mockChartData);

      // Assert
      expect(result).toBeDefined();
      expect(result.bigThree).toBeDefined();
      expect(result.planets).toBeDefined();
      expect(result.planets.length).toBe(3);
      expect(result.distribution).toBeDefined();
      expect(result.aspectSummary).toBeDefined();
      expect(mockInterpretationRepo.findAllForChart).toHaveBeenCalled();
    });

    it('should calculate distribution percentages correctly', async () => {
      // Arrange
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(mockChartData);

      // Assert
      expect(result.distribution.elements).toHaveLength(4);
      expect(result.distribution.modalities).toHaveLength(3);
      // fire: 4/11 = 36%
      const fireElement = result.distribution.elements.find(
        (e) => e.name === 'Fuego',
      );
      expect(fireElement).toBeDefined();
      expect(fireElement!.count).toBe(4);
      expect(fireElement!.percentage).toBe(36);
    });

    it('should build planet interpretations with all data', async () => {
      // Arrange
      const mockInterpretationsMap = new Map<
        string,
        BirthChartInterpretation
      >();
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_INTRO}:${Planet.SUN}::::`,
        mockPlanetIntroSun,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_IN_SIGN}:${Planet.SUN}:${ZodiacSign.ARIES}:::`,
        mockSunInAriesInterpretation,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.PLANET_IN_HOUSE}:${Planet.SUN}::1::`,
        mockSunInHouse1,
      );
      mockInterpretationsMap.set(
        `${InterpretationCategory.ASPECT}:${Planet.SUN}:::${AspectType.CONJUNCTION}:${Planet.MOON}`,
        mockAspectSunConjunctionMoon,
      );

      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        mockInterpretationsMap,
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(mockChartData);

      // Assert
      const sunInterpretation = result.planets.find(
        (p) => p.planet === Planet.SUN,
      );
      expect(sunInterpretation).toBeDefined();
      expect(sunInterpretation!.intro).toBe(mockPlanetIntroSun.content);
      expect(sunInterpretation!.inSign).toBe(
        mockSunInAriesInterpretation.content,
      );
      expect(sunInterpretation!.inHouse).toBe(mockSunInHouse1.content);
      expect(sunInterpretation!.aspects).toBeDefined();
      expect(sunInterpretation!.aspects!.length).toBe(1);
    });

    it('should calculate aspect summary correctly', async () => {
      // Arrange
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(mockChartData);

      // Assert
      expect(result.aspectSummary.total).toBe(1);
      expect(result.aspectSummary.strongest).toBeDefined();
      expect(result.aspectSummary.strongest!.orb).toBe(0.2);
    });

    it('should handle planets with retrograde status', async () => {
      // Arrange
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(mockChartData);

      // Assert
      const mercuryInterpretation = result.planets.find(
        (p) => p.planet === Planet.MERCURY,
      );
      expect(mercuryInterpretation).toBeDefined();
      expect(mercuryInterpretation!.isRetrograde).toBe(true);
    });

    it('should handle missing interpretations gracefully', async () => {
      // Arrange
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(mockChartData);

      // Assert
      expect(result.planets).toBeDefined();
      expect(result.planets.length).toBe(3);
      // Interpretaciones deben ser undefined si no están en el mapa
      const mercuryInterpretation = result.planets.find(
        (p) => p.planet === Planet.MERCURY,
      );
      expect(mercuryInterpretation!.intro).toBeUndefined();
      expect(mercuryInterpretation!.inSign).toBeUndefined();
    });

    it('should filter out aspects with non-Planet enum values (e.g., ascendant)', async () => {
      // Arrange
      const chartWithAscendantAspect: ChartData = {
        ...mockChartData,
        aspects: [
          {
            planet1: Planet.SUN,
            planet2: Planet.MOON,
            aspectType: AspectType.CONJUNCTION,
            angle: 29.8,
            orb: 0.2,
            isApplying: true,
          },
          {
            planet1: 'ascendant' as Planet, // No es un Planet enum válido
            planet2: Planet.SUN,
            aspectType: AspectType.SEXTILE,
            angle: 60.0,
            orb: 1.5,
            isApplying: false,
          },
        ] as ChartAspect[],
      };
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(
        chartWithAscendantAspect,
      );

      // Assert
      expect(result.aspectSummary.total).toBe(1); // Solo el aspecto válido Sun-Moon
      const sunInterpretation = result.planets.find(
        (p) => p.planet === Planet.SUN,
      );
      expect(sunInterpretation).toBeDefined();
      expect(sunInterpretation!.aspects).toHaveLength(1); // Solo un aspecto válido
      expect(sunInterpretation!.aspects![0].planet1).toBe(Planet.SUN);
      expect(sunInterpretation!.aspects![0].planet2).toBe(Planet.MOON);
    });
  });

  describe('edge cases', () => {
    it('should handle empty aspects array', async () => {
      // Arrange
      const chartWithNoAspects: ChartData = {
        ...mockChartData,
        aspects: [],
      };
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result =
        await service.generateFullInterpretation(chartWithNoAspects);

      // Assert
      expect(result.aspectSummary.total).toBe(0);
      expect(result.aspectSummary.strongest).toBeUndefined();
    });

    it('should handle distribution with zero values', async () => {
      // Arrange
      const chartWithZeroElements: ChartData = {
        ...mockChartData,
        distribution: {
          elements: { fire: 0, earth: 11, air: 0, water: 0 },
          modalities: { cardinal: 11, fixed: 0, mutable: 0 },
          polarity: { masculine: 0, feminine: 11 },
        },
      };
      mockInterpretationRepo.findAllForChart.mockResolvedValue(
        new Map<string, BirthChartInterpretation>(),
      );
      mockInterpretationRepo.findBigThree.mockResolvedValue({
        sun: mockSunInAriesInterpretation,
        moon: mockMoonInTaurusInterpretation,
        ascendant: mockAscendantLeoInterpretation,
      });

      // Act
      const result = await service.generateFullInterpretation(
        chartWithZeroElements,
      );

      // Assert
      const fireElement = result.distribution.elements.find(
        (e) => e.name === 'Fuego',
      );
      expect(fireElement!.count).toBe(0);
      expect(fireElement!.percentage).toBe(0);
    });
  });
});
