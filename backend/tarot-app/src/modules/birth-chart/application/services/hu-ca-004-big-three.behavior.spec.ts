/**
 * Tests de Comportamiento - HU-CA-004: Ver Interpretación Big Three
 *
 * "Como usuario de cualquier plan (incluso anónimo)
 *  Quiero ver la interpretación de mi Sol, Luna y Ascendente
 *  Para entender los tres pilares fundamentales de mi carta"
 *
 * Y parcialmente HU-CA-005: Ver Informe Completo Estático
 *
 * "Como usuario Free o Premium
 *  Quiero ver interpretaciones de todos los elementos de mi carta
 *  Para obtener un análisis astrológico profundo"
 */
import { Test } from '@nestjs/testing';
import { ChartInterpretationService } from './chart-interpretation.service';
import { BirthChartInterpretation } from '../../entities/birth-chart-interpretation.entity';
import {
  Planet,
  ZodiacSign,
  AspectType,
  InterpretationCategory,
} from '../../domain/enums';
import {
  IBirthChartInterpretationRepository,
  BIRTH_CHART_INTERPRETATION_REPOSITORY,
} from '../../domain/interfaces';
import { ChartData } from '../../entities/birth-chart.entity';

/**
 * Helper: crea un mock del repositorio con interpretaciones del Big Three
 */
function createMockRepo(): jest.Mocked<IBirthChartInterpretationRepository> {
  const createInterpretation = (
    category: InterpretationCategory,
    content: string,
    planet?: Planet | null,
    sign?: ZodiacSign | null,
  ): BirthChartInterpretation => {
    const interp = new BirthChartInterpretation();
    interp.id = Math.floor(Math.random() * 1000);
    interp.category = category;
    interp.planet = planet || null;
    interp.sign = sign || null;
    interp.house = null;
    interp.aspectType = null;
    interp.planet2 = null;
    interp.content = content;
    interp.summary = null;
    interp.isActive = true;
    interp.createdAt = new Date();
    interp.updatedAt = new Date();
    return interp;
  };

  return {
    findPlanetInSign: jest.fn(),
    findPlanetInHouse: jest.fn(),
    findAspect: jest.fn(),
    findAscendant: jest.fn(),
    findPlanetIntro: jest.fn(),
    findBigThree: jest.fn().mockResolvedValue({
      sun: createInterpretation(
        InterpretationCategory.PLANET_IN_SIGN,
        'Tu Sol en Leo ilumina tu camino con creatividad y confianza. Posees una naturaleza generosa y una presencia que atrae a los demás. Tu propósito de vida se conecta con la expresión auténtica de tu individualidad.',
        Planet.SUN,
        ZodiacSign.LEO,
      ),
      moon: createInterpretation(
        InterpretationCategory.PLANET_IN_SIGN,
        'Tu Luna en Escorpio te otorga una profundidad emocional extraordinaria. Sientes con una intensidad que pocos comprenden. Tu mundo interior es rico, complejo y transformador, y necesitas relaciones profundas para sentirte seguro.',
        Planet.MOON,
        ZodiacSign.SCORPIO,
      ),
      ascendant: createInterpretation(
        InterpretationCategory.ASCENDANT,
        'Tu Ascendente en Virgo te presenta al mundo como alguien analítico, servicial y detallista. La primera impresión que causas es de competencia y modestia. Inicias experiencias con precaución y método.',
        null,
        ZodiacSign.VIRGO,
      ),
    }),
    findAllForChart: jest.fn().mockResolvedValue(new Map()),
    countByCategory: jest.fn(),
  } as jest.Mocked<IBirthChartInterpretationRepository>;
}

/**
 * Helper: crea datos completos de carta para interpretación completa
 */
