/**
 * Tests para utilidades de conversión de astrochart
 */

import { describe, it, expect } from 'vitest';
import {
  convertPlanetsToAstroChart,
  convertHousesToAstroChart,
  getAscendantLongitude,
  prepareAspectsForChart,
  calculateChartSize,
  generateChartContainerId,
} from './astrochart.utils';
import { Planet, ZodiacSign, AspectType } from '@/types/birth-chart.enums';
import type { PlanetPosition, HouseCusp, ChartAspect } from '@/types/birth-chart.types';

describe('astrochart.utils', () => {
  describe('convertPlanetsToAstroChart', () => {
    it('should convert planet positions to astrochart format', () => {
      const planets: PlanetPosition[] = [
        {
          planet: Planet.SUN,
          sign: ZodiacSign.ARIES,
          signName: 'Aries',
          signDegree: 15.5,
          formattedPosition: "15°30' Aries",
          house: 1,
          isRetrograde: false,
        },
        {
          planet: Planet.MOON,
          sign: ZodiacSign.TAURUS,
          signName: 'Tauro',
          signDegree: 23.75,
          formattedPosition: "23°45' Tauro",
          house: 2,
          isRetrograde: false,
        },
      ];

      const result = convertPlanetsToAstroChart(planets, 0);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        name: 'Sun',
        position: 15.5, // Aries (index 0) * 30 + 15.5
        retrograde: false,
      });
      expect(result[1]).toEqual({
        name: 'Moon',
        position: 53.75, // Taurus (index 1) * 30 + 23.75
        retrograde: false,
      });
    });

    it('should handle retrograde planets correctly', () => {
      const planets: PlanetPosition[] = [
        {
          planet: Planet.MERCURY,
          sign: ZodiacSign.GEMINI,
          signName: 'Géminis',
          signDegree: 10.0,
          formattedPosition: "10°00' Géminis",
          house: 3,
          isRetrograde: true,
        },
      ];

      const result = convertPlanetsToAstroChart(planets, 0);

      expect(result[0].retrograde).toBe(true);
    });

    it('should calculate absolute longitude correctly for different signs', () => {
      const planets: PlanetPosition[] = [
        {
          planet: Planet.VENUS,
          sign: ZodiacSign.PISCES, // Last sign (index 11)
          signName: 'Piscis',
          signDegree: 29.99,
          formattedPosition: "29°59' Piscis",
          house: 12,
          isRetrograde: false,
        },
      ];

      const result = convertPlanetsToAstroChart(planets, 0);

      // Pisces is index 11, so: 11 * 30 + 29.99 = 359.99
      expect(result[0].position).toBeCloseTo(359.99);
    });
  });

  describe('convertHousesToAstroChart', () => {
    it('should convert house cusps to astrochart format', () => {
      const houses: HouseCusp[] = [
        {
          house: 1,
          sign: ZodiacSign.ARIES,
          signName: 'Aries',
          signDegree: 0,
          formattedPosition: "0°00' Aries",
        },
        {
          house: 2,
          sign: ZodiacSign.TAURUS,
          signName: 'Tauro',
          signDegree: 15,
          formattedPosition: "15°00' Tauro",
        },
      ];

      const result = convertHousesToAstroChart(houses);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe(0); // Aries 0° = 0
      expect(result[1]).toBe(45); // Taurus 15° = 30 + 15
    });

    it('should handle all 12 houses', () => {
      const houses: HouseCusp[] = Array.from({ length: 12 }, (_, i) => ({
        house: (i + 1) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12,
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        signDegree: i * 2.5,
        formattedPosition: `${i * 2.5}°00' Aries`,
      }));

      const result = convertHousesToAstroChart(houses);

      expect(result).toHaveLength(12);
    });
  });

  describe('getAscendantLongitude', () => {
    it('should return the longitude of the first house (Ascendant)', () => {
      const houses: HouseCusp[] = [
        {
          house: 1,
          sign: ZodiacSign.LEO,
          signName: 'Leo',
          signDegree: 12.5,
          formattedPosition: "12°30' Leo",
        },
        {
          house: 2,
          sign: ZodiacSign.VIRGO,
          signName: 'Virgo',
          signDegree: 0,
          formattedPosition: "0°00' Virgo",
        },
      ];

      const result = getAscendantLongitude(houses);

      // Leo is index 4, so: 4 * 30 + 12.5 = 132.5
      expect(result).toBeCloseTo(132.5);
    });

    it('should return 0 if house 1 is not found', () => {
      const houses: HouseCusp[] = [
        {
          house: 2,
          sign: ZodiacSign.TAURUS,
          signName: 'Tauro',
          signDegree: 10,
          formattedPosition: "10°00' Tauro",
        },
      ];

      const result = getAscendantLongitude(houses);

      expect(result).toBe(0);
    });

    it('should return 0 for empty houses array', () => {
      const result = getAscendantLongitude([]);

      expect(result).toBe(0);
    });
  });

  describe('prepareAspectsForChart', () => {
    it('should convert aspects to astrochart format', () => {
      const aspects: ChartAspect[] = [
        {
          planet1: Planet.SUN,
          planet1Name: 'Sol',
          planet2: Planet.MOON,
          planet2Name: 'Luna',
          aspectType: AspectType.CONJUNCTION,
          aspectName: 'Conjunción',
          aspectSymbol: '☌',
          orb: 2.5,
          isApplying: true,
        },
        {
          planet1: Planet.MARS,
          planet1Name: 'Marte',
          planet2: Planet.VENUS,
          planet2Name: 'Venus',
          aspectType: AspectType.SQUARE,
          aspectName: 'Cuadratura',
          aspectSymbol: '□',
          orb: 4.0,
          isApplying: false,
        },
      ];

      const result = prepareAspectsForChart(aspects);

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        point1: 'Sun',
        point2: 'Moon',
        aspect: AspectType.CONJUNCTION,
        orb: 2.5,
      });
      expect(result[1]).toEqual({
        point1: 'Mars',
        point2: 'Venus',
        aspect: AspectType.SQUARE,
        orb: 4.0,
      });
    });

    it('should handle empty aspects array', () => {
      const result = prepareAspectsForChart([]);

      expect(result).toHaveLength(0);
    });
  });

  describe('calculateChartSize', () => {
    it('should return the minimum dimension when both are smaller than max', () => {
      const result = calculateChartSize(400, 500, 600);

      expect(result).toBe(400);
    });

    it('should return maxSize when both dimensions exceed it', () => {
      const result = calculateChartSize(800, 900, 600);

      expect(result).toBe(600);
    });

    it('should return minDimension when it equals maxSize', () => {
      const result = calculateChartSize(600, 700, 600);

      expect(result).toBe(600);
    });

    it('should use default maxSize of 600 when not provided', () => {
      const result = calculateChartSize(800, 900);

      expect(result).toBe(600);
    });

    it('should handle square containers', () => {
      const result = calculateChartSize(500, 500, 600);

      expect(result).toBe(500);
    });
  });

  describe('generateChartContainerId', () => {
    it('should generate an ID with the correct prefix', () => {
      const id = generateChartContainerId();

      expect(id).toMatch(/^astrochart-[a-z0-9]+$/);
    });

    it('should generate unique IDs on multiple calls', () => {
      const id1 = generateChartContainerId();
      const id2 = generateChartContainerId();
      const id3 = generateChartContainerId();

      expect(id1).not.toBe(id2);
      expect(id2).not.toBe(id3);
      expect(id1).not.toBe(id3);
    });

    it('should generate IDs with consistent length', () => {
      const ids = Array.from({ length: 10 }, () => generateChartContainerId());

      // All IDs should have the same structure: "astrochart-" + random string
      ids.forEach((id) => {
        expect(id).toMatch(/^astrochart-[a-z0-9]{7}$/);
      });
    });
  });
});
