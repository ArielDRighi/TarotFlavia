import { BirthChart } from './birth-chart.entity';
import { ZodiacSign } from '../domain/enums/zodiac-sign.enum';
import { Planet } from '../domain/enums/planet.enum';
import { AspectType } from '../domain/enums/aspect-type.enum';

describe('BirthChart Entity', () => {
  let birthChart: BirthChart;

  beforeEach(() => {
    // Crear una instancia base de BirthChart para tests
    birthChart = new BirthChart();
    birthChart.id = 1;
    birthChart.userId = 1;
    birthChart.name = 'Mi carta natal';
    birthChart.birthDate = new Date('1990-05-15');
    birthChart.birthTime = '14:30:00';
    birthChart.birthPlace = 'Buenos Aires, Argentina';
    birthChart.latitude = -34.6037;
    birthChart.longitude = -58.3816;
    birthChart.timezone = 'America/Argentina/Buenos_Aires';
    birthChart.sunSign = ZodiacSign.TAURUS;
    birthChart.moonSign = ZodiacSign.SCORPIO;
    birthChart.ascendantSign = ZodiacSign.VIRGO;
    birthChart.chartData = {
      planets: [
        {
          planet: Planet.SUN,
          longitude: 54.5,
          sign: ZodiacSign.TAURUS,
          signDegree: 24.5,
          house: 9,
          isRetrograde: false,
        },
        {
          planet: Planet.MOON,
          longitude: 225.3,
          sign: ZodiacSign.SCORPIO,
          signDegree: 15.3,
          house: 3,
          isRetrograde: false,
        },
        {
          planet: Planet.MERCURY,
          longitude: 45.0,
          sign: ZodiacSign.TAURUS,
          signDegree: 15.0,
          house: 8,
          isRetrograde: true,
        },
      ],
      houses: [
        {
          house: 1,
          longitude: 165.0,
          sign: ZodiacSign.VIRGO,
          signDegree: 15.0,
        },
        {
          house: 2,
          longitude: 195.0,
          sign: ZodiacSign.LIBRA,
          signDegree: 15.0,
        },
      ],
      aspects: [
        {
          planet1: Planet.SUN,
          planet2: Planet.MOON,
          aspectType: AspectType.TRINE,
          angle: 120,
          orb: 0.8,
          isApplying: true,
        },
        {
          planet1: Planet.SUN,
          planet2: Planet.MERCURY,
          aspectType: AspectType.CONJUNCTION,
          angle: 0,
          orb: 2.5,
          isApplying: false,
        },
        {
          planet1: Planet.MOON,
          planet2: Planet.MERCURY,
          aspectType: AspectType.SQUARE,
          angle: 90,
          orb: 3.0,
          isApplying: true,
        },
      ],
      ascendant: {
        planet: 'Ascendant',
        longitude: 165.0,
        sign: ZodiacSign.VIRGO,
        signDegree: 15.0,
        house: 1,
        isRetrograde: false,
      },
      midheaven: {
        planet: 'Midheaven',
        longitude: 75.0,
        sign: ZodiacSign.GEMINI,
        signDegree: 15.0,
        house: 10,
        isRetrograde: false,
      },
      distribution: {
        elements: { fire: 2, earth: 4, air: 2, water: 2 },
        modalities: { cardinal: 3, fixed: 4, mutable: 3 },
        polarity: { masculine: 5, feminine: 5 },
      },
    };
  });

  describe('getBigThree', () => {
    it('should return Sun, Moon, and Ascendant signs', () => {
      const result = birthChart.getBigThree();

      expect(result).toEqual({
        sun: ZodiacSign.TAURUS,
        moon: ZodiacSign.SCORPIO,
        ascendant: ZodiacSign.VIRGO,
      });
    });

    it('should work with different signs', () => {
      birthChart.sunSign = ZodiacSign.LEO;
      birthChart.moonSign = ZodiacSign.ARIES;
      birthChart.ascendantSign = ZodiacSign.LIBRA;

      const result = birthChart.getBigThree();

      expect(result).toEqual({
        sun: ZodiacSign.LEO,
        moon: ZodiacSign.ARIES,
        ascendant: ZodiacSign.LIBRA,
      });
    });
  });

  describe('hasAiSynthesis', () => {
    it('should return true when AI synthesis exists', () => {
      birthChart.chartData.aiSynthesis =
        'Tu carta muestra una combinación única...';

      expect(birthChart.hasAiSynthesis()).toBe(true);
    });

    it('should return false when AI synthesis is undefined', () => {
      birthChart.chartData.aiSynthesis = undefined;

      expect(birthChart.hasAiSynthesis()).toBe(false);
    });

    it('should return false when AI synthesis is empty string', () => {
      birthChart.chartData.aiSynthesis = '';

      expect(birthChart.hasAiSynthesis()).toBe(false);
    });

    it('should return false when chartData is null', () => {
      birthChart.chartData = null as any;

      expect(birthChart.hasAiSynthesis()).toBe(false);
    });

    it('should return false when chartData is undefined', () => {
      birthChart.chartData = undefined as any;

      expect(birthChart.hasAiSynthesis()).toBe(false);
    });
  });

  describe('getAspectsForPlanet', () => {
    it('should return aspects where planet is planet1', () => {
      const aspects = birthChart.getAspectsForPlanet(Planet.SUN);

      expect(aspects).toHaveLength(2);
      expect(aspects).toContainEqual(
        expect.objectContaining({
          planet1: Planet.SUN,
          planet2: Planet.MOON,
          aspectType: AspectType.TRINE,
        }),
      );
      expect(aspects).toContainEqual(
        expect.objectContaining({
          planet1: Planet.SUN,
          planet2: Planet.MERCURY,
          aspectType: AspectType.CONJUNCTION,
        }),
      );
    });

    it('should return aspects where planet is planet2', () => {
      const aspects = birthChart.getAspectsForPlanet(Planet.MOON);

      expect(aspects).toHaveLength(2);
      expect(aspects).toContainEqual(
        expect.objectContaining({
          planet1: Planet.SUN,
          planet2: Planet.MOON,
          aspectType: AspectType.TRINE,
        }),
      );
      expect(aspects).toContainEqual(
        expect.objectContaining({
          planet1: Planet.MOON,
          planet2: Planet.MERCURY,
          aspectType: AspectType.SQUARE,
        }),
      );
    });

    it('should return aspects for planet involved as both planet1 and planet2', () => {
      const aspects = birthChart.getAspectsForPlanet(Planet.MERCURY);

      expect(aspects).toHaveLength(2);
      expect(aspects).toContainEqual(
        expect.objectContaining({
          planet1: Planet.SUN,
          planet2: Planet.MERCURY,
        }),
      );
      expect(aspects).toContainEqual(
        expect.objectContaining({
          planet1: Planet.MOON,
          planet2: Planet.MERCURY,
        }),
      );
    });

    it('should return empty array when planet has no aspects', () => {
      const aspects = birthChart.getAspectsForPlanet(Planet.VENUS);

      expect(aspects).toEqual([]);
    });

    it('should return empty array when chartData is null', () => {
      birthChart.chartData = null as any;

      const aspects = birthChart.getAspectsForPlanet(Planet.SUN);

      expect(aspects).toEqual([]);
    });

    it('should return empty array when chartData.aspects is null', () => {
      birthChart.chartData.aspects = null as any;

      const aspects = birthChart.getAspectsForPlanet(Planet.SUN);

      expect(aspects).toEqual([]);
    });

    it('should return empty array when chartData.aspects is undefined', () => {
      birthChart.chartData.aspects = undefined as any;

      const aspects = birthChart.getAspectsForPlanet(Planet.SUN);

      expect(aspects).toEqual([]);
    });
  });

  describe('Entity Structure', () => {
    it('should have all required properties', () => {
      expect(birthChart).toHaveProperty('id');
      expect(birthChart).toHaveProperty('userId');
      expect(birthChart).toHaveProperty('name');
      expect(birthChart).toHaveProperty('birthDate');
      expect(birthChart).toHaveProperty('birthTime');
      expect(birthChart).toHaveProperty('birthPlace');
      expect(birthChart).toHaveProperty('latitude');
      expect(birthChart).toHaveProperty('longitude');
      expect(birthChart).toHaveProperty('timezone');
      expect(birthChart).toHaveProperty('chartData');
      expect(birthChart).toHaveProperty('sunSign');
      expect(birthChart).toHaveProperty('moonSign');
      expect(birthChart).toHaveProperty('ascendantSign');
    });

    it('should have user relation property', () => {
      expect(birthChart).toHaveProperty('user');
    });

    it('should have chartData with correct structure', () => {
      expect(birthChart.chartData).toHaveProperty('planets');
      expect(birthChart.chartData).toHaveProperty('houses');
      expect(birthChart.chartData).toHaveProperty('aspects');
      expect(birthChart.chartData).toHaveProperty('ascendant');
      expect(birthChart.chartData).toHaveProperty('midheaven');
      expect(birthChart.chartData).toHaveProperty('distribution');
    });

    it('should have numeric IDs', () => {
      expect(typeof birthChart.id).toBe('number');
      expect(typeof birthChart.userId).toBe('number');
    });

    it('should have numeric coordinates with proper precision', () => {
      expect(typeof birthChart.latitude).toBe('number');
      expect(typeof birthChart.longitude).toBe('number');
      expect(birthChart.latitude).toBeCloseTo(-34.6037, 4);
      expect(birthChart.longitude).toBeCloseTo(-58.3816, 4);
    });
  });
});
