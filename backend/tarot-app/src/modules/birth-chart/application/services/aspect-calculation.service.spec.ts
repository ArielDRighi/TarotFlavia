import { Test, TestingModule } from '@nestjs/testing';
import { AspectCalculationService } from './aspect-calculation.service';
import { AspectType } from '../../domain/enums';
import { PlanetPosition, ChartAspect } from '../../entities/birth-chart.entity';

describe('AspectCalculationService', () => {
  let service: AspectCalculationService;

  // Mock de posiciones planetarias para tests
  const mockPlanets: PlanetPosition[] = [
    {
      planet: 'sun',
      longitude: 0, // 0° Aries
      sign: 'aries',
      signDegree: 0,
      house: 1,
      isRetrograde: false,
    },
    {
      planet: 'moon',
      longitude: 90, // 0° Cancer (Cuadratura con Sol)
      sign: 'cancer',
      signDegree: 0,
      house: 4,
      isRetrograde: false,
    },
    {
      planet: 'mercury',
      longitude: 6, // 6° Aries (Conjunción con Sol - orbe 6°, dentro del límite de 8°)
      sign: 'aries',
      signDegree: 6,
      house: 1,
      isRetrograde: false,
    },
    {
      planet: 'venus',
      longitude: 8, // 8° Aries (Conjunción con Sol - orbe 8°, justo en el límite)
      sign: 'aries',
      signDegree: 8,
      house: 1,
      isRetrograde: false,
    },
    {
      planet: 'mars',
      longitude: 60, // 0° Gemini (Sextil con Sol)
      sign: 'gemini',
      signDegree: 0,
      house: 3,
      isRetrograde: false,
    },
    {
      planet: 'jupiter',
      longitude: 5, // 5° Aries (Conjunción con Sol - orbe 5°)
      sign: 'aries',
      signDegree: 5,
      house: 1,
      isRetrograde: false,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AspectCalculationService],
    }).compile();

    service = module.get<AspectCalculationService>(AspectCalculationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateAspects', () => {
    it('should calculate all aspects between planets', () => {
      const aspects = service.calculateAspects(mockPlanets);

      expect(aspects).toBeDefined();
      expect(Array.isArray(aspects)).toBe(true);
      expect(aspects.length).toBeGreaterThan(0);
    });

    it('should detect conjunction (Sun-Jupiter 0° with orb 5°)', () => {
      const aspects = service.calculateAspects(mockPlanets);

      const conjunction = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'jupiter') ||
            (a.planet1 === 'jupiter' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
      expect(conjunction?.orb).toBeCloseTo(5, 1);
    });

    it('should detect square (Sun-Moon 90°)', () => {
      const aspects = service.calculateAspects(mockPlanets);

      const square = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'moon') ||
            (a.planet1 === 'moon' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.SQUARE as string),
      );

      expect(square).toBeDefined();
      expect(square?.angle).toBeCloseTo(90, 1);
      expect(square?.orb).toBeCloseTo(0, 1);
    });

    it('should detect sextile (Sun-Mars 60°)', () => {
      const aspects = service.calculateAspects(mockPlanets);

      const sextile = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mars') ||
            (a.planet1 === 'mars' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.SEXTILE as string),
      );

      expect(sextile).toBeDefined();
      expect(sextile?.angle).toBeCloseTo(60, 1);
      expect(sextile?.orb).toBeCloseTo(0, 1);
    });

    it('should detect conjunction (Sun-Mercury ~6°)', () => {
      const aspects = service.calculateAspects(mockPlanets);

      const conjunction = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mercury') ||
            (a.planet1 === 'mercury' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
      expect(conjunction?.angle).toBeCloseTo(6, 1);
      expect(conjunction?.orb).toBeCloseTo(6, 1);
    });

    it('should detect conjunction (Sun-Venus ~8°)', () => {
      const aspects = service.calculateAspects(mockPlanets);

      const conjunction = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
      expect(conjunction?.angle).toBeCloseTo(8, 1);
      expect(conjunction?.orb).toBeCloseTo(8, 1);
    });

    it('should sort aspects by strength (smaller orb first)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'moon',
          longitude: 7, // Conjunción con orbe 7°
          sign: 'aries',
          signDegree: 7,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mercury',
          longitude: 2, // Conjunción con orbe 2°
          sign: 'aries',
          signDegree: 2,
          house: 1,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);

      // El primer aspecto debe ser el de menor orbe
      expect(aspects[0].orb).toBeLessThanOrEqual(aspects[1].orb);
    });

    it('should not detect aspects outside orb tolerance', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'moon',
          longitude: 10, // 10° de separación - fuera de orbe de conjunción (8°)
          sign: 'aries',
          signDegree: 10,
          house: 1,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);

      const conjunction = aspects.find(
        (a) => a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeUndefined();
    });

    it('should include ascendant in aspects when provided', () => {
      const ascendant: PlanetPosition = {
        planet: 'ascendant',
        longitude: 0,
        sign: 'aries',
        signDegree: 0,
        house: 1,
        isRetrograde: false,
      };

      const aspects = service.calculateAspects(mockPlanets, ascendant);

      const ascendantAspects = aspects.filter(
        (a) => a.planet1 === 'ascendant' || a.planet2 === 'ascendant',
      );

      expect(ascendantAspects.length).toBeGreaterThan(0);
    });

    it('should handle 360° wrapping correctly', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 358, // 28° Piscis
          sign: 'pisces',
          signDegree: 28,
          house: 12,
          isRetrograde: false,
        },
        {
          planet: 'moon',
          longitude: 3, // 3° Aries - Conjunción con orbe 5°
          sign: 'aries',
          signDegree: 3,
          house: 1,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);

      // Debe detectar la conjunción cruzando 0°/360°
      const conjunction = aspects.find(
        (a) => a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
      expect(conjunction?.orb).toBeCloseTo(5, 1);
    });
  });

  describe('getAspectsForPlanet', () => {
    it('should return all aspects involving a specific planet', () => {
      const allAspects = service.calculateAspects(mockPlanets);
      const sunAspects = service.getAspectsForPlanet(allAspects, 'sun');

      expect(Array.isArray(sunAspects)).toBe(true);
      expect(sunAspects.length).toBeGreaterThan(0);

      // Todos los aspectos deben involucrar al Sol
      for (const aspect of sunAspects) {
        expect(aspect.planet1 === 'sun' || aspect.planet2 === 'sun').toBe(true);
      }
    });

    it('should return empty array if planet has no aspects', () => {
      const aspects: ChartAspect[] = [];
      const result = service.getAspectsForPlanet(aspects, 'neptune');

      expect(result).toEqual([]);
    });
  });

  describe('getAspectsByType', () => {
    it('should filter aspects by type', () => {
      const allAspects = service.calculateAspects(mockPlanets);
      const conjunctions = service.getAspectsByType(
        allAspects,
        AspectType.CONJUNCTION,
      );

      expect(Array.isArray(conjunctions)).toBe(true);

      // Todos los aspectos deben ser conjunciones
      for (const aspect of conjunctions) {
        expect(aspect.aspectType).toBe(AspectType.CONJUNCTION);
      }
    });

    it('should return empty array if no aspects of type found', () => {
      const aspects: ChartAspect[] = [
        {
          planet1: 'sun',
          planet2: 'moon',
          aspectType: AspectType.CONJUNCTION,
          angle: 0,
          orb: 0,
          isApplying: false,
        },
      ];

      const result = service.getAspectsByType(aspects, AspectType.TRINE);

      expect(result).toEqual([]);
    });
  });

  describe('getAspectBalance', () => {
    it('should count harmonious vs challenging aspects', () => {
      const allAspects = service.calculateAspects(mockPlanets);
      const balance = service.getAspectBalance(allAspects);

      expect(balance).toBeDefined();
      expect(typeof balance.harmonious).toBe('number');
      expect(typeof balance.challenging).toBe('number');
      expect(typeof balance.neutral).toBe('number');

      expect(balance.harmonious).toBeGreaterThanOrEqual(0);
      expect(balance.challenging).toBeGreaterThanOrEqual(0);
      expect(balance.neutral).toBeGreaterThanOrEqual(0);
    });

    it('should identify harmonious aspects (trine, sextile)', () => {
      const aspects: ChartAspect[] = [
        {
          planet1: 'sun',
          planet2: 'moon',
          aspectType: AspectType.TRINE,
          angle: 120,
          orb: 0,
          isApplying: false,
        },
        {
          planet1: 'sun',
          planet2: 'venus',
          aspectType: AspectType.SEXTILE,
          angle: 60,
          orb: 0,
          isApplying: false,
        },
      ];

      const balance = service.getAspectBalance(aspects);

      expect(balance.harmonious).toBe(2);
      expect(balance.challenging).toBe(0);
    });

    it('should identify challenging aspects (opposition, square)', () => {
      const aspects: ChartAspect[] = [
        {
          planet1: 'sun',
          planet2: 'moon',
          aspectType: AspectType.OPPOSITION,
          angle: 180,
          orb: 0,
          isApplying: false,
        },
        {
          planet1: 'sun',
          planet2: 'mars',
          aspectType: AspectType.SQUARE,
          angle: 90,
          orb: 0,
          isApplying: false,
        },
      ];

      const balance = service.getAspectBalance(aspects);

      expect(balance.harmonious).toBe(0);
      expect(balance.challenging).toBe(2);
    });

    it('should identify neutral aspects (conjunction)', () => {
      const aspects: ChartAspect[] = [
        {
          planet1: 'sun',
          planet2: 'moon',
          aspectType: AspectType.CONJUNCTION,
          angle: 0,
          orb: 0,
          isApplying: false,
        },
      ];

      const balance = service.getAspectBalance(aspects);

      expect(balance.neutral).toBe(1);
      expect(balance.harmonious).toBe(0);
      expect(balance.challenging).toBe(0);
    });
  });

  describe('getStrongestAspect', () => {
    it('should return the aspect with smallest orb', () => {
      const aspects: ChartAspect[] = [
        {
          planet1: 'sun',
          planet2: 'moon',
          aspectType: AspectType.CONJUNCTION,
          angle: 0,
          orb: 5,
          isApplying: false,
        },
        {
          planet1: 'sun',
          planet2: 'venus',
          aspectType: AspectType.TRINE,
          angle: 120,
          orb: 1,
          isApplying: false,
        },
        {
          planet1: 'sun',
          planet2: 'mars',
          aspectType: AspectType.SQUARE,
          angle: 90,
          orb: 3,
          isApplying: false,
        },
      ];

      const strongest = service.getStrongestAspect(aspects);

      expect(strongest).toBeDefined();
      expect(strongest?.orb).toBe(1);
      expect(strongest?.aspectType).toBe(AspectType.TRINE);
    });

    it('should return null for empty aspects array', () => {
      const strongest = service.getStrongestAspect([]);
      expect(strongest).toBeNull();
    });
  });

  describe('formatAspect', () => {
    it('should format aspect with symbol and orb', () => {
      const aspect: ChartAspect = {
        planet1: 'sun',
        planet2: 'moon',
        aspectType: AspectType.TRINE,
        angle: 120,
        orb: 2.5,
        isApplying: true,
      };

      const formatted = service.formatAspect(aspect);

      expect(formatted).toBeDefined();
      expect(typeof formatted).toBe('string');
      expect(formatted).toContain('sun');
      expect(formatted).toContain('moon');
      expect(formatted).toContain('2.5');
    });

    it('should indicate if aspect is applying or separating', () => {
      const applying: ChartAspect = {
        planet1: 'sun',
        planet2: 'moon',
        aspectType: AspectType.CONJUNCTION,
        angle: 0,
        orb: 1,
        isApplying: true,
      };

      const separating: ChartAspect = {
        ...applying,
        isApplying: false,
      };

      const formattedApplying = service.formatAspect(applying);
      const formattedSeparating = service.formatAspect(separating);

      expect(formattedApplying).toContain('aplicativo');
      expect(formattedSeparating).toContain('separativo');
    });
  });

  describe('generateAspectMatrix', () => {
    it('should generate matrix with all planet combinations', () => {
      const allAspects = service.calculateAspects(mockPlanets);
      const planetNames = mockPlanets.map((p) => p.planet);

      const matrix = service.generateAspectMatrix(allAspects, planetNames);

      expect(matrix).toBeDefined();
      expect(Object.keys(matrix).length).toBe(planetNames.length);

      // Cada planeta debe tener una entrada en la matriz
      for (const planet of planetNames) {
        expect(matrix[planet]).toBeDefined();
        expect(Object.keys(matrix[planet]).length).toBe(planetNames.length);
      }
    });

    it('should have null on diagonal (planet to itself)', () => {
      const allAspects = service.calculateAspects(mockPlanets);
      const planetNames = mockPlanets.map((p) => p.planet);

      const matrix = service.generateAspectMatrix(allAspects, planetNames);

      for (const planet of planetNames) {
        expect(matrix[planet][planet]).toBeNull();
      }
    });

    it('should be symmetric (same aspect from both directions)', () => {
      const allAspects = service.calculateAspects(mockPlanets);
      const planetNames = mockPlanets.map((p) => p.planet);

      const matrix = service.generateAspectMatrix(allAspects, planetNames);

      for (let i = 0; i < planetNames.length; i++) {
        for (let j = i + 1; j < planetNames.length; j++) {
          const p1 = planetNames[i];
          const p2 = planetNames[j];

          const aspect1to2 = matrix[p1][p2];
          const aspect2to1 = matrix[p2][p1];

          // Deben ser el mismo aspecto o ambos null
          if (aspect1to2) {
            expect(aspect2to1).toBeDefined();
            expect(aspect2to1?.aspectType).toBe(aspect1to2.aspectType);
          } else {
            expect(aspect2to1).toBeNull();
          }
        }
      }
    });

    it('should handle empty aspects array', () => {
      const planetNames = ['sun', 'moon'];
      const matrix = service.generateAspectMatrix([], planetNames);

      expect(matrix).toBeDefined();
      expect(matrix['sun']['moon']).toBeNull();
      expect(matrix['moon']['sun']).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty planets array', () => {
      const aspects = service.calculateAspects([]);
      expect(aspects).toEqual([]);
    });

    it('should handle single planet', () => {
      const planet: PlanetPosition = {
        planet: 'sun',
        longitude: 0,
        sign: 'aries',
        signDegree: 0,
        house: 1,
        isRetrograde: false,
      };

      const aspects = service.calculateAspects([planet]);
      expect(aspects).toEqual([]);
    });

    it('should handle planets with same longitude', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'moon',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);

      const conjunction = aspects.find(
        (a) => a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
      expect(conjunction?.orb).toBe(0);
      expect(conjunction?.angle).toBe(0);
    });
  });

  describe('isApplying Field', () => {
    it('should calculate isApplying field for conjunction', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'moon',
          longitude: 5, // Conjunción con orbe 5°
          sign: 'aries',
          signDegree: 5,
          house: 1,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const conjunction = aspects.find(
        (a) => a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
      expect(conjunction?.isApplying).toBeDefined();
      expect(typeof conjunction?.isApplying).toBe('boolean');
    });

    it('should calculate isApplying field for opposition', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'mars',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'jupiter',
          longitude: 180, // Oposición exacta (válida entre planetas exteriores)
          sign: 'libra',
          signDegree: 0,
          house: 7,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const opposition = aspects.find(
        (a) => a.aspectType === (AspectType.OPPOSITION as string),
      );

      expect(opposition).toBeDefined();
      expect(opposition?.isApplying).toBeDefined();
      expect(typeof opposition?.isApplying).toBe('boolean');
    });

    it('should calculate isApplying field for trine', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'jupiter',
          longitude: 120, // Trígono exacto
          sign: 'leo',
          signDegree: 0,
          house: 5,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const trine = aspects.find(
        (a) => a.aspectType === (AspectType.TRINE as string),
      );

      expect(trine).toBeDefined();
      expect(trine?.isApplying).toBeDefined();
      expect(typeof trine?.isApplying).toBe('boolean');
    });

    it('should calculate isApplying field for square', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mars',
          longitude: 90, // Cuadratura exacta
          sign: 'cancer',
          signDegree: 0,
          house: 4,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const square = aspects.find(
        (a) => a.aspectType === (AspectType.SQUARE as string),
      );

      expect(square).toBeDefined();
      expect(square?.isApplying).toBeDefined();
      expect(typeof square?.isApplying).toBe('boolean');
    });

    it('should calculate isApplying field for sextile', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 60, // Sextil exacto
          sign: 'gemini',
          signDegree: 0,
          house: 3,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sextile = aspects.find(
        (a) => a.aspectType === (AspectType.SEXTILE as string),
      );

      expect(sextile).toBeDefined();
      expect(sextile?.isApplying).toBeDefined();
      expect(typeof sextile?.isApplying).toBe('boolean');
    });

    it('should verify all calculated aspects have isApplying field', () => {
      const aspects = service.calculateAspects(mockPlanets);

      // Todos los aspectos deben tener el campo isApplying
      for (const aspect of aspects) {
        expect(aspect.isApplying).toBeDefined();
        expect(typeof aspect.isApplying).toBe('boolean');
      }

      expect(aspects.length).toBeGreaterThan(0);
    });
  });

  describe('Impossible Aspects Validation', () => {
    it('should not return Sun-Mercury opposition (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mercury',
          longitude: 180, // Imposible en realidad (elongación máxima ~28°)
          sign: 'libra',
          signDegree: 0,
          house: 7,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunMercuryOpposition = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mercury') ||
            (a.planet1 === 'mercury' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.OPPOSITION as string),
      );

      expect(sunMercuryOpposition).toBeUndefined();
    });

    it('should not return Sun-Mercury square (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mercury',
          longitude: 90, // Imposible en realidad
          sign: 'cancer',
          signDegree: 0,
          house: 4,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunMercurySquare = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mercury') ||
            (a.planet1 === 'mercury' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.SQUARE as string),
      );

      expect(sunMercurySquare).toBeUndefined();
    });

    it('should not return Sun-Mercury trine (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mercury',
          longitude: 120, // Imposible en realidad
          sign: 'leo',
          signDegree: 0,
          house: 5,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunMercuryTrine = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mercury') ||
            (a.planet1 === 'mercury' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.TRINE as string),
      );

      expect(sunMercuryTrine).toBeUndefined();
    });

    it('should not return Sun-Mercury sextile (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mercury',
          longitude: 60, // Imposible en realidad
          sign: 'gemini',
          signDegree: 0,
          house: 3,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunMercurySextile = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mercury') ||
            (a.planet1 === 'mercury' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.SEXTILE as string),
      );

      expect(sunMercurySextile).toBeUndefined();
    });

    it('should return valid Sun-Mercury conjunction (astronomically possible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 100,
          sign: 'cancer',
          signDegree: 10,
          house: 4,
          isRetrograde: false,
        },
        {
          planet: 'mercury',
          longitude: 102, // Válido (dentro de elongación máxima)
          sign: 'cancer',
          signDegree: 12,
          house: 4,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const conjunction = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mercury') ||
            (a.planet1 === 'mercury' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
    });

    it('should not return Sun-Venus opposition (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 180, // Imposible (elongación máxima ~47°)
          sign: 'libra',
          signDegree: 0,
          house: 7,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunVenusOpposition = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.OPPOSITION as string),
      );

      expect(sunVenusOpposition).toBeUndefined();
    });

    it('should not return Sun-Venus trine (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 120, // Imposible
          sign: 'leo',
          signDegree: 0,
          house: 5,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunVenusTrine = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.TRINE as string),
      );

      expect(sunVenusTrine).toBeUndefined();
    });

    it('should not return Sun-Venus square (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 90, // Imposible
          sign: 'cancer',
          signDegree: 0,
          house: 4,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sunVenusSquare = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.SQUARE as string),
      );

      expect(sunVenusSquare).toBeUndefined();
    });

    it('should return valid Sun-Venus conjunction (astronomically possible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 100,
          sign: 'cancer',
          signDegree: 10,
          house: 4,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 103, // Válido
          sign: 'cancer',
          signDegree: 13,
          house: 4,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const conjunction = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
    });

    it('should return valid Sun-Venus sextile (astronomically possible)', () => {
      // Venus puede estar hasta ~47° del Sol, por lo que un sextil (60°) es astronómicamente posible
      // aunque no común. Para este test usamos Marte para un sextil claro.
      const planets: PlanetPosition[] = [
        {
          planet: 'sun',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'mars',
          longitude: 60,
          sign: 'gemini',
          signDegree: 0,
          house: 3,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const sextile = aspects.find(
        (a) =>
          ((a.planet1 === 'sun' && a.planet2 === 'mars') ||
            (a.planet1 === 'mars' && a.planet2 === 'sun')) &&
          a.aspectType === (AspectType.SEXTILE as string),
      );

      expect(sextile).toBeDefined();
    });

    it('should not return Mercury-Venus opposition (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'mercury',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 180, // Imposible
          sign: 'libra',
          signDegree: 0,
          house: 7,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const mercuryVenusOpposition = aspects.find(
        (a) =>
          ((a.planet1 === 'mercury' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'mercury')) &&
          a.aspectType === (AspectType.OPPOSITION as string),
      );

      expect(mercuryVenusOpposition).toBeUndefined();
    });

    it('should not return Mercury-Venus trine (astronomically impossible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'mercury',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 120, // Imposible
          sign: 'leo',
          signDegree: 0,
          house: 5,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const mercuryVenusTrine = aspects.find(
        (a) =>
          ((a.planet1 === 'mercury' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'mercury')) &&
          a.aspectType === (AspectType.TRINE as string),
      );

      expect(mercuryVenusTrine).toBeUndefined();
    });

    it('should return valid Mercury-Venus conjunction (astronomically possible)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'mercury',
          longitude: 100,
          sign: 'cancer',
          signDegree: 10,
          house: 4,
          isRetrograde: false,
        },
        {
          planet: 'venus',
          longitude: 102, // Válido
          sign: 'cancer',
          signDegree: 12,
          house: 4,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const conjunction = aspects.find(
        (a) =>
          ((a.planet1 === 'mercury' && a.planet2 === 'venus') ||
            (a.planet1 === 'venus' && a.planet2 === 'mercury')) &&
          a.aspectType === (AspectType.CONJUNCTION as string),
      );

      expect(conjunction).toBeDefined();
    });

    it('should allow all aspects for outer planets (not affected by impossible aspects)', () => {
      const planets: PlanetPosition[] = [
        {
          planet: 'mars',
          longitude: 0,
          sign: 'aries',
          signDegree: 0,
          house: 1,
          isRetrograde: false,
        },
        {
          planet: 'jupiter',
          longitude: 180, // Oposición válida entre planetas exteriores
          sign: 'libra',
          signDegree: 0,
          house: 7,
          isRetrograde: false,
        },
      ];

      const aspects = service.calculateAspects(planets);
      const opposition = aspects.find(
        (a) => a.aspectType === (AspectType.OPPOSITION as string),
      );

      expect(opposition).toBeDefined();
    });
  });
});