function createFullChartData(): ChartData {
  return {
    planets: [
      {
        planet: Planet.SUN,
        longitude: 130,
        sign: ZodiacSign.LEO,
        signDegree: 10,
        house: 10,
        isRetrograde: false,
      },
      {
        planet: Planet.MOON,
        longitude: 220,
        sign: ZodiacSign.SCORPIO,
        signDegree: 10,
        house: 1,
        isRetrograde: false,
      },
      {
        planet: Planet.MERCURY,
        longitude: 140,
        sign: ZodiacSign.LEO,
        signDegree: 20,
        house: 10,
        isRetrograde: false,
      },
      {
        planet: Planet.VENUS,
        longitude: 80,
        sign: ZodiacSign.GEMINI,
        signDegree: 20,
        house: 8,
        isRetrograde: false,
      },
      {
        planet: Planet.MARS,
        longitude: 15,
        sign: ZodiacSign.ARIES,
        signDegree: 15,
        house: 6,
        isRetrograde: false,
      },
      {
        planet: Planet.JUPITER,
        longitude: 250,
        sign: ZodiacSign.SAGITTARIUS,
        signDegree: 10,
        house: 2,
        isRetrograde: false,
      },
      {
        planet: Planet.SATURN,
        longitude: 290,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 20,
        house: 3,
        isRetrograde: true,
      },
      {
        planet: Planet.URANUS,
        longitude: 278,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 8,
        house: 3,
        isRetrograde: false,
      },
      {
        planet: Planet.NEPTUNE,
        longitude: 284,
        sign: ZodiacSign.CAPRICORN,
        signDegree: 14,
        house: 3,
        isRetrograde: false,
      },
      {
        planet: Planet.PLUTO,
        longitude: 226,
        sign: ZodiacSign.SCORPIO,
        signDegree: 16,
        house: 1,
        isRetrograde: false,
      },
    ],
    houses: Array.from({ length: 12 }, (_, i) => ({
      house: i + 1,
      longitude: i * 30,
      sign: Object.values(ZodiacSign)[i],
      signDegree: 0,
    })),
    aspects: [
      {
        planet1: Planet.SUN,
        planet2: Planet.MERCURY,
        aspectType: AspectType.CONJUNCTION,
        angle: 10,
        orb: 10,
        isApplying: true,
      },
      {
        planet1: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.SQUARE,
        angle: 90,
        orb: 0,
        isApplying: false,
      },
      {
        planet1: Planet.VENUS,
        planet2: Planet.MARS,
        aspectType: AspectType.SEXTILE,
        angle: 65,
        orb: 5,
        isApplying: true,
      },
      {
        planet1: Planet.JUPITER,
        planet2: Planet.SATURN,
        aspectType: AspectType.SEXTILE,
        angle: 40,
        orb: 20,
        isApplying: false,
      },
    ],
    ascendant: {
      planet: 'ascendant',
      longitude: 165,
      sign: ZodiacSign.VIRGO,
      signDegree: 15,
      house: 1,
      isRetrograde: false,
    },
    midheaven: {
      planet: 'midheaven',
      longitude: 75,
      sign: ZodiacSign.GEMINI,
      signDegree: 15,
      house: 10,
      isRetrograde: false,
    },
    distribution: {
      elements: { fire: 3, earth: 4, air: 2, water: 3 },
      modalities: { cardinal: 3, fixed: 5, mutable: 4 },
      polarity: { masculine: 5, feminine: 7 },
    },
  };
}

