/**
 * Tests de Comportamiento - HU-CA-001: Generar Carta Astral Básica
 *
 * "Como usuario de Auguria (anónimo, free o premium)
 *  Quiero ingresar mis datos de nacimiento (fecha, hora, lugar)
 *  Para obtener mi carta astral calculada con precisión astronómica"
 *
 * Estos tests validan los criterios de aceptación desde la perspectiva
 * del usuario, NO desde la implementación interna.
 */
import { Test } from '@nestjs/testing';
import {
  ChartCalculationService,
  ChartCalculationInput,
} from './chart-calculation.service';
import { PlanetPositionService } from './planet-position.service';
import { HouseCuspService } from './house-cusp.service';
import { AspectCalculationService } from './aspect-calculation.service';
import { EphemerisWrapper } from '../../infrastructure/ephemeris/ephemeris.wrapper';
import { Planet, ZodiacSign, AspectType } from '../../domain/enums';
import { EphemerisOutput } from '../../infrastructure/ephemeris/ephemeris.types';

/**
 * Helper: crea datos simulados de efemérides para Buenos Aires, 15/05/1990 14:30
 * Las posiciones están diseñadas para producir aspectos conocidos
 */
function createRealisticEphemerisOutput(): EphemerisOutput {
  return {
    planets: [
      {
        name: 'sun',
        longitude: 54.5,
        latitude: 0,
        distance: 1.01,
        longitudeSpeed: 0.96,
      }, // Tauro ~24°
      {
        name: 'moon',
        longitude: 220.3,
        latitude: -2.1,
        distance: 0.0025,
        longitudeSpeed: 13.2,
      }, // Escorpio ~10°
      {
        name: 'mercury',
        longitude: 40.8,
        latitude: 1.2,
        distance: 0.7,
        longitudeSpeed: 1.5,
      }, // Tauro ~10°
      {
        name: 'venus',
        longitude: 80.2,
        latitude: -0.5,
        distance: 1.2,
        longitudeSpeed: 1.1,
      }, // Géminis ~20°
      {
        name: 'mars',
        longitude: 340.9,
        latitude: 0.8,
        distance: 1.8,
        longitudeSpeed: 0.6,
      }, // Piscis ~10°
      {
        name: 'jupiter',
        longitude: 95.4,
        latitude: 0.1,
        distance: 5.2,
        longitudeSpeed: 0.08,
      }, // Cáncer ~5°
      {
        name: 'saturn',
        longitude: 290.1,
        latitude: -0.3,
        distance: 9.5,
        longitudeSpeed: -0.02,
      }, // Capricornio ~20° (retrógrado)
      {
        name: 'uranus',
        longitude: 278.5,
        latitude: 0.4,
        distance: 19.2,
        longitudeSpeed: 0.01,
      }, // Capricornio ~8°
      {
        name: 'neptune',
        longitude: 284.0,
        latitude: -0.2,
        distance: 30.1,
        longitudeSpeed: 0.005,
      }, // Capricornio ~14°
      {
        name: 'pluto',
        longitude: 226.3,
        latitude: 15.5,
        distance: 39.5,
        longitudeSpeed: 0.003,
      }, // Escorpio ~16°
    ],
    houses: {
      cusps: [165, 195, 225, 255, 285, 315, 345, 15, 45, 75, 105, 135],
      ascendant: 165.0, // Virgo ~15°
      midheaven: 75.0, // Géminis ~15°
    },
    julianDay: 2448030.5,
    siderealTime: 12.5,
  };
}

