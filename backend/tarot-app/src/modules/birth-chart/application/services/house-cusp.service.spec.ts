import { Test, TestingModule } from '@nestjs/testing';
import { HouseCuspService } from './house-cusp.service';
import { PlanetPositionService } from './planet-position.service';
import { ZodiacSign } from '../../domain/enums';
import { RawHouseCusps } from '../../infrastructure/ephemeris/ephemeris.types';
import { HouseCusp } from '../../entities/birth-chart.entity';

describe('HouseCuspService', () => {
  let service: HouseCuspService;

  // Mock de cúspides estándar (cada 30 grados, como casas iguales)
  const mockStandardCusps: number[] = [
    0, // Casa 1: 0° Aries
    30, // Casa 2: 0° Taurus
    60, // Casa 3: 0° Gemini
    90, // Casa 4: 0° Cancer
    120, // Casa 5: 0° Leo
    150, // Casa 6: 0° Virgo
    180, // Casa 7: 0° Libra
    210, // Casa 8: 0° Scorpio
    240, // Casa 9: 0° Sagittarius
    270, // Casa 10: 0° Capricorn
    300, // Casa 11: 0° Aquarius
    330, // Casa 12: 0° Pisces
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HouseCuspService, PlanetPositionService],
    }).compile();

    service = module.get<HouseCuspService>(HouseCuspService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateCusps', () => {
    it('should transform 12 raw cusps into enriched HouseCusp objects', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const result = service.calculateCusps(rawCusps);

      expect(result).toHaveLength(12);
      expect(result[0]).toMatchObject({
        house: 1,
        longitude: 0,
        sign: ZodiacSign.ARIES,
        signDegree: 0,
      });
    });

    it('should correctly assign sign and degree for each cusp', () => {
      const rawCusps: RawHouseCusps = {
        cusps: [15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345],
        ascendant: 15,
        midheaven: 285,
      };

      const result = service.calculateCusps(rawCusps);

      // Casa 1: 15° Aries
      expect(result[0]).toMatchObject({
        house: 1,
        sign: ZodiacSign.ARIES,
        signDegree: 15,
      });

      // Casa 2: 45° = 15° Taurus
      expect(result[1]).toMatchObject({
        house: 2,
        sign: ZodiacSign.TAURUS,
        signDegree: 15,
      });

      // Casa 7: 195° = 15° Libra
      expect(result[6]).toMatchObject({
        house: 7,
        sign: ZodiacSign.LIBRA,
        signDegree: 15,
      });
    });

    it('should handle cusps with decimals correctly', () => {
      const rawCusps: RawHouseCusps = {
        cusps: [
          15.5, 45.75, 75.25, 105.5, 135.75, 165.25, 195.5, 225.75, 255.25,
          285.5, 315.75, 345.25,
        ],
        ascendant: 15.5,
        midheaven: 285.5,
      };

      const result = service.calculateCusps(rawCusps);

      expect(result[0].signDegree).toBeCloseTo(15.5, 2);
      expect(result[1].signDegree).toBeCloseTo(15.75, 2);
    });
  });

  describe('getCusp', () => {
    it('should return the cusp for a specific house number', () => {
      const cusps: HouseCusp[] = [
        {
          house: 1,
          longitude: 0,
          sign: ZodiacSign.ARIES,
          signDegree: 0,
        },
        {
          house: 2,
          longitude: 30,
          sign: ZodiacSign.TAURUS,
          signDegree: 0,
        },
      ];

      const result = service.getCusp(cusps, 2);

      expect(result).toEqual(cusps[1]);
    });

    it('should return undefined if house not found', () => {
      const cusps: HouseCusp[] = [];
      const result = service.getCusp(cusps, 5);
      expect(result).toBeUndefined();
    });
  });

  describe('getHouseRulers', () => {
    it('should return a map of house numbers to ruling signs', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.getHouseRulers(cusps);

      expect(result[1]).toBe(ZodiacSign.ARIES);
      expect(result[2]).toBe(ZodiacSign.TAURUS);
      expect(result[7]).toBe(ZodiacSign.LIBRA);
      expect(result[10]).toBe(ZodiacSign.CAPRICORN);
    });
  });

  describe('findInterceptedSigns', () => {
    it('should return empty array when all signs are on cusps (standard houses)', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.findInterceptedSigns(cusps);

      expect(result).toEqual([]);
    });

    it('should detect intercepted signs in non-equal houses', () => {
      // Simular casas donde algunos signos están interceptados
      // Ejemplo: Aries en 1, Taurus interceptado, Gemini en 3
      const rawCusps: RawHouseCusps = {
        cusps: [
          0, // Aries
          60, // Gemini (Taurus interceptado)
          90, // Cancer
          120, // Leo
          150, // Virgo
          180, // Libra
          210, // Scorpio
          240, // Sagittarius
          270, // Capricorn
          300, // Aquarius
          330, // Pisces
          355, // Aries (casi completa vuelta)
        ],
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.findInterceptedSigns(cusps);

      // Taurus no aparece en ninguna cúspide
      expect(result).toContain(ZodiacSign.TAURUS);
    });
  });

  describe('findDuplicatedSigns', () => {
    it('should return empty array when all cusps have different signs', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.findDuplicatedSigns(cusps);

      expect(result).toEqual([]);
    });

    it('should detect when same sign appears on multiple cusps', () => {
      // Caso: Aries aparece en casa 1 y casa 12
      const rawCusps: RawHouseCusps = {
        cusps: [
          15, // Aries
          60, // Gemini
          90, // Cancer
          120, // Leo
          150, // Virgo
          180, // Libra
          210, // Scorpio
          240, // Sagittarius
          270, // Capricorn
          300, // Aquarius
          330, // Pisces
          5, // Aries (duplicado)
        ],
        ascendant: 15,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.findDuplicatedSigns(cusps);

      expect(result.length).toBeGreaterThan(0);
      const ariesDuplicate = result.find((d) => d.sign === ZodiacSign.ARIES);
      expect(ariesDuplicate).toBeDefined();
      expect(ariesDuplicate?.houses).toContain(1);
      expect(ariesDuplicate?.houses).toContain(12);
    });
  });

  describe('calculateHouseSizes', () => {
    it('should calculate 30° for each house in equal house system', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.calculateHouseSizes(cusps);

      // Todas las casas deben tener 30°
      for (let i = 1; i <= 12; i++) {
        expect(result[i]).toBeCloseTo(30, 2);
      }
    });

    it('should calculate different sizes for unequal houses', () => {
      const rawCusps: RawHouseCusps = {
        cusps: [
          0, // Casa 1
          25, // Casa 2 (25° de tamaño)
          60, // Casa 3 (35° de tamaño)
          100, // Casa 4 (40° de tamaño)
          140, // Casa 5 (40° de tamaño)
          170, // Casa 6 (30° de tamaño)
          200, // Casa 7 (30° de tamaño)
          225, // Casa 8 (25° de tamaño)
          260, // Casa 9 (35° de tamaño)
          300, // Casa 10 (40° de tamaño)
          340, // Casa 11 (40° de tamaño)
          355, // Casa 12 (5° + wrap a Casa 1)
        ],
        ascendant: 0,
        midheaven: 300,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.calculateHouseSizes(cusps);

      expect(result[1]).toBeCloseTo(25, 2);
      expect(result[2]).toBeCloseTo(35, 2);
      expect(result[3]).toBeCloseTo(40, 2);
      expect(result[12]).toBeCloseTo(5, 2); // 360° - 355° = 5°
    });

    it('should handle 360° wrap correctly for house 12', () => {
      const rawCusps: RawHouseCusps = {
        cusps: [
          10, // Casa 1
          40,
          70,
          100,
          130,
          160,
          190,
          220,
          250,
          280,
          310,
          350, // Casa 12
        ],
        ascendant: 10,
        midheaven: 280,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.calculateHouseSizes(cusps);

      // Casa 12: desde 350° hasta 10° = 20°
      expect(result[12]).toBeCloseTo(20, 2);
    });
  });

  describe('getHouseInfo', () => {
    it('should return complete information for a house', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.getHouseInfo(cusps, 1);

      expect(result).toBeDefined();
      expect(result?.cusp.house).toBe(1);
      expect(result?.theme).toBe('Identidad y Apariencia');
      expect(result?.keywords).toContain('yo');
      expect(result?.size).toBeCloseTo(30, 2);
    });

    it('should return null for non-existent house', () => {
      const cusps: HouseCusp[] = [];
      const result = service.getHouseInfo(cusps, 5);
      expect(result).toBeNull();
    });
  });

  describe('formatCusp', () => {
    it('should format cusp for display', () => {
      const cusp: HouseCusp = {
        house: 1,
        longitude: 15.5,
        sign: ZodiacSign.ARIES,
        signDegree: 15.5,
      };

      const result = service.formatCusp(cusp);

      expect(result).toContain('Casa 1');
      expect(result).toContain('15°');
      expect(result).toContain("30'"); // 0.5 * 60 = 30 minutos
      expect(result).toContain('aries');
    });

    it('should handle 0 minutes correctly', () => {
      const cusp: HouseCusp = {
        house: 10,
        longitude: 270,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 0,
      };

      const result = service.formatCusp(cusp);

      expect(result).toContain('Casa 10');
      expect(result).toContain('0°');
      expect(result).toContain("0'");
    });
  });

  describe('groupByElement', () => {
    it('should group houses by element of their ruling sign', () => {
      const rawCusps: RawHouseCusps = {
        cusps: mockStandardCusps,
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.groupByElement(cusps);

      // Fire: Aries (1), Leo (5), Sagittarius (9)
      expect(result.fire).toEqual([1, 5, 9]);

      // Earth: Taurus (2), Virgo (6), Capricorn (10)
      expect(result.earth).toEqual([2, 6, 10]);

      // Air: Gemini (3), Libra (7), Aquarius (11)
      expect(result.air).toEqual([3, 7, 11]);

      // Water: Cancer (4), Scorpio (8), Pisces (12)
      expect(result.water).toEqual([4, 8, 12]);
    });

    it('should handle unequal distribution of elements', () => {
      // Todas las casas en signos de fuego (imposible en la realidad, pero prueba la lógica)
      const rawCusps: RawHouseCusps = {
        cusps: [
          0, // Aries
          10, // Aries
          120, // Leo
          130, // Leo
          240, // Sagittarius
          250, // Sagittarius
          5, // Aries
          15, // Aries
          125, // Leo
          135, // Leo
          245, // Sagittarius
          255, // Sagittarius
        ],
        ascendant: 0,
        midheaven: 270,
      };

      const cusps = service.calculateCusps(rawCusps);
      const result = service.groupByElement(cusps);

      expect(result.fire.length).toBe(12);
      expect(result.earth.length).toBe(0);
      expect(result.air.length).toBe(0);
      expect(result.water.length).toBe(0);
    });
  });
});