describe('HU-CA-004: Ver Interpretación Big Three (Comportamiento)', () => {
  let service: ChartInterpretationService;
  let mockRepo: jest.Mocked<IBirthChartInterpretationRepository>;

  beforeEach(async () => {
    mockRepo = createMockRepo();

    const module = await Test.createTestingModule({
      providers: [
        ChartInterpretationService,
        {
          provide: BIRTH_CHART_INTERPRETATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get(ChartInterpretationService);
  });

  // =========================================================================
  // CA-1: "Veo la interpretación del Sol en mi signo zodiacal"
  // =========================================================================
  describe('CA-1: Interpretación del Sol', () => {
    it('dado que la carta fue calculada, cuando pido Big Three, entonces contiene interpretación del Sol', async () => {
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.LEO,
        ZodiacSign.SCORPIO,
        ZodiacSign.VIRGO,
      );

      expect(result.sun).toBeDefined();
      expect(result.sun.sign).toBe(ZodiacSign.LEO);
      expect(result.sun.interpretation).toBeTruthy();
      expect(result.sun.interpretation.length).toBeGreaterThan(50);
    });

    it('dado la interpretación del Sol, entonces incluye nombre del signo en español', async () => {
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.LEO,
        ZodiacSign.SCORPIO,
        ZodiacSign.VIRGO,
      );

      expect(result.sun.signName).toBe('Leo');
    });
  });

  // =========================================================================
  // CA-2: "Veo la interpretación de la Luna en mi signo zodiacal"
  // =========================================================================
  describe('CA-2: Interpretación de la Luna', () => {
    it('dado que la carta tiene Luna calculada, cuando pido Big Three, entonces contiene interpretación de la Luna', async () => {
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.LEO,
        ZodiacSign.SCORPIO,
        ZodiacSign.VIRGO,
      );

      expect(result.moon).toBeDefined();
      expect(result.moon.sign).toBe(ZodiacSign.SCORPIO);
      expect(result.moon.interpretation).toBeTruthy();
      expect(result.moon.interpretation.length).toBeGreaterThan(50);
    });
  });

  // =========================================================================
  // CA-3: "Veo la interpretación del Ascendente en mi signo"
  // =========================================================================
  describe('CA-3: Interpretación del Ascendente', () => {
    it('dado que tengo hora de nacimiento y Ascendente calculado, entonces contiene interpretación del Ascendente', async () => {
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.LEO,
        ZodiacSign.SCORPIO,
        ZodiacSign.VIRGO,
      );

      expect(result.ascendant).toBeDefined();
      expect(result.ascendant.sign).toBe(ZodiacSign.VIRGO);
      expect(result.ascendant.interpretation).toBeTruthy();
      expect(result.ascendant.interpretation.length).toBeGreaterThan(50);
    });
  });

  // =========================================================================
  // CA-4: "SOLO veo estas tres interpretaciones (no el resto de planetas)"
  // =========================================================================
  describe('CA-4: Solo Big Three para anónimos', () => {
    it('dado que soy usuario anónimo, cuando pido Big Three, entonces SOLO retorna Sol, Luna y Ascendente', async () => {
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.LEO,
        ZodiacSign.SCORPIO,
        ZodiacSign.VIRGO,
      );

      // Verificar que solo tiene las 3 propiedades del Big Three
      const keys = Object.keys(result);
      expect(keys).toContain('sun');
      expect(keys).toContain('moon');
      expect(keys).toContain('ascendant');
      expect(keys).toHaveLength(3);
    });
  });

  // =========================================================================
  // CA-5: "Son textos de al menos 2-3 párrafos con contenido significativo"
  // =========================================================================
  describe('CA-5: Textos con contenido significativo', () => {
    it('dado que las interpretaciones se muestran, entonces son textos sustanciales (>100 caracteres)', async () => {
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.LEO,
        ZodiacSign.SCORPIO,
        ZodiacSign.VIRGO,
      );

      expect(result.sun.interpretation.length).toBeGreaterThan(100);
      expect(result.moon.interpretation.length).toBeGreaterThan(100);
      expect(result.ascendant.interpretation.length).toBeGreaterThan(100);
    });

    it('dado que no hay interpretación en DB, entonces genera texto por defecto significativo', async () => {
      mockRepo.findBigThree.mockResolvedValue({
        sun: null,
        moon: null,
        ascendant: null,
      });

      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.ARIES,
        ZodiacSign.CANCER,
        ZodiacSign.LIBRA,
      );

      // Textos por defecto deben existir y ser significativos
      expect(result.sun.interpretation.length).toBeGreaterThan(50);
      expect(result.moon.interpretation.length).toBeGreaterThan(50);
      expect(result.ascendant.interpretation.length).toBeGreaterThan(50);

      // Deben mencionar el signo correspondiente
      expect(result.sun.interpretation).toContain('Aries');
      expect(result.moon.interpretation).toContain('Cáncer');
      expect(result.ascendant.interpretation).toContain('Libra');
    });
  });

  // =========================================================================
  // Big Three funciona con todas las combinaciones de signos
  // =========================================================================
  describe('Big Three con distintas combinaciones', () => {
    it('dado cualquier combinación de 3 signos, entonces genera Big Three', async () => {
      // Probar con combinación muy diferente
      const result = await service.generateBigThreeInterpretation(
        ZodiacSign.PISCES,
        ZodiacSign.ARIES,
        ZodiacSign.CAPRICORN,
      );

      expect(result.sun).toBeDefined();
      expect(result.moon).toBeDefined();
      expect(result.ascendant).toBeDefined();
    });
  });
});

