import { Test, TestingModule } from '@nestjs/testing';
import { ChartCalculationService } from './chart-calculation.service';
import { EphemerisWrapper } from '../../infrastructure/ephemeris/ephemeris.wrapper';
import { PlanetPositionService } from './planet-position.service';
import { HouseCuspService } from './house-cusp.service';
import { AspectCalculationService } from './aspect-calculation.service';
import { ZodiacSign, Planet, AspectType } from '../../domain/enums';
import {
  ChartData,
  PlanetPosition,
  ChartDistribution,
  ChartAspect,
} from '../../entities/birth-chart.entity';

describe('ChartCalculationService', () => {
  let service: ChartCalculationService;
  let mockEphemeris: Partial<EphemerisWrapper>;
  let mockPlanetService: Partial<PlanetPositionService>;
  let mockHouseService: Partial<HouseCuspService>;
  let mockAspectService: Partial<AspectCalculationService>;

  beforeEach(async () => {
    // Mock EphemerisWrapper
    mockEphemeris = {
      calculate: jest.fn(),
      validateDate: jest.fn().mockReturnValue(true),
      validateCoordinates: jest.fn().mockReturnValue(true),
    };

    // Mock PlanetPositionService
    mockPlanetService = {
      calculatePositions: jest.fn(),
      calculateAscendant: jest.fn(),
      calculateMidheaven: jest.fn(),
      getBigThree: jest.fn(),
    };

    // Mock HouseCuspService
    mockHouseService = {
      calculateCusps: jest.fn(),
    };

    // Mock AspectCalculationService
    mockAspectService = {
      calculateAspects: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartCalculationService,
        { provide: EphemerisWrapper, useValue: mockEphemeris },
        { provide: PlanetPositionService, useValue: mockPlanetService },
        { provide: HouseCuspService, useValue: mockHouseService },
        { provide: AspectCalculationService, useValue: mockAspectService },
      ],
    }).compile();

    service = module.get<ChartCalculationService>(ChartCalculationService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateChart', () => {
    const mockInput = {
      birthDate: new Date('1990-05-15'),
      birthTime: '14:30',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    };

    const mockEphemerisOutput = {
      planets: [
        {
          name: 'sun',
          longitude: 54.5,
          latitude: 0,
          distance: 1.0,
          longitudeSpeed: 1.0,
        },
        {
          name: 'moon',
          longitude: 225.3,
          latitude: 0,
          distance: 0.002,
          longitudeSpeed: 13.2,
        },
      ],
      houses: {
        cusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
        ascendant: 15,
        midheaven: 285,
      },
      julianDay: 2448046.1041667,
      siderealTime: 12.5,
    };

    const mockPlanetPositions: PlanetPosition[] = [
      {
        planet: Planet.SUN,
        longitude: 54.5,
        sign: ZodiacSign.GEMINI,
        signDegree: 24.5,
        house: 3,
        isRetrograde: false,
      },
      {
        planet: Planet.MOON,
        longitude: 225.3,
        sign: ZodiacSign.SCORPIO,
        signDegree: 15.3,
        house: 8,
        isRetrograde: false,
      },
      {
        planet: Planet.MERCURY,
        longitude: 60.0,
        sign: ZodiacSign.GEMINI,
        signDegree: 0.0,
        house: 3,
        isRetrograde: false,
      },
      {
        planet: Planet.VENUS,
        longitude: 90.0,
        sign: ZodiacSign.CANCER,
        signDegree: 0.0,
        house: 4,
        isRetrograde: false,
      },
      {
        planet: Planet.MARS,
        longitude: 120.0,
        sign: ZodiacSign.LEO,
        signDegree: 0.0,
        house: 5,
        isRetrograde: false,
      },
      {
        planet: Planet.JUPITER,
        longitude: 150.0,
        sign: ZodiacSign.VIRGO,
        signDegree: 0.0,
        house: 6,
        isRetrograde: false,
      },
      {
        planet: Planet.SATURN,
        longitude: 180.0,
        sign: ZodiacSign.LIBRA,
        signDegree: 0.0,
        house: 7,
        isRetrograde: false,
      },
      {
        planet: Planet.URANUS,
        longitude: 210.0,
        sign: ZodiacSign.SCORPIO,
        signDegree: 0.0,
        house: 8,
        isRetrograde: false,
      },
      {
        planet: Planet.NEPTUNE,
        longitude: 240.0,
        sign: ZodiacSign.SAGITTARIUS,
        signDegree: 0.0,
        house: 9,
        isRetrograde: false,
      },
      {
        planet: Planet.PLUTO,
        longitude: 270.0,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 0.0,
        house: 10,
        isRetrograde: false,
      },
    ];

    const mockHouseCusps = [
      { house: 1, longitude: 15, sign: ZodiacSign.ARIES, signDegree: 15 },
      { house: 2, longitude: 45, sign: ZodiacSign.TAURUS, signDegree: 15 },
      { house: 3, longitude: 75, sign: ZodiacSign.GEMINI, signDegree: 15 },
      { house: 4, longitude: 105, sign: ZodiacSign.CANCER, signDegree: 15 },
      { house: 5, longitude: 135, sign: ZodiacSign.LEO, signDegree: 15 },
      { house: 6, longitude: 165, sign: ZodiacSign.VIRGO, signDegree: 15 },
      { house: 7, longitude: 195, sign: ZodiacSign.LIBRA, signDegree: 15 },
      { house: 8, longitude: 225, sign: ZodiacSign.SCORPIO, signDegree: 15 },
      {
        house: 9,
        longitude: 255,
        sign: ZodiacSign.SAGITTARIUS,
        signDegree: 15,
      },
      {
        house: 10,
        longitude: 285,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 15,
      },
      {
        house: 11,
        longitude: 315,
        sign: ZodiacSign.AQUARIUS,
        signDegree: 15,
      },
      { house: 12, longitude: 345, sign: ZodiacSign.PISCES, signDegree: 15 },
    ];

    const mockAscendant: PlanetPosition = {
      planet: 'ascendant',
      longitude: 15,
      sign: ZodiacSign.ARIES,
      signDegree: 15,
      house: 1,
      isRetrograde: false,
    };

    const mockMidheaven: PlanetPosition = {
      planet: 'midheaven',
      longitude: 285,
      sign: ZodiacSign.CAPRICORN,
      signDegree: 15,
      house: 10,
      isRetrograde: false,
    };

    const mockAspects = [
      {
        planet1: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.TRINE,
        angle: 120,
        orb: 0.8,
        isApplying: true,
      },
    ];

    const mockBigThree = {
      sun: ZodiacSign.GEMINI,
      moon: ZodiacSign.SCORPIO,
      ascendant: ZodiacSign.ARIES,
    };

    beforeEach(() => {
      (mockEphemeris.calculate as jest.Mock).mockReturnValue(
        mockEphemerisOutput,
      );
      (mockPlanetService.calculatePositions as jest.Mock).mockReturnValue(
        mockPlanetPositions,
      );
      (mockHouseService.calculateCusps as jest.Mock).mockReturnValue(
        mockHouseCusps,
      );
      (mockPlanetService.calculateAscendant as jest.Mock).mockReturnValue(
        mockAscendant,
      );
      (mockPlanetService.calculateMidheaven as jest.Mock).mockReturnValue(
        mockMidheaven,
      );
      (mockAspectService.calculateAspects as jest.Mock).mockReturnValue(
        mockAspects,
      );
      (mockPlanetService.getBigThree as jest.Mock).mockReturnValue(
        mockBigThree,
      );
    });

    it('should calculate a complete birth chart successfully', () => {
      const result = service.calculateChart(mockInput);

      expect(result).toBeDefined();
      expect(result.chartData).toBeDefined();
      expect(result.sunSign).toBe(ZodiacSign.GEMINI);
      expect(result.moonSign).toBe(ZodiacSign.SCORPIO);
      expect(result.ascendantSign).toBe(ZodiacSign.ARIES);
      expect(result.calculationTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('should call ephemeris.calculate with correct parameters (UTC, not local time)', () => {
      // mockInput: 1990-05-15 14:30 America/Argentina/Buenos_Aires (UTC-3)
      // Expected UTC: 14:30 + 3h = 17:30
      service.calculateChart(mockInput);

      expect(mockEphemeris.calculate).toHaveBeenCalledWith({
        year: 1990,
        month: 5,
        day: 15,
        hour: 17,
        minute: 30,
        latitude: -34.6037,
        longitude: -58.3816,
      });
    });

    it('should validate date and coordinates before calculation', () => {
      service.calculateChart(mockInput);

      expect(mockEphemeris.validateDate).toHaveBeenCalledWith(1990);
      expect(mockEphemeris.validateCoordinates).toHaveBeenCalledWith(
        -34.6037,
        -58.3816,
      );
    });

    it('should throw error if year is invalid', () => {
      (mockEphemeris.validateDate as jest.Mock).mockReturnValue(false);

      expect(() => service.calculateChart(mockInput)).toThrow(
        'Invalid year: 1990',
      );
    });

    it('should throw error if coordinates are invalid', () => {
      (mockEphemeris.validateCoordinates as jest.Mock).mockReturnValue(false);

      expect(() => service.calculateChart(mockInput)).toThrow(
        'Invalid coordinates',
      );
    });

    it('should call planetService.calculatePositions with ephemeris output', () => {
      service.calculateChart(mockInput);

      expect(mockPlanetService.calculatePositions).toHaveBeenCalledWith(
        mockEphemerisOutput.planets,
        mockEphemerisOutput.houses,
      );
    });

    it('should call houseService.calculateCusps with ephemeris output', () => {
      service.calculateChart(mockInput);

      expect(mockHouseService.calculateCusps).toHaveBeenCalledWith(
        mockEphemerisOutput.houses,
      );
    });

    it('should call planetService.calculateAscendant', () => {
      service.calculateChart(mockInput);

      expect(mockPlanetService.calculateAscendant).toHaveBeenCalledWith(15);
    });

    it('should call planetService.calculateMidheaven', () => {
      service.calculateChart(mockInput);

      expect(mockPlanetService.calculateMidheaven).toHaveBeenCalledWith(285);
    });

    it('should call aspectService.calculateAspects with planets and ascendant', () => {
      service.calculateChart(mockInput);

      expect(mockAspectService.calculateAspects).toHaveBeenCalledWith(
        mockPlanetPositions,
        mockAscendant,
      );
    });

    it('should call planetService.getBigThree', () => {
      service.calculateChart(mockInput);

      expect(mockPlanetService.getBigThree).toHaveBeenCalledWith(
        mockPlanetPositions,
        mockAscendant,
      );
    });

    it('should return chartData with all components', () => {
      const result = service.calculateChart(mockInput);

      expect(result.chartData.planets).toEqual(mockPlanetPositions);
      expect(result.chartData.houses).toEqual(mockHouseCusps);
      expect(result.chartData.aspects).toEqual(mockAspects);
      expect(result.chartData.ascendant).toEqual(mockAscendant);
      expect(result.chartData.midheaven).toEqual(mockMidheaven);
      expect(result.chartData.distribution).toBeDefined();
    });

    it('should calculate distribution correctly', () => {
      const result = service.calculateChart(mockInput);

      expect(result.chartData.distribution).toBeDefined();
      expect(result.chartData.distribution.elements).toBeDefined();
      expect(result.chartData.distribution.modalities).toBeDefined();
      expect(result.chartData.distribution.polarity).toBeDefined();
    });

    it('should set aiSynthesis as undefined initially', () => {
      const result = service.calculateChart(mockInput);

      expect(result.chartData.aiSynthesis).toBeUndefined();
    });

    it('should parse birthTime with seconds correctly', () => {
      const inputWithSeconds = { ...mockInput, birthTime: '14:30:45' };
      service.calculateChart(inputWithSeconds);

      // 14:30 America/Argentina/Buenos_Aires (UTC-3) → 17:30 UTC
      expect(mockEphemeris.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          hour: 17,
          minute: 30,
        }),
      );
    });

    it('should handle midnight (00:00) correctly', () => {
      const midnightInput = { ...mockInput, birthTime: '00:00' };
      service.calculateChart(midnightInput);

      // 00:00 America/Argentina/Buenos_Aires (UTC-3) → 03:00 UTC
      expect(mockEphemeris.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          hour: 3,
          minute: 0,
        }),
      );
    });

    it('should handle noon (12:00) correctly', () => {
      const noonInput = { ...mockInput, birthTime: '12:00' };
      service.calculateChart(noonInput);

      // 12:00 America/Argentina/Buenos_Aires (UTC-3) → 15:00 UTC
      expect(mockEphemeris.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          hour: 15,
          minute: 0,
        }),
      );
    });

    it('should throw error if ephemeris calculation fails', () => {
      (mockEphemeris.calculate as jest.Mock).mockImplementation(() => {
        throw new Error('Ephemeris error');
      });

      expect(() => service.calculateChart(mockInput)).toThrow(
        'Chart calculation failed: Ephemeris error',
      );
    });

    it('should measure calculation time accurately', () => {
      const result = service.calculateChart(mockInput);

      expect(result.calculationTimeMs).toBeGreaterThanOrEqual(0);
      expect(result.calculationTimeMs).toBeLessThan(1000); // Should be fast
    });

    it('REGRESIÓN BUG-TZ: pasa hora UTC (no local) a Swiss Ephemeris para Argentina', () => {
      const input: import('./chart-calculation.service').ChartCalculationInput =
        {
          birthDate: new Date(Date.UTC(2011, 9, 18)),
          birthTime: '01:07',
          latitude: -31.4,
          longitude: -64.183,
          timezone: 'America/Argentina/Cordoba',
        };

      service.calculateChart(input);

      // 01:07 America/Argentina/Cordoba (UTC-3) → 04:07 UTC
      expect(mockEphemeris.calculate).toHaveBeenCalledWith(
        expect.objectContaining({
          year: 2011,
          month: 10,
          day: 18,
          hour: 4,
          minute: 7,
        }),
      );
    });
  });

  describe('getChartSummary', () => {
    it('should generate a summary of the chart', () => {
      const mockResult = {
        chartData: {
          planets: [{}, {}] as unknown as PlanetPosition[],
          houses: [],
          aspects: [{}, {}, {}] as unknown as ChartAspect[],
          ascendant: {} as unknown as PlanetPosition,
          midheaven: {} as unknown as PlanetPosition,
          distribution: {
            elements: { fire: 3, earth: 2, air: 4, water: 2 },
            modalities: { cardinal: 4, fixed: 3, mutable: 4 },
            polarity: { masculine: 7, feminine: 4 },
          },
        },
        sunSign: ZodiacSign.GEMINI,
        moonSign: ZodiacSign.SCORPIO,
        ascendantSign: ZodiacSign.ARIES,
        calculationTimeMs: 50,
      };

      const summary = service.getChartSummary(mockResult);

      expect(summary).toContain('Sol en gemini');
      expect(summary).toContain('Luna en scorpio');
      expect(summary).toContain('Ascendente en aries');
      expect(summary).toContain('Planetas: 2');
      expect(summary).toContain('Aspectos: 3');
      expect(summary).toContain('Fuego=3');
      expect(summary).toContain('Tierra=2');
      expect(summary).toContain('Aire=4');
      expect(summary).toContain('Agua=2');
    });
  });

  describe('calculateDistribution (T-CA-057: MC incluido)', () => {
    const makePlanet = (sign: ZodiacSign): PlanetPosition => ({
      planet: 'sun',
      sign,
      signDegree: 15,
      longitude: 15,
      house: 1,
      isRetrograde: false,
    });

    it('should count 12 points total (10 planets + AC + MC)', () => {
      const planets = Array(10)
        .fill(null)
        .map(() => makePlanet(ZodiacSign.ARIES));
      const ascendant = makePlanet(ZodiacSign.ARIES);
      const midheaven = makePlanet(ZodiacSign.ARIES);

      const dist = (
        service as unknown as {
          calculateDistribution: (
            p: PlanetPosition[],
            a: PlanetPosition,
            m: PlanetPosition,
          ) => ChartDistribution;
        }
      ).calculateDistribution(planets, ascendant, midheaven);

      const total =
        dist.elements.fire +
        dist.elements.earth +
        dist.elements.air +
        dist.elements.water;
      expect(total).toBe(12);
      expect(dist.elements.fire).toBe(12); // todos en Aries (fuego)
    });

    it('should count MC polarity in distribution', () => {
      const planets = Array(10)
        .fill(null)
        .map(() => makePlanet(ZodiacSign.TAURUS)); // tierra = femenino
      const ascendant = makePlanet(ZodiacSign.TAURUS);
      const midheaven = makePlanet(ZodiacSign.ARIES); // fuego = masculino

      const dist = (
        service as unknown as {
          calculateDistribution: (
            p: PlanetPosition[],
            a: PlanetPosition,
            m: PlanetPosition,
          ) => ChartDistribution;
        }
      ).calculateDistribution(planets, ascendant, midheaven);

      expect(dist.polarity.masculine).toBe(1); // solo el MC en Aries
      expect(dist.polarity.feminine).toBe(11); // 10 planetas + AC en Tauro
    });
  });

  describe('validateChartData', () => {
    it('should validate chart with correct data', () => {
      const mockChartData: Partial<ChartData> = {
        planets: new Array(10).fill({}),
        houses: new Array(12).fill({}),
        aspects: [],
        ascendant: {} as unknown as PlanetPosition,
        midheaven: {} as unknown as PlanetPosition,
        distribution: {
          elements: { fire: 0, earth: 0, air: 0, water: 0 },
          modalities: { cardinal: 0, fixed: 0, mutable: 0 },
          polarity: { masculine: 0, feminine: 0 },
        },
      };

      const result = service.validateChartData(
        mockChartData as unknown as ChartData,
      );

      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect invalid number of planets', () => {
      const mockChartData: Partial<ChartData> = {
        planets: new Array(5).fill({}),
        houses: new Array(12).fill({}),
        aspects: [],
        ascendant: {} as unknown as PlanetPosition,
        midheaven: {} as unknown as PlanetPosition,
        distribution: {
          elements: { fire: 0, earth: 0, air: 0, water: 0 },
          modalities: { cardinal: 0, fixed: 0, mutable: 0 },
          polarity: { masculine: 0, feminine: 0 },
        },
      };

      const result = service.validateChartData(
        mockChartData as unknown as ChartData,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 10 planets, got 5');
    });

    it('should detect invalid number of houses', () => {
      const mockChartData: Partial<ChartData> = {
        planets: new Array(10).fill({}),
        houses: new Array(6).fill({}),
        aspects: [],
        ascendant: {} as unknown as PlanetPosition,
        midheaven: {} as unknown as PlanetPosition,
        distribution: {
          elements: { fire: 0, earth: 0, air: 0, water: 0 },
          modalities: { cardinal: 0, fixed: 0, mutable: 0 },
          polarity: { masculine: 0, feminine: 0 },
        },
      };

      const result = service.validateChartData(
        mockChartData as unknown as ChartData,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Expected 12 houses, got 6');
    });

    it('should detect missing ascendant', () => {
      const mockChartData: Partial<ChartData> = {
        planets: new Array(10).fill({}),
        houses: new Array(12).fill({}),
        aspects: [],
        ascendant: null as unknown as PlanetPosition,
        midheaven: {} as unknown as PlanetPosition,
        distribution: {
          elements: { fire: 0, earth: 0, air: 0, water: 0 },
          modalities: { cardinal: 0, fixed: 0, mutable: 0 },
          polarity: { masculine: 0, feminine: 0 },
        },
      };

      const result = service.validateChartData(
        mockChartData as unknown as ChartData,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing ascendant');
    });

    it('should detect missing distribution', () => {
      const mockChartData: Partial<ChartData> = {
        planets: new Array(10).fill({}),
        houses: new Array(12).fill({}),
        aspects: [],
        ascendant: {} as unknown as PlanetPosition,
        midheaven: {} as unknown as PlanetPosition,
        distribution: null as unknown as ChartDistribution,
      };

      const result = service.validateChartData(
        mockChartData as unknown as ChartData,
      );

      expect(result.valid).toBe(false);
      expect(result.errors).toContain('Missing distribution data');
    });

    it('should detect multiple errors', () => {
      const mockChartData: Partial<ChartData> = {
        planets: [],
        houses: [],
        aspects: [],
        ascendant: null as unknown as PlanetPosition,
        midheaven: null as unknown as PlanetPosition,
        distribution: null as unknown as ChartDistribution,
      };

      const result = service.validateChartData(
        mockChartData as unknown as ChartData,
      );

      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
