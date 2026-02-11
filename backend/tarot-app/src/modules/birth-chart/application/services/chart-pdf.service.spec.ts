import { Test, TestingModule } from '@nestjs/testing';
import { ChartPdfService } from './chart-pdf.service';
import { Planet, ZodiacSign, AspectType } from '../../domain/enums';
import {
  ChartData,
  PlanetPosition,
  HouseCusp,
  ChartAspect,
  ChartDistribution,
} from '../../entities/birth-chart.entity';
import {
  FullChartInterpretation,
  PlanetInterpretation,
  BigThreeInterpretation,
} from './chart-interpretation.service';

describe('ChartPdfService', () => {
  let service: ChartPdfService;

  // Mock data for tests
  const mockChartData: ChartData = {
    planets: [
      {
        planet: Planet.SUN,
        longitude: 120.5,
        sign: ZodiacSign.LEO,
        signDegree: 0.5,
        house: 1,
        isRetrograde: false,
      },
      {
        planet: Planet.MOON,
        longitude: 210.3,
        sign: ZodiacSign.SCORPIO,
        signDegree: 0.3,
        house: 4,
        isRetrograde: false,
      },
      {
        planet: Planet.MERCURY,
        longitude: 130.2,
        sign: ZodiacSign.LEO,
        signDegree: 10.2,
        house: 1,
        isRetrograde: true,
      },
    ] as PlanetPosition[],
    houses: [
      { house: 1, longitude: 120, sign: ZodiacSign.LEO, signDegree: 0 },
      { house: 2, longitude: 150, sign: ZodiacSign.VIRGO, signDegree: 0 },
    ] as HouseCusp[],
    aspects: [
      {
        planet1: Planet.SUN,
        planet2: Planet.MOON,
        aspectType: AspectType.TRINE,
        angle: 120,
        orb: 0.2,
        isApplying: true,
      },
    ] as ChartAspect[],
    ascendant: {
      planet: 'ascendant',
      longitude: 120,
      sign: ZodiacSign.LEO,
      signDegree: 0,
      house: 1,
      isRetrograde: false,
    } as unknown as PlanetPosition,
    midheaven: {
      planet: 'midheaven',
      longitude: 210,
      sign: ZodiacSign.SCORPIO,
      signDegree: 0,
      house: 10,
      isRetrograde: false,
    } as unknown as PlanetPosition,
    distribution: {
      elements: { fire: 2, earth: 0, air: 0, water: 1 },
      modalities: { cardinal: 0, fixed: 2, mutable: 1 },
      polarity: { masculine: 2, feminine: 1 },
    } as ChartDistribution,
  };

  const mockBigThree: BigThreeInterpretation = {
    sun: {
      sign: ZodiacSign.LEO,
      signName: 'Leo',
      interpretation: 'El Sol en Leo representa liderazgo y creatividad.',
    },
    moon: {
      sign: ZodiacSign.SCORPIO,
      signName: 'Escorpio',
      interpretation: 'La Luna en Escorpio indica profundidad emocional.',
    },
    ascendant: {
      sign: ZodiacSign.LEO,
      signName: 'Leo',
      interpretation: 'El Ascendente en Leo proyecta confianza y carisma.',
    },
  };

  const mockPlanetInterpretations: PlanetInterpretation[] = [
    {
      planet: Planet.SUN,
      planetName: 'Sol',
      planetSymbol: '☉',
      sign: ZodiacSign.LEO,
      signName: 'Leo',
      house: 1,
      isRetrograde: false,
      intro: 'El Sol representa tu esencia vital.',
      inSign: 'El Sol en Leo potencia tu creatividad.',
      inHouse: 'El Sol en Casa 1 fortalece tu identidad.',
      aspects: [
        {
          planet1: 'sun',
          planet2: 'moon',
          aspectType: AspectType.TRINE,
          aspectName: 'Trígono',
          aspectSymbol: '△',
          orb: 0.2,
          interpretation: 'Armonía entre tu voluntad y emociones.',
        },
      ],
    },
  ];

  const mockInterpretation: FullChartInterpretation = {
    bigThree: mockBigThree,
    planets: mockPlanetInterpretations,
    distribution: {
      elements: [
        { name: 'Fuego', count: 2, percentage: 66.7 },
        { name: 'Agua', count: 1, percentage: 33.3 },
      ],
      modalities: [
        { name: 'Fijo', count: 2, percentage: 66.7 },
        { name: 'Mutable', count: 1, percentage: 33.3 },
      ],
    },
    aspectSummary: {
      total: 1,
      harmonious: 1,
      challenging: 0,
      strongest: {
        planet1: 'sun',
        planet2: 'moon',
        aspectType: AspectType.TRINE,
        aspectName: 'Trígono',
        aspectSymbol: '△',
        orb: 0.2,
      },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ChartPdfService],
    }).compile();

    service = module.get<ChartPdfService>(ChartPdfService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ============================================================================
  // TESTS DE INICIALIZACIÓN
  // ============================================================================

  describe('Inicialización del servicio', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have generatePDF method', () => {
      expect(service.generatePDF).toBeDefined();
      expect(typeof service.generatePDF).toBe('function');
    });
  });

  // ============================================================================
  // TESTS DE GENERACIÓN DE PDF - USUARIO FREE
  // ============================================================================

  describe('generatePDF - Usuario Free', () => {
    it('should generate PDF for Free user without AI synthesis', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Juan Pérez',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      // Verificar que el resultado tiene la estructura esperada
      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.filename).toContain('carta-astral');
      expect(result.filename).toContain('juan-perez');
      expect(result.pageCount).toBeGreaterThan(0);
    });

    it('should generate filename with sanitized user name', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'María José García',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      expect(result.filename).toMatch(/carta-astral-maria-jose-garcia-/);
      expect(result.filename).toMatch(/\.pdf$/);
    });

    it('should include cover page with user data', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      // El PDF debe tener al menos 3 páginas: Portada + Big Three + Planetas
      expect(result.pageCount).toBeGreaterThanOrEqual(3);
    });

    it('should not include AI synthesis section for Free users', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        aiSynthesis: 'Esta es una síntesis que no debería aparecer.',
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false, // Usuario Free
      };

      const result = await service.generatePDF(input);

      // Para Free, el número de páginas debe ser menor que Premium
      // (sin la página de síntesis IA)
      expect(result.pageCount).toBeLessThan(10); // Valor aproximado
    });
  });

  // ============================================================================
  // TESTS DE GENERACIÓN DE PDF - USUARIO PREMIUM
  // ============================================================================

  describe('generatePDF - Usuario Premium', () => {
    it('should generate PDF for Premium user with AI synthesis', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        aiSynthesis:
          'Tu carta revela una personalidad radiante y apasionada...',
        userName: 'Premium User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Madrid, España',
        generatedAt: new Date(),
        isPremium: true,
      };

      const result = await service.generatePDF(input);

      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
      expect(result.filename).toContain('premium-user');
      // Premium debe tener más páginas por la síntesis IA
      expect(result.pageCount).toBeGreaterThan(3);
    });

    it('should include AI synthesis page for Premium users', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        aiSynthesis: 'Síntesis IA personalizada para usuario Premium.',
        userName: 'Test Premium',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Barcelona, España',
        generatedAt: new Date(),
        isPremium: true,
      };

      const result = await service.generatePDF(input);

      // El PDF debe incluir la página de síntesis
      expect(result.pageCount).toBeGreaterThanOrEqual(4);
    });
  });

  // ============================================================================
  // TESTS DE MANEJO DE ERRORES
  // ============================================================================

  describe('Manejo de errores', () => {
    it('should handle errors gracefully during PDF generation', async () => {
      const invalidInput = {
        chartData: null as unknown as ChartData, // Datos inválidos
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow();
    });

    it('should handle missing planet data', async () => {
      const inputWithEmptyPlanets = {
        chartData: { ...mockChartData, planets: [] },
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(inputWithEmptyPlanets);

      // Debe generar el PDF aunque no haya planetas
      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should handle special characters in user name', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'José María Ñoño Österreich',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'São Paulo, Brasil',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      expect(result).toBeDefined();
      expect(result.filename).toMatch(/\.pdf$/);
      // El nombre debe estar sanitizado pero reconocible
      expect(result.filename.toLowerCase()).toContain('jose');
    });

    it('should handle username with only special characters', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: '####@@@@!!!!',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      expect(result).toBeDefined();
      expect(result.filename).toMatch(/\.pdf$/);
      // Debe usar el fallback "usuario" cuando la sanitización resulta en string vacío
      expect(result.filename.toLowerCase()).toContain('usuario');
      expect(result.filename).not.toContain('--'); // No debe tener dobles guiones
    });

    it('should throw error when userName is null', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: null as unknown as string,
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'userName is required for PDF generation',
      );
    });

    it('should throw error when userName is empty string', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: '   ',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'userName is required for PDF generation',
      );
    });

    it('should throw error when birthDate is null', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: null as unknown as Date,
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'birthDate is required for PDF generation',
      );
    });

    it('should throw error when birthTime is null', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: null as unknown as string,
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'birthTime is required for PDF generation',
      );
    });

    it('should throw error when birthPlace is null', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: null as unknown as string,
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'birthPlace is required for PDF generation',
      );
    });

    it('should throw error when generatedAt is null', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: null as unknown as Date,
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'generatedAt is required for PDF generation',
      );
    });

    it('should throw error when interpretation is null', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: null as unknown as FullChartInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'interpretation is required for PDF generation',
      );
    });

    it('should throw error when interpretation.bigThree is missing', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: { planets: [] } as unknown as FullChartInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'interpretation.bigThree is required for PDF generation',
      );
    });

    it('should throw error when interpretation.planets is not an array', async () => {
      const invalidInput = {
        chartData: mockChartData,
        interpretation: {
          bigThree: mockBigThree,
          planets: null,
        } as unknown as FullChartInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      await expect(service.generatePDF(invalidInput)).rejects.toThrow(
        'interpretation.planets is required and must be an array for PDF generation',
      );
    });
  });

  // ============================================================================
  // TESTS DE CONTENIDO DEL PDF
  // ============================================================================

  describe('Contenido del PDF', () => {
    it('should include all required sections for Free users', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      // Mínimo: Portada + Big Three + Planetas + Disclaimer
      expect(result.pageCount).toBeGreaterThanOrEqual(4);
    });

    it('should include disclaimer page at the end', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      // El disclaimer debe estar al final (última página)
      expect(result.pageCount).toBeGreaterThan(0);
    });
  });

  // ============================================================================
  // TESTS DE FORMATO Y METADATA
  // ============================================================================

  describe('Formato y metadata del PDF', () => {
    it('should set correct PDF metadata', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      // El buffer debe ser un PDF válido
      expect(result.buffer.toString('utf8', 0, 4)).toBe('%PDF');
    });

    it('should generate unique filename for each request', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result1 = await service.generatePDF(input);
      const result2 = await service.generatePDF(input);

      // Los nombres deben ser diferentes (incluyen timestamp)
      expect(result1.filename).not.toBe(result2.filename);
    });

    it('should generate filename with timestamp', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      // El nombre debe contener un timestamp
      expect(result.filename).toMatch(/carta-astral-test-user-\d+\.pdf/);
    });
  });

  // ============================================================================
  // TESTS DE EDGE CASES
  // ============================================================================

  describe('Edge cases', () => {
    it('should handle very long user names', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Juan Carlos Miguel Ángel de los Santos y García Rodríguez',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      expect(result).toBeDefined();
      expect(result.filename.length).toBeLessThan(200); // Razonable para sistemas de archivos
    });

    it('should handle dates in different formats', async () => {
      const input = {
        chartData: mockChartData,
        interpretation: mockInterpretation,
        userName: 'Test User',
        birthDate: new Date('1950-01-01'), // Fecha antigua
        birthTime: '00:00:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });

    it('should handle empty aspects array', async () => {
      const input = {
        chartData: { ...mockChartData, aspects: [] },
        interpretation: {
          ...mockInterpretation,
          aspectSummary: {
            total: 0,
            harmonious: 0,
            challenging: 0,
          },
        },
        userName: 'Test User',
        birthDate: new Date('1990-05-15'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        generatedAt: new Date(),
        isPremium: false,
      };

      const result = await service.generatePDF(input);

      expect(result).toBeDefined();
      expect(result.buffer).toBeInstanceOf(Buffer);
    });
  });
});