describe('HU-CA-005: Ver Informe Completo Estático (Comportamiento)', () => {
  let service: ChartInterpretationService;
  let mockRepo: jest.Mocked<IBirthChartInterpretationRepository>;

  beforeEach(async () => {
    mockRepo = createMockRepo();

    // Para el informe completo, el findAllForChart retorna un Map con interpretaciones
    const interpretationsMap = new Map<string, BirthChartInterpretation>();

    // Agregar interpretaciones de Sol en Leo
    const sunInLeo = new BirthChartInterpretation();
    sunInLeo.content = 'El Sol en Leo representa creatividad y liderazgo...';
    sunInLeo.category = InterpretationCategory.PLANET_IN_SIGN;
    const sunKey = BirthChartInterpretation.generateKey(
      InterpretationCategory.PLANET_IN_SIGN,
      Planet.SUN,
      ZodiacSign.LEO,
    );
    interpretationsMap.set(sunKey, sunInLeo);

    // Agregar interpretaciones de Luna en Escorpio
    const moonInScorpio = new BirthChartInterpretation();
    moonInScorpio.content = 'La Luna en Escorpio revela emociones profundas...';
    moonInScorpio.category = InterpretationCategory.PLANET_IN_SIGN;
    const moonKey = BirthChartInterpretation.generateKey(
      InterpretationCategory.PLANET_IN_SIGN,
      Planet.MOON,
      ZodiacSign.SCORPIO,
    );
    interpretationsMap.set(moonKey, moonInScorpio);

    // Agregar Ascendente en Virgo
    const ascVirgo = new BirthChartInterpretation();
    ascVirgo.content = 'El Ascendente en Virgo muestra análisis y servicio...';
    ascVirgo.category = InterpretationCategory.ASCENDANT;
    const ascKey = BirthChartInterpretation.generateKey(
      InterpretationCategory.ASCENDANT,
      null,
      ZodiacSign.VIRGO,
    );
    interpretationsMap.set(ascKey, ascVirgo);

    mockRepo.findAllForChart.mockResolvedValue(interpretationsMap);

    const module = await Test.createTestingModule({
      providers: [
        ChartInterpretationService,
        {
          provide: BIRTH_CHART_INTERPRETATION_REPOSITORY,
          useValue: mockRepo,
        },
      ],
    }).compile();

    service = module.get(ChartInterpretationService);
  });

  // =========================================================================
  // CA-1: "Veo interpretaciones para TODOS los planetas en sus signos"
  // =========================================================================
  describe('CA-1: Interpretaciones de todos los planetas', () => {
    it('dado que soy Free/Premium, cuando pido informe completo, entonces hay interpretación para cada planeta', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      // Debe haber interpretación para los 10 planetas
      expect(result.planets).toHaveLength(10);

      const planetNames = result.planets.map((p) => p.planet);
      expect(planetNames).toContain(Planet.SUN);
      expect(planetNames).toContain(Planet.MOON);
      expect(planetNames).toContain(Planet.MERCURY);
      expect(planetNames).toContain(Planet.VENUS);
      expect(planetNames).toContain(Planet.MARS);
      expect(planetNames).toContain(Planet.JUPITER);
      expect(planetNames).toContain(Planet.SATURN);
      expect(planetNames).toContain(Planet.URANUS);
      expect(planetNames).toContain(Planet.NEPTUNE);
      expect(planetNames).toContain(Planet.PLUTO);
    });

    it('dado cada planeta interpretado, entonces incluye su signo y casa', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      for (const planet of result.planets) {
        expect(planet.sign).toBeDefined();
        expect(planet.signName).toBeTruthy();
        expect(planet.house).toBeGreaterThanOrEqual(1);
        expect(planet.house).toBeLessThanOrEqual(12);
      }
    });
  });

  // =========================================================================
  // CA-4: "Veo: Introducción del planeta + Planeta en Signo +
  //        Planeta en Casa + Aspectos"
  // =========================================================================
  describe('CA-4: Estructura de interpretación por planeta', () => {
    it('dado cada planeta, entonces tiene campos para intro, inSign, inHouse y aspectos', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      for (const planet of result.planets) {
        // Estos campos existen (pueden ser undefined si no hay texto en DB)
        expect('intro' in planet).toBe(true);
        expect('inSign' in planet).toBe(true);
        expect('inHouse' in planet).toBe(true);
        expect('aspects' in planet).toBe(true);
        expect(Array.isArray(planet.aspects)).toBe(true);
      }
    });
  });

  // =========================================================================
  // CA-5: "Veo distribución por: Elementos, Modalidades"
  // =========================================================================
  describe('CA-5: Distribución con porcentajes', () => {
    it('dado el informe completo, entonces incluye distribución de elementos con porcentajes', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      expect(result.distribution).toBeDefined();
      expect(result.distribution.elements).toHaveLength(4);

      for (const element of result.distribution.elements) {
        expect(element.name).toBeTruthy();
        expect(element.count).toBeGreaterThanOrEqual(0);
        expect(element.percentage).toBeGreaterThanOrEqual(0);
        expect(element.percentage).toBeLessThanOrEqual(100);
      }

      // Los nombres deben estar en español
      const elementNames = result.distribution.elements.map((e) => e.name);
      expect(elementNames).toContain('Fuego');
      expect(elementNames).toContain('Tierra');
      expect(elementNames).toContain('Aire');
      expect(elementNames).toContain('Agua');
    });

    it('dado el informe completo, entonces incluye distribución de modalidades con porcentajes', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      expect(result.distribution.modalities).toHaveLength(3);

      const modalityNames = result.distribution.modalities.map((m) => m.name);
      expect(modalityNames).toContain('Cardinal');
      expect(modalityNames).toContain('Fijo');
      expect(modalityNames).toContain('Mutable');
    });
  });

  // =========================================================================
  // Resumen de aspectos
  // =========================================================================
  describe('Resumen de aspectos en informe completo', () => {
    it('dado el informe completo, entonces incluye resumen de aspectos armónicos vs desafiantes', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      expect(result.aspectSummary).toBeDefined();
      expect(result.aspectSummary.total).toBeGreaterThanOrEqual(0);
      expect(result.aspectSummary.harmonious).toBeGreaterThanOrEqual(0);
      expect(result.aspectSummary.challenging).toBeGreaterThanOrEqual(0);
    });
  });

  // =========================================================================
  // El Big Three está incluido en el informe completo
  // =========================================================================
  describe('Big Three dentro del informe completo', () => {
    it('dado el informe completo, entonces también incluye Big Three', async () => {
      const chartData = createFullChartData();
      const result = await service.generateFullInterpretation(chartData);

      expect(result.bigThree).toBeDefined();
      expect(result.bigThree.sun).toBeDefined();
      expect(result.bigThree.moon).toBeDefined();
      expect(result.bigThree.ascendant).toBeDefined();
    });
  });
});
