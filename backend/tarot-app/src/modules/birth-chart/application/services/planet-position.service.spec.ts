import { Test, TestingModule } from '@nestjs/testing';
import { PlanetPositionService } from './planet-position.service';
import { Planet, ZodiacSign } from '../../domain/enums';
import {
  RawPlanetPosition,
  RawHouseCusps,
} from '../../infrastructure/ephemeris/ephemeris.types';
import { PlanetPosition } from '../../entities/birth-chart.entity';

describe('PlanetPositionService', () => {
  let service: PlanetPositionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PlanetPositionService],
    }).compile();

    service = module.get<PlanetPositionService>(PlanetPositionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('longitudeToSign', () => {
    it('should convert 0° to Aries 0°', () => {
      const result = service.longitudeToSign(0);
      expect(result.sign).toBe(ZodiacSign.ARIES);
      expect(result.degree).toBe(0);
    });

    it('should convert 15° to Aries 15°', () => {
      const result = service.longitudeToSign(15);
      expect(result.sign).toBe(ZodiacSign.ARIES);
      expect(result.degree).toBe(15);
    });

    it('should convert 30° to Taurus 0°', () => {
      const result = service.longitudeToSign(30);
      expect(result.sign).toBe(ZodiacSign.TAURUS);
      expect(result.degree).toBe(0);
    });

    it('should convert 45° to Taurus 15°', () => {
      const result = service.longitudeToSign(45);
      expect(result.sign).toBe(ZodiacSign.TAURUS);
      expect(result.degree).toBe(15);
    });

    it('should convert 120° to Leo 0°', () => {
      const result = service.longitudeToSign(120);
      expect(result.sign).toBe(ZodiacSign.LEO);
      expect(result.degree).toBe(0);
    });

    it('should convert 150.75° to Virgo 0.75°', () => {
      const result = service.longitudeToSign(150.75);
      expect(result.sign).toBe(ZodiacSign.VIRGO);
      expect(result.degree).toBeCloseTo(0.75, 2);
    });

    it('should convert 180° to Libra 0°', () => {
      const result = service.longitudeToSign(180);
      expect(result.sign).toBe(ZodiacSign.LIBRA);
      expect(result.degree).toBe(0);
    });

    it('should convert 270° to Capricorn 0°', () => {
      const result = service.longitudeToSign(270);
      expect(result.sign).toBe(ZodiacSign.CAPRICORN);
      expect(result.degree).toBe(0);
    });

    it('should convert 330° to Pisces 0°', () => {
      const result = service.longitudeToSign(330);
      expect(result.sign).toBe(ZodiacSign.PISCES);
      expect(result.degree).toBe(0);
    });

    it('should convert 359.99° to Pisces 29.99°', () => {
      const result = service.longitudeToSign(359.99);
      expect(result.sign).toBe(ZodiacSign.PISCES);
      expect(result.degree).toBeCloseTo(29.99, 2);
    });

    it('should handle negative longitude (360° wrapping)', () => {
      const result = service.longitudeToSign(-30);
      expect(result.sign).toBe(ZodiacSign.PISCES); // -30° = 330° = Pisces 0°
      expect(result.degree).toBe(0);
    });

    it('should handle longitude > 360° (wrapping)', () => {
      const result = service.longitudeToSign(390);
      expect(result.sign).toBe(ZodiacSign.TAURUS);
      expect(result.degree).toBe(0);
    });
  });

  describe('calculateHouse', () => {
    const mockCusps: number[] = [
      0, // Casa 1 (Ascendente)
      30, // Casa 2
      60, // Casa 3
      90, // Casa 4 (IC)
      120, // Casa 5
      150, // Casa 6
      180, // Casa 7 (Descendente)
      210, // Casa 8
      240, // Casa 9
      270, // Casa 10 (MC)
      300, // Casa 11
      330, // Casa 12
    ];

    it('should place 10° in house 1', () => {
      const result = service.calculateHouse(10, mockCusps);
      expect(result).toBe(1);
    });

    it('should place 40° in house 2', () => {
      const result = service.calculateHouse(40, mockCusps);
      expect(result).toBe(2);
    });

    it('should place 150° in house 6', () => {
      const result = service.calculateHouse(150, mockCusps);
      expect(result).toBe(6);
    });

    it('should place 200° in house 7', () => {
      const result = service.calculateHouse(200, mockCusps);
      expect(result).toBe(7); // 200° está entre 180° (casa 7) y 210° (casa 8)
    });

    it('should place 350° in house 12', () => {
      const result = service.calculateHouse(350, mockCusps);
      expect(result).toBe(12);
    });

    it('should handle wrapping around 0°/360° correctly', () => {
      const wrappingCusps = [
        355, // Casa 1 (cerca del 0°)
        25,
        55,
        85,
        115,
        145,
        175,
        205,
        235,
        265,
        295,
        325,
      ];

      // 0° debería estar en casa 1 (después de 355°)
      const result = service.calculateHouse(0, wrappingCusps);
      expect(result).toBe(1);
    });
  });

  describe('calculatePositions', () => {
    const mockRawPlanets: RawPlanetPosition[] = [
      {
        name: 'sun',
        longitude: 135,
        latitude: 0,
        distance: 1,
        longitudeSpeed: 0.9856,
      },
      {
        name: 'moon',
        longitude: 245,
        latitude: 0,
        distance: 0.002569,
        longitudeSpeed: 13.176,
      },
      {
        name: 'mercury',
        longitude: 320,
        latitude: 0,
        distance: 0.9,
        longitudeSpeed: -0.5, // Retrógrado
      },
    ];

    const mockHouseCusps: RawHouseCusps = {
      cusps: [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330],
      ascendant: 0,
      midheaven: 270,
    };

    it('should calculate positions for all planets', () => {
      const result = service.calculatePositions(mockRawPlanets, mockHouseCusps);
      expect(result).toHaveLength(3);
    });

    it('should enrich Sun position correctly', () => {
      const result = service.calculatePositions(mockRawPlanets, mockHouseCusps);
      const sun = result[0];

      expect(sun.planet).toBe(Planet.SUN);
      expect(sun.longitude).toBe(135);
      expect(sun.sign).toBe(ZodiacSign.LEO); // 135° = Leo
      expect(sun.signDegree).toBe(15); // 135 - 120 = 15°
      expect(sun.house).toBe(5); // Entre cúspide 4 (120°) y 5 (150°)
      expect(sun.isRetrograde).toBe(false);
    });

    it('should detect retrograde motion', () => {
      const result = service.calculatePositions(mockRawPlanets, mockHouseCusps);
      const mercury = result[2];

      expect(mercury.isRetrograde).toBe(true);
    });

    it('should calculate Moon position correctly', () => {
      const result = service.calculatePositions(mockRawPlanets, mockHouseCusps);
      const moon = result[1];

      expect(moon.planet).toBe(Planet.MOON);
      expect(moon.sign).toBe(ZodiacSign.SAGITTARIUS); // 245° = Sagittarius
      expect(moon.house).toBe(9); // Entre cúspide 8 (240°) y 9 (270°)
    });
  });

  describe('calculateAscendant', () => {
    it('should calculate ascendant position for Aries', () => {
      const result = service.calculateAscendant(15);

      expect(result.planet).toBe('ascendant');
      expect(result.longitude).toBe(15);
      expect(result.sign).toBe(ZodiacSign.ARIES);
      expect(result.signDegree).toBe(15);
      expect(result.house).toBe(1);
      expect(result.isRetrograde).toBe(false);
    });

    it('should calculate ascendant position for Libra', () => {
      const result = service.calculateAscendant(190);

      expect(result.planet).toBe('ascendant');
      expect(result.sign).toBe(ZodiacSign.LIBRA);
      expect(result.signDegree).toBe(10);
    });
  });

  describe('calculateMidheaven', () => {
    it('should calculate midheaven position for Capricorn', () => {
      const result = service.calculateMidheaven(275);

      expect(result.planet).toBe('midheaven');
      expect(result.longitude).toBe(275);
      expect(result.sign).toBe(ZodiacSign.CAPRICORN);
      expect(result.signDegree).toBe(5);
      expect(result.house).toBe(10);
      expect(result.isRetrograde).toBe(false);
    });
  });

  describe('formatPosition', () => {
    it('should format position with degrees and minutes', () => {
      const position: PlanetPosition = {
        planet: Planet.SUN,
        longitude: 135.5,
        sign: ZodiacSign.LEO,
        signDegree: 15.5,
        house: 5,
        isRetrograde: false,
      };

      const result = service.formatPosition(position);
      expect(result).toBe("15° 30' Leo");
    });

    it('should include retrograde symbol when planet is retrograde', () => {
      const position: PlanetPosition = {
        planet: Planet.MERCURY,
        longitude: 320,
        sign: ZodiacSign.AQUARIUS,
        signDegree: 20,
        house: 11,
        isRetrograde: true,
      };

      const result = service.formatPosition(position);
      expect(result).toContain('℞');
    });

    it('should format with correct minutes', () => {
      const position: PlanetPosition = {
        planet: Planet.MOON,
        longitude: 150.75,
        sign: ZodiacSign.VIRGO,
        signDegree: 0.75,
        house: 6,
        isRetrograde: false,
      };

      const result = service.formatPosition(position);
      expect(result).toBe("0° 45' Virgo");
    });
  });

  describe('getBigThree', () => {
    it('should extract Sun, Moon, and Ascendant signs', () => {
      const planets: PlanetPosition[] = [
        {
          planet: Planet.SUN,
          longitude: 135,
          sign: ZodiacSign.LEO,
          signDegree: 15,
          house: 5,
          isRetrograde: false,
        },
        {
          planet: Planet.MOON,
          longitude: 245,
          sign: ZodiacSign.SAGITTARIUS,
          signDegree: 5,
          house: 9,
          isRetrograde: false,
        },
        {
          planet: Planet.MERCURY,
          longitude: 320,
          sign: ZodiacSign.AQUARIUS,
          signDegree: 20,
          house: 11,
          isRetrograde: false,
        },
      ];

      const ascendant: PlanetPosition = {
        planet: 'ascendant',
        longitude: 0,
        sign: ZodiacSign.ARIES,
        signDegree: 0,
        house: 1,
        isRetrograde: false,
      };

      const result = service.getBigThree(planets, ascendant);

      expect(result.sun).toBe(ZodiacSign.LEO);
      expect(result.moon).toBe(ZodiacSign.SAGITTARIUS);
      expect(result.ascendant).toBe(ZodiacSign.ARIES);
    });

    it('should return default Aries if planets not found', () => {
      const planets: PlanetPosition[] = [];
      const ascendant: PlanetPosition = {
        planet: 'ascendant',
        longitude: 0,
        sign: ZodiacSign.ARIES,
        signDegree: 0,
        house: 1,
        isRetrograde: false,
      };

      const result = service.getBigThree(planets, ascendant);

      expect(result.sun).toBe(ZodiacSign.ARIES);
      expect(result.moon).toBe(ZodiacSign.ARIES);
      expect(result.ascendant).toBe(ZodiacSign.ARIES);
    });
  });

  describe('edge cases', () => {
    it('should handle exact cusp boundary (on cúspide)', () => {
      const cusps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];
      const result = service.calculateHouse(30, cusps);
      expect(result).toBe(2); // On cusp of house 2
    });

    it('should round degrees to 2 decimals', () => {
      const result = service.longitudeToSign(15.123456);
      expect(result.degree).toBeCloseTo(15.12, 2);
    });

    it('should handle very small longitude values', () => {
      const result = service.longitudeToSign(0.01);
      expect(result.sign).toBe(ZodiacSign.ARIES);
      expect(result.degree).toBeCloseTo(0.01, 2);
    });

    it('should handle very large longitude values (multiple wraps)', () => {
      const result = service.longitudeToSign(720 + 15); // 2 full rotations + 15°
      expect(result.sign).toBe(ZodiacSign.ARIES);
      expect(result.degree).toBe(15);
    });
  });
});