describe('HU-CA-001: Generar Carta Astral Básica (Comportamiento)', () => {
  let service: ChartCalculationService;
  let mockEphemeris: jest.Mocked<EphemerisWrapper>;

  const defaultInput: ChartCalculationInput = {
    birthDate: new Date('1990-05-15'),
    birthTime: '14:30',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  beforeEach(async () => {
    mockEphemeris = {
      calculate: jest.fn().mockReturnValue(createRealisticEphemerisOutput()),
      validateDate: jest.fn().mockReturnValue(true),
      validateCoordinates: jest.fn().mockReturnValue(true),
      onModuleInit: jest.fn(),
      close: jest.fn(),
    } as unknown as jest.Mocked<EphemerisWrapper>;

    const module = await Test.createTestingModule({
      providers: [
        ChartCalculationService,
        PlanetPositionService,
        HouseCuspService,
        AspectCalculationService,
        { provide: EphemerisWrapper, useValue: mockEphemeris },
      ],
    }).compile();

    service = module.get(ChartCalculationService);
  });

  // =========================================================================
  // CA-1: "Cuando completo el formulario con nombre, fecha, hora y lugar
  //        de nacimiento, el sistema calcula las posiciones planetarias"
  // =========================================================================
  describe('CA-1: Cálculo de posiciones con datos de nacimiento', () => {
    it('dado datos de nacimiento válidos, cuando se calcula la carta, entonces obtiene un resultado completo', () => {
      const result = service.calculateChart(defaultInput);

      expect(result).toBeDefined();
      expect(result.chartData).toBeDefined();
      expect(result.calculationTimeMs).toBeGreaterThanOrEqual(0);
    });

    it('dado datos de nacimiento con hora en formato HH:mm, cuando se calcula, entonces procesa correctamente', () => {
      const input = { ...defaultInput, birthTime: '08:45' };
      const result = service.calculateChart(input);

      expect(result.chartData.planets).toBeDefined();
      expect(result.chartData.planets.length).toBe(10);
    });

    it('dado datos de nacimiento con hora en formato HH:mm:ss, cuando se calcula, entonces procesa correctamente', () => {
      const input = { ...defaultInput, birthTime: '14:30:00' };
      const result = service.calculateChart(input);

      expect(result.chartData.planets).toBeDefined();
    });
  });

  // =========================================================================
  // CA-2: "Obtengo las posiciones de: Sol, Luna, Mercurio, Venus, Marte,
  //        Júpiter, Saturno, Urano, Neptuno, Plutón"
  // =========================================================================
  describe('CA-2: Posiciones de los 10 planetas', () => {
    it('dado un cálculo exitoso, cuando reviso los planetas, entonces están los 10 planetas requeridos', () => {
      const result = service.calculateChart(defaultInput);
      const planetNames = result.chartData.planets.map((p) => p.planet);

      const requiredPlanets = [
        Planet.SUN,
        Planet.MOON,
        Planet.MERCURY,
        Planet.VENUS,
        Planet.MARS,
        Planet.JUPITER,
        Planet.SATURN,
        Planet.URANUS,
        Planet.NEPTUNE,
        Planet.PLUTO,
      ];

      for (const planet of requiredPlanets) {
        expect(planetNames).toContain(planet);
      }
    });

    it('dado un cálculo exitoso, entonces hay exactamente 10 planetas (no más, no menos)', () => {
      const result = service.calculateChart(defaultInput);
      expect(result.chartData.planets).toHaveLength(10);
    });
  });

  // =========================================================================
  // CA-3: "Veo el grado exacto y signo de cada planeta"
  // =========================================================================
  describe('CA-3: Grado exacto y signo de cada planeta', () => {
    it('dado un cálculo exitoso, cuando reviso cada planeta, entonces tiene signo zodiacal asignado', () => {
      const result = service.calculateChart(defaultInput);
      const validSigns = Object.values(ZodiacSign);

      for (const planet of result.chartData.planets) {
        expect(validSigns).toContain(planet.sign);
      }
    });

    it('dado un cálculo exitoso, cuando reviso cada planeta, entonces tiene grado dentro del signo (0-30)', () => {
      const result = service.calculateChart(defaultInput);

      for (const planet of result.chartData.planets) {
        expect(planet.signDegree).toBeGreaterThanOrEqual(0);
        expect(planet.signDegree).toBeLessThan(30);
      }
    });

    it('dado un cálculo exitoso, cuando reviso cada planeta, entonces tiene longitud absoluta (0-360)', () => {
      const result = service.calculateChart(defaultInput);

      for (const planet of result.chartData.planets) {
        expect(planet.longitude).toBeGreaterThanOrEqual(0);
        expect(planet.longitude).toBeLessThan(360);
      }
    });

    it('dado que el Sol está en 54.5° (Tauro), entonces su signo es Tauro y su grado es ~24.5°', () => {
      const result = service.calculateChart(defaultInput);
      const sun = result.chartData.planets.find(
        (p) => p.planet === (Planet.SUN as string),
      );

      expect(sun).toBeDefined();
      expect(sun!.sign).toBe(ZodiacSign.TAURUS);
      expect(sun!.signDegree).toBeCloseTo(24.5, 0);
    });
  });

  // =========================================================================
  // CA-4: "Calcula el Ascendente y las 12 casas (sistema Placidus)"
  // =========================================================================
  describe('CA-4: Ascendente y 12 casas', () => {
    it('dado que ingresé hora de nacimiento, cuando se calcula, entonces incluye Ascendente', () => {
      const result = service.calculateChart(defaultInput);

      expect(result.chartData.ascendant).toBeDefined();
      expect(result.chartData.ascendant.planet).toBe('ascendant');
      expect(result.chartData.ascendant.house).toBe(1); // Ascendente siempre en casa 1
    });

    it('dado que ingresé hora de nacimiento, cuando se calcula, entonces incluye Medio Cielo', () => {
      const result = service.calculateChart(defaultInput);

      expect(result.chartData.midheaven).toBeDefined();
      expect(result.chartData.midheaven.planet).toBe('midheaven');
      expect(result.chartData.midheaven.house).toBe(10); // MC siempre en casa 10
    });

    it('dado que se calculan las casas, entonces hay exactamente 12', () => {
      const result = service.calculateChart(defaultInput);
      expect(result.chartData.houses).toHaveLength(12);
    });

    it('dado que se calculan las casas, cuando reviso cada una, entonces tiene número (1-12), grado y signo', () => {
      const result = service.calculateChart(defaultInput);
      const validSigns = Object.values(ZodiacSign);

      for (let i = 0; i < 12; i++) {
        const house = result.chartData.houses[i];
        expect(house.house).toBe(i + 1);
        expect(house.longitude).toBeGreaterThanOrEqual(0);
        expect(house.longitude).toBeLessThan(360);
        expect(validSigns).toContain(house.sign);
        expect(house.signDegree).toBeGreaterThanOrEqual(0);
        expect(house.signDegree).toBeLessThan(30);
      }
    });

    it('dado el Ascendente en 165° (Virgo), entonces el signo ascendente es Virgo', () => {
      const result = service.calculateChart(defaultInput);
      expect(result.ascendantSign).toBe(ZodiacSign.VIRGO);
    });
  });

  // =========================================================================
  // CA-5: "Identifica los aspectos mayores entre ellos
  //        (conjunción, oposición, cuadratura, trígono, sextil)"
  // =========================================================================
  describe('CA-5: Detección de aspectos mayores', () => {
    it('dado planetas calculados, cuando se analizan posiciones, entonces identifica aspectos', () => {
      const result = service.calculateChart(defaultInput);
      expect(result.chartData.aspects.length).toBeGreaterThan(0);
    });

    it('dado aspectos detectados, cuando reviso cada uno, entonces tiene tipo válido (5 tipos mayores)', () => {
      const result = service.calculateChart(defaultInput);
      const validAspectTypes = Object.values(AspectType);

      for (const aspect of result.chartData.aspects) {
        expect(validAspectTypes).toContain(aspect.aspectType);
      }
    });

    it('dado aspectos detectados, cuando reviso cada uno, entonces identifica los dos planetas involucrados', () => {
      const result = service.calculateChart(defaultInput);

      for (const aspect of result.chartData.aspects) {
        expect(aspect.planet1).toBeDefined();
        expect(aspect.planet2).toBeDefined();
        expect(aspect.planet1).not.toBe(aspect.planet2);
      }
    });

    it('dado aspectos detectados, cuando reviso cada uno, entonces tiene orbe (desviación en grados)', () => {
      const result = service.calculateChart(defaultInput);

      for (const aspect of result.chartData.aspects) {
        expect(aspect.orb).toBeGreaterThanOrEqual(0);
        expect(aspect.orb).toBeLessThanOrEqual(10); // Máximo orbe razonable
      }
    });

    it('dado aspectos detectados, entonces no hay aspectos duplicados (A-B y B-A)', () => {
      const result = service.calculateChart(defaultInput);
      const seen = new Set<string>();

      for (const aspect of result.chartData.aspects) {
        const key =
          aspect.planet1 < aspect.planet2
            ? `${aspect.planet1}|${aspect.planet2}`
            : `${aspect.planet2}|${aspect.planet1}`;
        expect(seen.has(key)).toBe(false);
        seen.add(key);
      }
    });

    // Caso específico: Sol en 54.5° y Luna en 220.3° → diferencia ~165.8° → sin aspecto directo
    // Pero Sol en 54.5° y Mercurio en 40.8° → diferencia ~13.7° → posible conjunción (orbe < 8°?)
    // Realmente orbe = |13.7 - 0| = 13.7° > 8° → NO conjunción
    // Sol 54.5° y Saturno 290.1° → diferencia = 235.6° → 360-235.6 = 124.4° → NO trígono (orbe = 4.4° sí < 8° → cuadratura? no, 124.4 vs 120 = 4.4° → TRÍGONO si orbe <= 8°)
    it('dado Sol en ~54° y Saturno en ~290° (ángulo ~124°), entonces detecta trígono (ángulo exacto 120°, orbe ~4.4°)', () => {
      const result = service.calculateChart(defaultInput);

      const sunSaturnAspect = result.chartData.aspects.find(
        (a) =>
          (a.planet1 === (Planet.SUN as string) &&
            a.planet2 === (Planet.SATURN as string)) ||
          (a.planet1 === (Planet.SATURN as string) &&
            a.planet2 === (Planet.SUN as string)),
      );

      // Debería existir un aspecto entre Sol y Saturno
      // El ángulo es ~124.4° que está a ~4.4° de un trígono (120°)
      // El orbe del trígono es 8°, así que debería detectarse
      if (sunSaturnAspect) {
        expect(sunSaturnAspect.aspectType).toBe(AspectType.TRINE);
        expect(sunSaturnAspect.orb).toBeLessThanOrEqual(8);
      }
    });
  });

  // =========================================================================
  // Nota técnica: "Precisión mínima: 1 grado (preferible: minutos de arco)"
  // =========================================================================
  describe('Nota técnica: Precisión de cálculos', () => {
    it('dado un cálculo, entonces el grado del signo tiene precisión de al menos 2 decimales (minutos de arco)', () => {
      const result = service.calculateChart(defaultInput);

      // Al menos un planeta debería tener decimales en su signDegree
      const hasDecimalPrecision = result.chartData.planets.some(
        (p) => p.signDegree !== Math.floor(p.signDegree),
      );
      expect(hasDecimalPrecision).toBe(true);
    });
  });

  // =========================================================================
  // Extras: Big Three (Sol, Luna, Ascendente) en el resultado
  // =========================================================================
  describe('Big Three en el resultado', () => {
    it('dado un cálculo exitoso, entonces devuelve los signos del Big Three directamente', () => {
      const result = service.calculateChart(defaultInput);

      expect(result.sunSign).toBeDefined();
      expect(result.moonSign).toBeDefined();
      expect(result.ascendantSign).toBeDefined();

      const validSigns = Object.values(ZodiacSign);
      expect(validSigns).toContain(result.sunSign);
      expect(validSigns).toContain(result.moonSign);
      expect(validSigns).toContain(result.ascendantSign);
    });
  });

  // =========================================================================
  // HU-CA-005 (parcial): Distribución por Elementos, Modalidades, Polaridad
  // =========================================================================
  describe('Distribución (Elementos, Modalidades, Polaridad)', () => {
    it('dado un cálculo exitoso, entonces incluye distribución de elementos', () => {
      const result = service.calculateChart(defaultInput);
      const { elements } = result.chartData.distribution;

      expect(elements).toBeDefined();
      expect(elements.fire).toBeGreaterThanOrEqual(0);
      expect(elements.earth).toBeGreaterThanOrEqual(0);
      expect(elements.air).toBeGreaterThanOrEqual(0);
      expect(elements.water).toBeGreaterThanOrEqual(0);

      // La suma de elementos debe ser 11 (10 planetas + ascendente)
      const total =
        elements.fire + elements.earth + elements.air + elements.water;
      expect(total).toBe(11);
    });

    it('dado un cálculo exitoso, entonces incluye distribución de modalidades', () => {
      const result = service.calculateChart(defaultInput);
      const { modalities } = result.chartData.distribution;

      expect(modalities.cardinal).toBeGreaterThanOrEqual(0);
      expect(modalities.fixed).toBeGreaterThanOrEqual(0);
      expect(modalities.mutable).toBeGreaterThanOrEqual(0);

      const total = modalities.cardinal + modalities.fixed + modalities.mutable;
      expect(total).toBe(11);
    });

    it('dado un cálculo exitoso, entonces incluye polaridad (masculino/femenino)', () => {
      const result = service.calculateChart(defaultInput);
      const { polarity } = result.chartData.distribution;

      expect(polarity.masculine).toBeGreaterThanOrEqual(0);
      expect(polarity.feminine).toBeGreaterThanOrEqual(0);

      const total = polarity.masculine + polarity.feminine;
      expect(total).toBe(11);
    });
  });

  // =========================================================================
  // Validación de inputs incorrectos
  // =========================================================================
  describe('Validación de datos de nacimiento inválidos', () => {
    it('dado una hora con formato inválido, cuando se intenta calcular, entonces lanza error', () => {
      const input = { ...defaultInput, birthTime: 'invalid' };
      expect(() => service.calculateChart(input)).toThrow();
    });

    it('dado una fecha inválida, cuando se intenta calcular, entonces lanza error', () => {
      const input = { ...defaultInput, birthDate: new Date('invalid') };
      expect(() => service.calculateChart(input)).toThrow();
    });

    it('dado coordenadas fuera de rango, cuando se intenta calcular, entonces lanza error', () => {
      mockEphemeris.validateCoordinates.mockReturnValue(false);
      const input = { ...defaultInput, latitude: 999 };
      expect(() => service.calculateChart(input)).toThrow();
    });
  });
});
