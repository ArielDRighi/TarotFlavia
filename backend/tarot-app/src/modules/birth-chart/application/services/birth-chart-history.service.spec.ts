import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BirthChartHistoryService } from './birth-chart-history.service';
import { BirthChart, ChartData } from '../../entities/birth-chart.entity';
import { ChartPdfService } from './chart-pdf.service';
import { ChartInterpretationService } from './chart-interpretation.service';
import { ChartCalculationService } from './chart-calculation.service';
import { ChartAISynthesisService } from './chart-ai-synthesis.service';

describe('BirthChartHistoryService', () => {
  let service: BirthChartHistoryService;

  const chartRepositoryMock = {
    findAndCount: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const chartPdfServiceMock = {
    generatePDF: jest.fn(),
  };

  const chartInterpretationServiceMock = {
    generateFullInterpretation: jest.fn(),
  };

  const chartCalculationServiceMock = {
    calculateChart: jest.fn(),
  };

  const chartAiSynthesisServiceMock = {
    generateSynthesis: jest.fn(),
  };

  const baseChartData: ChartData = {
    planets: [
      {
        planet: 'sun',
        longitude: 10,
        sign: 'leo',
        signDegree: 10,
        house: 1,
        isRetrograde: false,
      },
      {
        planet: 'moon',
        longitude: 45,
        sign: 'aries',
        signDegree: 15,
        house: 2,
        isRetrograde: false,
      },
    ],
    houses: [
      { house: 1, longitude: 10, sign: 'virgo', signDegree: 10 },
      { house: 2, longitude: 40, sign: 'libra', signDegree: 10 },
    ],
    aspects: [
      {
        planet1: 'sun',
        planet2: 'moon',
        aspectType: 'trine',
        angle: 120,
        orb: 1.5,
        isApplying: true,
      },
    ],
    ascendant: {
      planet: 'ascendant',
      longitude: 12,
      sign: 'virgo',
      signDegree: 12,
      house: 1,
      isRetrograde: false,
    },
    midheaven: {
      planet: 'midheaven',
      longitude: 100,
      sign: 'gemini',
      signDegree: 10,
      house: 10,
      isRetrograde: false,
    },
    distribution: {
      elements: { fire: 2, earth: 1, air: 0, water: 0 },
      modalities: { cardinal: 1, fixed: 1, mutable: 1 },
      polarity: { masculine: 2, feminine: 1 },
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthChartHistoryService,
        {
          provide: getRepositoryToken(BirthChart),
          useValue: chartRepositoryMock,
        },
        { provide: ChartPdfService, useValue: chartPdfServiceMock },
        {
          provide: ChartInterpretationService,
          useValue: chartInterpretationServiceMock,
        },
        {
          provide: ChartCalculationService,
          useValue: chartCalculationServiceMock,
        },
        {
          provide: ChartAISynthesisService,
          useValue: chartAiSynthesisServiceMock,
        },
      ],
    }).compile();

    service = module.get(BirthChartHistoryService);
    jest.clearAllMocks();
  });

  it('should return paginated chart history', async () => {
    const createdAt = new Date('2026-02-12T00:00:00Z');
    const chart: Partial<BirthChart> = {
      id: 1,
      name: 'Mi carta',
      birthDate: new Date('1990-05-15T00:00:00Z'),
      sunSign: 'leo',
      moonSign: 'aries',
      ascendantSign: 'virgo',
      createdAt,
    };

    chartRepositoryMock.findAndCount.mockResolvedValue([[chart], 1]);

    const result = await service.getUserCharts(1, 1, 10);

    expect(result.meta.page).toBe(1);
    expect(result.meta.limit).toBe(10);
    expect(result.meta.totalItems).toBe(1);
    expect(result.meta.totalPages).toBe(1);
    expect(result.data).toHaveLength(1);
  });

  it('should return totalPages 0 for empty history', async () => {
    chartRepositoryMock.findAndCount.mockResolvedValue([[], 0]);

    const result = await service.getUserCharts(1, 1, 10);

    expect(result.meta.totalItems).toBe(0);
    expect(result.meta.totalPages).toBe(0);
    expect(result.meta.hasNextPage).toBe(false);
    expect(result.meta.hasPreviousPage).toBe(false);
  });

  it('should return null when chart is not found by id', async () => {
    chartRepositoryMock.findOne.mockResolvedValue(null);

    const result = await service.getChartById(99, 1);

    expect(result).toBeNull();
  });

  it('should map chart detail and return nullable synthesis timestamp when missing', async () => {
    const chart: BirthChart = {
      id: 10,
      userId: 1,
      name: 'Carta guardada',
      birthDate: new Date('1990-05-15T00:00:00Z'),
      birthTime: '14:30:00',
      birthPlace: 'Buenos Aires',
      latitude: -34.6,
      longitude: -58.3,
      timezone: 'America/Argentina/Buenos_Aires',
      orbSystem: 'commercial',
      chartData: baseChartData,
      sunSign: 'leo',
      moonSign: 'aries',
      ascendantSign: 'virgo',
      createdAt: new Date('2026-02-10T12:00:00Z'),
      updatedAt: new Date('2026-02-11T12:00:00Z'),
      user: {} as never,
      getBigThree: jest.fn(),
      hasAiSynthesis: jest.fn(),
      getAspectsForPlanet: jest.fn(),
    };

    chartRepositoryMock.findOne.mockResolvedValue(chart);
    chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
      {
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
          moon: {
            sign: 'aries',
            signName: 'Aries',
            interpretation: 'Luna en Aries',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Ascendente en Virgo',
          },
        },
        planets: [
          {
            planet: 'sun',
            planetName: 'Sol',
            intro: 'intro',
            inSign: 'in sign',
            inHouse: 'in house',
            aspects: [
              {
                planet1: 'sun',
                planet2: 'moon',
                aspectType: 'trine',
                aspectName: 'Trígono',
                interpretation: 'armonía',
              },
            ],
          },
        ],
        distribution: { elements: [], modalities: [] },
        aspectSummary: { total: 1, harmonious: 1, challenging: 0 },
      },
    );

    const result = await service.getChartById(10, 1);

    expect(result).not.toBeNull();
    expect(result?.savedChartId).toBe(10);
    expect(result?.aiSynthesis.provider).toBe('none');
    expect(result?.aiSynthesis.generatedAt).toBeNull();
  });

  it('should save chart with synthesis and return summary', async () => {
    chartCalculationServiceMock.calculateChart.mockReturnValue({
      chartData: baseChartData,
    });
    chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
      {
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
          moon: {
            sign: 'aries',
            signName: 'Aries',
            interpretation: 'Luna en Aries',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Ascendente en Virgo',
          },
        },
        planets: [],
        distribution: { elements: [], modalities: [] },
        aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
      },
    );
    chartAiSynthesisServiceMock.generateSynthesis.mockResolvedValue({
      synthesis: 'síntesis premium',
      provider: 'groq',
      model: 'llama-3.1',
    });

    chartRepositoryMock.create.mockImplementation(
      (payload: Partial<BirthChart>) => payload,
    );
    chartRepositoryMock.save.mockImplementation(
      (payload: Partial<BirthChart>) =>
        Promise.resolve({
          ...payload,
          id: 55,
          createdAt: new Date('2026-02-12T00:00:00Z'),
        } as BirthChart),
    );

    const result = await service.saveChart(1, {
      name: 'María',
      chartName: 'Carta premium',
      birthDate: '1990-05-15',
      birthTime: '14:30',
      birthPlace: 'Buenos Aires',
      latitude: -34.6,
      longitude: -58.3,
      timezone: 'America/Argentina/Buenos_Aires',
    });

    expect(chartAiSynthesisServiceMock.generateSynthesis).toHaveBeenCalled();
    expect(chartRepositoryMock.create).toHaveBeenCalled();
    expect(chartRepositoryMock.save).toHaveBeenCalled();
    expect(result.id).toBe(55);
    expect(result.name).toBe('Carta premium');
  });

  it('should rename and delete charts by ownership', async () => {
    chartRepositoryMock.update.mockResolvedValue({ affected: 1 });
    chartRepositoryMock.delete.mockResolvedValue({ affected: 1 });

    const renamed = await service.renameChart(10, 1, 'Nuevo nombre');
    const deleted = await service.deleteChart(10, 1);

    expect(renamed).toBe(true);
    expect(deleted).toBe(true);
  });

  it('should generate pdf from saved chart', async () => {
    const chart: BirthChart = {
      id: 10,
      userId: 1,
      name: 'Carta guardada',
      birthDate: new Date('1990-05-15T00:00:00Z'),
      birthTime: '14:30:00',
      birthPlace: 'Buenos Aires',
      latitude: -34.6,
      longitude: -58.3,
      timezone: 'America/Argentina/Buenos_Aires',
      orbSystem: 'commercial',
      chartData: {
        ...baseChartData,
        aiSynthesis: 'síntesis',
      },
      sunSign: 'leo',
      moonSign: 'aries',
      ascendantSign: 'virgo',
      createdAt: new Date('2026-02-10T12:00:00Z'),
      updatedAt: new Date('2026-02-11T12:00:00Z'),
      user: {} as never,
      getBigThree: jest.fn(),
      hasAiSynthesis: jest.fn(),
      getAspectsForPlanet: jest.fn(),
    };

    chartRepositoryMock.findOne.mockResolvedValue(chart);
    chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
      {
        bigThree: {
          sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
          moon: {
            sign: 'aries',
            signName: 'Aries',
            interpretation: 'Luna en Aries',
          },
          ascendant: {
            sign: 'virgo',
            signName: 'Virgo',
            interpretation: 'Ascendente en Virgo',
          },
        },
        planets: [],
        distribution: { elements: [], modalities: [] },
        aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
      },
    );
    chartPdfServiceMock.generatePDF.mockResolvedValue({
      buffer: Buffer.from('pdf'),
      filename: 'carta.pdf',
    });

    const result = await service.generatePdfFromSaved(10, 1);

    expect(result).not.toBeNull();
    expect(result?.filename).toBe('carta.pdf');
  });

  it('should detect duplicate chart', async () => {
    chartRepositoryMock.findOne.mockResolvedValue({ id: 10 });

    const exists = await service.checkDuplicate(
      1,
      '1990-05-15',
      '14:30',
      -34.6,
      -58.3,
    );

    expect(exists).toBe(true);
  });

  it('should return chart signs as translated Spanish names in getUserCharts', async () => {
    const chart: Partial<BirthChart> = {
      id: 4,
      name: 'Carta signos',
      birthDate: '1990-05-15' as unknown as Date,
      sunSign: 'leo',
      moonSign: 'aries',
      ascendantSign: 'virgo',
      createdAt: '2026-02-20T10:00:00.000Z' as unknown as Date,
    };

    chartRepositoryMock.findAndCount.mockResolvedValue([[chart], 1]);

    const result = await service.getUserCharts(1, 1, 10);

    // Los signos deben ser nombres en español (de ZodiacSignMetadata), NO claves del enum
    expect(result.data[0].sunSign).toBe('Leo');
    expect(result.data[0].moonSign).toBe('Aries');
    expect(result.data[0].ascendantSign).toBe('Virgo');
    // Asegurar que NO son claves del enum sin traducir
    expect(result.data[0].sunSign).not.toBe('leo');
    expect(result.data[0].moonSign).not.toBe('aries');
    expect(result.data[0].ascendantSign).not.toBe('virgo');
  });

  describe('toSavedChartSummary — birthDate type normalization', () => {
    it('should handle birthDate as Date object in getUserCharts', async () => {
      const createdAt = new Date('2026-02-12T00:00:00Z');
      const chart: Partial<BirthChart> = {
        id: 1,
        name: 'Mi carta',
        birthDate: new Date(1990, 4, 15), // local midnight — matches postgres-date behavior
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt,
      };

      chartRepositoryMock.findAndCount.mockResolvedValue([[chart], 1]);

      const result = await service.getUserCharts(1, 1, 10);

      expect(result.data[0].birthDate).toBe('1990-05-15');
      expect(result.data[0].createdAt).toBe('2026-02-12T00:00:00.000Z');
    });

    it('should handle birthDate as string (PostgreSQL DATE type) in getUserCharts', async () => {
      const chart: Partial<BirthChart> = {
        id: 2,
        name: 'Carta desde DB',
        birthDate: '1985-11-20' as unknown as Date,
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: '2026-01-10T08:00:00.000Z' as unknown as Date,
      };

      chartRepositoryMock.findAndCount.mockResolvedValue([[chart], 1]);

      const result = await service.getUserCharts(1, 1, 10);

      expect(result.data[0].birthDate).toBe('1985-11-20');
      expect(result.data[0].createdAt).toBe('2026-01-10T08:00:00.000Z');
    });

    it('should not throw TypeError when birthDate is string in getUserCharts', async () => {
      const chart: Partial<BirthChart> = {
        id: 3,
        name: 'Carta string date',
        birthDate: '2000-03-25' as unknown as Date,
        sunSign: 'aries',
        moonSign: 'taurus',
        ascendantSign: 'gemini',
        createdAt: '2026-02-20T10:00:00.000Z' as unknown as Date,
      };

      chartRepositoryMock.findAndCount.mockResolvedValue([[chart], 1]);

      await expect(service.getUserCharts(1, 1, 10)).resolves.not.toThrow();
    });
  });

  describe('getChartById — birth data fields', () => {
    it('should return birthDate in YYYY-MM-DD format when birthDate is a Date object', async () => {
      const chart: BirthChart = {
        id: 30,
        userId: 1,
        name: 'Carta con Date',
        birthDate: new Date(1990, 4, 15), // local midnight — matches postgres-date behavior
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires, Argentina',
        latitude: -34.6,
        longitude: -58.3,
        timezone: 'America/Argentina/Buenos_Aires',
        orbSystem: 'commercial',
        chartData: baseChartData,
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: new Date('2026-02-10T12:00:00Z'),
        updatedAt: new Date('2026-02-11T12:00:00Z'),
        user: {} as never,
        getBigThree: jest.fn(),
        hasAiSynthesis: jest.fn(),
        getAspectsForPlanet: jest.fn(),
      };

      chartRepositoryMock.findOne.mockResolvedValue(chart);
      chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
        {
          bigThree: {
            sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
            moon: {
              sign: 'aries',
              signName: 'Aries',
              interpretation: 'Luna en Aries',
            },
            ascendant: {
              sign: 'virgo',
              signName: 'Virgo',
              interpretation: 'Ascendente en Virgo',
            },
          },
          planets: [],
          distribution: { elements: [], modalities: [] },
          aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
        },
      );

      const result = await service.getChartById(30, 1);

      expect(result).not.toBeNull();
      expect(result?.birthDate).toBe('1990-05-15');
      expect(result?.birthTime).toBe('14:30');
      expect(result?.birthPlace).toBe('Buenos Aires, Argentina');
    });

    it('should return birthDate in YYYY-MM-DD format when birthDate is a string (PostgreSQL DATE)', async () => {
      const chart: BirthChart = {
        id: 31,
        userId: 1,
        name: 'Carta con string date',
        birthDate: '1985-11-20' as unknown as Date,
        birthTime: '09:15:00',
        birthPlace: 'Córdoba, Argentina',
        latitude: -31.4,
        longitude: -64.2,
        timezone: 'America/Argentina/Cordoba',
        orbSystem: 'commercial',
        chartData: baseChartData,
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: new Date('2026-02-10T12:00:00Z'),
        updatedAt: new Date('2026-02-11T12:00:00Z'),
        user: {} as never,
        getBigThree: jest.fn(),
        hasAiSynthesis: jest.fn(),
        getAspectsForPlanet: jest.fn(),
      };

      chartRepositoryMock.findOne.mockResolvedValue(chart);
      chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
        {
          bigThree: {
            sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
            moon: {
              sign: 'aries',
              signName: 'Aries',
              interpretation: 'Luna en Aries',
            },
            ascendant: {
              sign: 'virgo',
              signName: 'Virgo',
              interpretation: 'Ascendente en Virgo',
            },
          },
          planets: [],
          distribution: { elements: [], modalities: [] },
          aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
        },
      );

      const result = await service.getChartById(31, 1);

      expect(result).not.toBeNull();
      expect(result?.birthDate).toBe('1985-11-20');
      expect(result?.birthTime).toBe('09:15');
      expect(result?.birthPlace).toBe('Córdoba, Argentina');
    });

    it('should truncate birthTime to HH:mm when stored as HH:mm:ss', async () => {
      const chart: BirthChart = {
        id: 32,
        userId: 1,
        name: 'Carta truncate time',
        birthDate: new Date('2000-01-01T00:00:00Z'),
        birthTime: '23:59:59',
        birthPlace: 'Rosario, Argentina',
        latitude: -32.9,
        longitude: -60.7,
        timezone: 'America/Argentina/Buenos_Aires',
        orbSystem: 'commercial',
        chartData: baseChartData,
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: new Date('2026-02-10T12:00:00Z'),
        updatedAt: new Date('2026-02-11T12:00:00Z'),
        user: {} as never,
        getBigThree: jest.fn(),
        hasAiSynthesis: jest.fn(),
        getAspectsForPlanet: jest.fn(),
      };

      chartRepositoryMock.findOne.mockResolvedValue(chart);
      chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
        {
          bigThree: {
            sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
            moon: {
              sign: 'aries',
              signName: 'Aries',
              interpretation: 'Luna en Aries',
            },
            ascendant: {
              sign: 'virgo',
              signName: 'Virgo',
              interpretation: 'Ascendente en Virgo',
            },
          },
          planets: [],
          distribution: { elements: [], modalities: [] },
          aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
        },
      );

      const result = await service.getChartById(32, 1);

      expect(result).not.toBeNull();
      expect(result?.birthTime).toBe('23:59');
    });
  });

  describe('getChartById — date type normalization', () => {
    it('should handle createdAt and updatedAt as Date objects in getChartById', async () => {
      const chart: BirthChart = {
        id: 20,
        userId: 1,
        name: 'Carta con Date',
        birthDate: new Date('1990-05-15T00:00:00Z'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires',
        latitude: -34.6,
        longitude: -58.3,
        timezone: 'America/Argentina/Buenos_Aires',
        orbSystem: 'commercial',
        chartData: baseChartData,
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: new Date('2026-02-10T12:00:00Z'),
        updatedAt: new Date('2026-02-11T12:00:00Z'),
        user: {} as never,
        getBigThree: jest.fn(),
        hasAiSynthesis: jest.fn(),
        getAspectsForPlanet: jest.fn(),
      };

      chartRepositoryMock.findOne.mockResolvedValue(chart);
      chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
        {
          bigThree: {
            sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
            moon: {
              sign: 'aries',
              signName: 'Aries',
              interpretation: 'Luna en Aries',
            },
            ascendant: {
              sign: 'virgo',
              signName: 'Virgo',
              interpretation: 'Ascendente en Virgo',
            },
          },
          planets: [],
          distribution: { elements: [], modalities: [] },
          aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
        },
      );

      const result = await service.getChartById(20, 1);

      expect(result).not.toBeNull();
      expect(result?.createdAt).toBe('2026-02-10T12:00:00.000Z');
    });

    it('should handle createdAt as string (PostgreSQL TIMESTAMP type) in getChartById', async () => {
      const chart: BirthChart = {
        id: 21,
        userId: 1,
        name: 'Carta con string dates',
        birthDate: new Date('1990-05-15T00:00:00Z'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires',
        latitude: -34.6,
        longitude: -58.3,
        timezone: 'America/Argentina/Buenos_Aires',
        orbSystem: 'commercial',
        chartData: baseChartData,
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: '2026-02-10T12:00:00.000Z' as unknown as Date,
        updatedAt: '2026-02-11T12:00:00.000Z' as unknown as Date,
        user: {} as never,
        getBigThree: jest.fn(),
        hasAiSynthesis: jest.fn(),
        getAspectsForPlanet: jest.fn(),
      };

      chartRepositoryMock.findOne.mockResolvedValue(chart);
      chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
        {
          bigThree: {
            sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
            moon: {
              sign: 'aries',
              signName: 'Aries',
              interpretation: 'Luna en Aries',
            },
            ascendant: {
              sign: 'virgo',
              signName: 'Virgo',
              interpretation: 'Ascendente en Virgo',
            },
          },
          planets: [],
          distribution: { elements: [], modalities: [] },
          aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
        },
      );

      const result = await service.getChartById(21, 1);

      expect(result).not.toBeNull();
      expect(result?.createdAt).toBe('2026-02-10T12:00:00.000Z');
    });

    it('should not throw TypeError when createdAt/updatedAt are strings in getChartById', async () => {
      const chart: BirthChart = {
        id: 22,
        userId: 1,
        name: 'Carta strings',
        birthDate: new Date('1990-05-15T00:00:00Z'),
        birthTime: '14:30:00',
        birthPlace: 'Buenos Aires',
        latitude: -34.6,
        longitude: -58.3,
        timezone: 'America/Argentina/Buenos_Aires',
        orbSystem: 'commercial',
        chartData: { ...baseChartData, aiSynthesis: 'síntesis' },
        sunSign: 'leo',
        moonSign: 'aries',
        ascendantSign: 'virgo',
        createdAt: '2026-02-10T12:00:00.000Z' as unknown as Date,
        updatedAt: '2026-02-11T12:00:00.000Z' as unknown as Date,
        user: {} as never,
        getBigThree: jest.fn(),
        hasAiSynthesis: jest.fn(),
        getAspectsForPlanet: jest.fn(),
      };

      chartRepositoryMock.findOne.mockResolvedValue(chart);
      chartInterpretationServiceMock.generateFullInterpretation.mockResolvedValue(
        {
          bigThree: {
            sun: { sign: 'leo', signName: 'Leo', interpretation: 'Sol en Leo' },
            moon: {
              sign: 'aries',
              signName: 'Aries',
              interpretation: 'Luna en Aries',
            },
            ascendant: {
              sign: 'virgo',
              signName: 'Virgo',
              interpretation: 'Ascendente en Virgo',
            },
          },
          planets: [],
          distribution: { elements: [], modalities: [] },
          aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
        },
      );

      await expect(service.getChartById(22, 1)).resolves.not.toThrow();
    });
  });
});
