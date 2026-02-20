import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BirthChartFacadeService } from './birth-chart-facade.service';
import { BirthChart, ChartData } from '../../entities/birth-chart.entity';
import { UserPlan } from '../../../users/entities/user.entity';
import { UsageFeature } from '../../../usage-limits/entities/usage-limit.entity';
import { ZodiacSign } from '../../domain/enums';
import { ChartCalculationService } from './chart-calculation.service';
import { ChartInterpretationService } from './chart-interpretation.service';
import { ChartAISynthesisService } from './chart-ai-synthesis.service';
import { ChartCacheService } from './chart-cache.service';
import { ChartPdfService } from './chart-pdf.service';
import { UsageLimitsService } from '../../../usage-limits/usage-limits.service';
import { AnonymousTrackingService } from '../../../usage-limits/services/anonymous-tracking.service';

describe('BirthChartFacadeService', () => {
  let service: BirthChartFacadeService;

  const chartData: ChartData = {
    planets: [
      {
        planet: 'sun',
        longitude: 10,
        sign: 'aries',
        signDegree: 10,
        house: 1,
        isRetrograde: false,
      },
      {
        planet: 'moon',
        longitude: 45,
        sign: 'taurus',
        signDegree: 15,
        house: 2,
        isRetrograde: false,
      },
    ],
    houses: [
      { house: 1, longitude: 10, sign: 'aries', signDegree: 10 },
      { house: 2, longitude: 40, sign: 'taurus', signDegree: 10 },
    ],
    aspects: [],
    ascendant: {
      planet: 'ascendant',
      longitude: 10,
      sign: 'aries',
      signDegree: 10,
      house: 1,
      isRetrograde: false,
    },
    midheaven: {
      planet: 'midheaven',
      longitude: 100,
      sign: 'cancer',
      signDegree: 10,
      house: 10,
      isRetrograde: false,
    },
    distribution: {
      elements: { fire: 1, earth: 1, air: 0, water: 0 },
      modalities: { cardinal: 1, fixed: 1, mutable: 0 },
      polarity: { masculine: 1, feminine: 1 },
    },
  };

  const fullInterpretation = {
    bigThree: {
      sun: {
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        interpretation: 'Sol en Aries',
      },
      moon: {
        sign: ZodiacSign.TAURUS,
        signName: 'Tauro',
        interpretation: 'Luna en Tauro',
      },
      ascendant: {
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        interpretation: 'Ascendente en Aries',
      },
    },
    planets: [],
    distribution: { elements: [], modalities: [] },
    aspectSummary: { total: 0, harmonious: 0, challenging: 0 },
  };

  const chartCalculationServiceMock = {
    calculateChart: jest.fn().mockReturnValue({
      chartData,
      sunSign: ZodiacSign.ARIES,
      moonSign: ZodiacSign.TAURUS,
      ascendantSign: ZodiacSign.ARIES,
      calculationTimeMs: 12,
    }),
  };

  const interpretationServiceMock = {
    generateBigThreeInterpretation: jest.fn().mockResolvedValue({
      sun: {
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        interpretation: 'Sol en Aries',
      },
      moon: {
        sign: ZodiacSign.TAURUS,
        signName: 'Tauro',
        interpretation: 'Luna en Tauro',
      },
      ascendant: {
        sign: ZodiacSign.ARIES,
        signName: 'Aries',
        interpretation: 'Ascendente en Aries',
      },
    }),
    generateFullInterpretation: jest.fn().mockResolvedValue(fullInterpretation),
  };

  const cacheServiceMock = {
    generateChartCacheKey: jest.fn().mockReturnValue('key-123'),
    getChartCalculation: jest.fn().mockResolvedValue(null),
    setChartCalculation: jest.fn().mockResolvedValue(undefined),
    getInterpretation: jest.fn().mockResolvedValue(null),
    setInterpretation: jest.fn().mockResolvedValue(undefined),
    getSynthesis: jest.fn().mockResolvedValue(null),
    setSynthesis: jest.fn().mockResolvedValue(undefined),
  };

  const aiSynthesisServiceMock = {
    generateSynthesis: jest.fn().mockResolvedValue({
      synthesis: 'síntesis premium',
      provider: 'groq',
      model: 'llama-3.1',
    }),
  };

  const pdfServiceMock = {
    generatePDF: jest.fn(),
  };

  const usageLimitsServiceMock = {
    getUsageByPeriod: jest.fn().mockResolvedValue(2),
  };

  const anonymousTrackingServiceMock = {
    canAccessLifetime: jest.fn().mockResolvedValue(true),
  };

  const savedChart: Partial<BirthChart> = { id: 77 };

  const chartRepositoryMock = {
    create: jest
      .fn()
      .mockImplementation((payload: Partial<BirthChart>) => payload),
    save: jest
      .fn()
      .mockImplementation((payload: Partial<BirthChart>) =>
        Promise.resolve({ id: 77, ...payload }),
      ),
    // upsert: operación atómica INSERT ... ON CONFLICT DO UPDATE
    upsert: jest.fn().mockResolvedValue({ identifiers: [{ id: 77 }] }),
    // findOneOrFail: recupera el chart persistido después del upsert
    findOneOrFail: jest.fn().mockResolvedValue(savedChart),
  };

  const inputDto = {
    name: 'Test',
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: 'Buenos Aires',
    latitude: -34.6,
    longitude: -58.3,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BirthChartFacadeService,
        {
          provide: getRepositoryToken(BirthChart),
          useValue: chartRepositoryMock,
        },
        {
          provide: ChartCalculationService,
          useValue: chartCalculationServiceMock,
        },
        {
          provide: ChartInterpretationService,
          useValue: interpretationServiceMock,
        },
        { provide: ChartAISynthesisService, useValue: aiSynthesisServiceMock },
        { provide: ChartCacheService, useValue: cacheServiceMock },
        { provide: ChartPdfService, useValue: pdfServiceMock },
        { provide: UsageLimitsService, useValue: usageLimitsServiceMock },
        {
          provide: AnonymousTrackingService,
          useValue: anonymousTrackingServiceMock,
        },
      ],
    }).compile();

    service = module.get(BirthChartFacadeService);
    jest.clearAllMocks();
  });

  it('should generate anonymous response', async () => {
    const result = await service.generateChart(
      inputDto,
      UserPlan.ANONYMOUS,
      null,
      'fingerprint',
    );

    expect(result.success).toBe(true);
    expect(
      interpretationServiceMock.generateBigThreeInterpretation,
    ).toHaveBeenCalled();
  });

  it('should generate free response without redundant bigThree generation', async () => {
    const result = await service.generateChart(inputDto, UserPlan.FREE, 1);

    expect(result.success).toBe(true);
    expect(
      interpretationServiceMock.generateFullInterpretation,
    ).toHaveBeenCalled();
    expect(
      interpretationServiceMock.generateBigThreeInterpretation,
    ).not.toHaveBeenCalled();
    expect('canDownloadPdf' in result && result.canDownloadPdf).toBe(true);
  });

  it('should use cached chart calculation when available', async () => {
    cacheServiceMock.getChartCalculation.mockResolvedValueOnce({ chartData });

    await service.generateChart(
      inputDto,
      UserPlan.ANONYMOUS,
      null,
      'fingerprint',
    );

    expect(chartCalculationServiceMock.calculateChart).not.toHaveBeenCalled();
    expect(cacheServiceMock.setChartCalculation).not.toHaveBeenCalled();
  });

  it('should use cached synthesis for premium and persist chart', async () => {
    cacheServiceMock.getInterpretation.mockResolvedValueOnce(
      fullInterpretation,
    );
    cacheServiceMock.getSynthesis.mockResolvedValueOnce({
      synthesis: 'síntesis cacheada',
      provider: 'groq',
      model: 'llama-3.1',
    });

    const result = await service.generateChart(inputDto, UserPlan.PREMIUM, 5);

    expect(aiSynthesisServiceMock.generateSynthesis).not.toHaveBeenCalled();
    expect(cacheServiceMock.setSynthesis).not.toHaveBeenCalled();
    expect(chartRepositoryMock.upsert).toHaveBeenCalled();
    expect(chartRepositoryMock.findOneOrFail).toHaveBeenCalled();
    expect('aiSynthesis' in result && result.aiSynthesis.content).toBe(
      'síntesis cacheada',
    );
  });

  it('should generate and cache synthesis on premium cache miss', async () => {
    cacheServiceMock.getInterpretation.mockResolvedValueOnce(
      fullInterpretation,
    );
    cacheServiceMock.getSynthesis.mockResolvedValueOnce(null);

    const result = await service.generateChart(inputDto, UserPlan.PREMIUM, 7);

    expect(aiSynthesisServiceMock.generateSynthesis).toHaveBeenCalled();
    expect(cacheServiceMock.setSynthesis).toHaveBeenCalledWith(
      'key-123',
      'síntesis premium',
      'groq',
      'llama-3.1',
    );
    expect('savedChartId' in result && result.savedChartId).toBe(77);
  });

  it('should use atomic upsert with conflict columns matching unique index', async () => {
    cacheServiceMock.getInterpretation.mockResolvedValueOnce(
      fullInterpretation,
    );
    cacheServiceMock.getSynthesis.mockResolvedValueOnce(null);

    await service.generateChart(inputDto, UserPlan.PREMIUM, 5);

    // Verificar que upsert fue llamado con las columnas del unique index
    expect(chartRepositoryMock.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: 5,
        name: inputDto.name,
        birthPlace: inputDto.birthPlace,
      }),
      ['userId', 'birthDate', 'birthTime', 'latitude', 'longitude'],
    );
    // Verificar que findOneOrFail recupera el registro por id devuelto por upsert
    // (no por lat/lon, ya que DECIMAL(10,6) puede redondear coordenadas de alta precisión)
    expect(chartRepositoryMock.findOneOrFail).toHaveBeenCalledWith({
      where: { id: 77 },
    });
  });

  it('should return usage status for authenticated free user', async () => {
    const result = await service.getUsageStatus(
      { userId: 1, email: 'test@example.com', plan: UserPlan.FREE },
      'fingerprint',
    );

    expect(usageLimitsServiceMock.getUsageByPeriod).toHaveBeenCalledWith(
      1,
      UsageFeature.BIRTH_CHART,
      'monthly',
    );
    expect(result.limit).toBe(3);
    expect(result.used).toBe(2);
    expect(result.remaining).toBe(1);
  });

  it('should return usage status for authenticated premium user', async () => {
    const result = await service.getUsageStatus(
      { userId: 2, email: 'premium@example.com', plan: UserPlan.PREMIUM },
      'fingerprint',
    );

    expect(usageLimitsServiceMock.getUsageByPeriod).toHaveBeenCalledWith(
      2,
      UsageFeature.BIRTH_CHART,
      'monthly',
    );
    expect(result.limit).toBe(-1);
    expect(result.used).toBe(2);
    expect(result.remaining).toBe(-1);
    expect(result.canGenerate).toBe(true);
    expect(result.resetsAt).toBeNull();
  });

  it('should return usage status for anonymous user with available access', async () => {
    const result = await service.getUsageStatus(null, 'fingerprint-abc');

    expect(anonymousTrackingServiceMock.canAccessLifetime).toHaveBeenCalledWith(
      'fingerprint-abc',
      UsageFeature.BIRTH_CHART,
    );
    expect(result.plan).toBe(UserPlan.ANONYMOUS);
    expect(result.used).toBe(0);
    expect(result.limit).toBe(1);
    expect(result.remaining).toBe(1);
    expect(result.canGenerate).toBe(true);
  });

  it('should return usage status for anonymous user without available access', async () => {
    anonymousTrackingServiceMock.canAccessLifetime.mockResolvedValueOnce(false);

    const result = await service.getUsageStatus(null, 'fingerprint-used');

    expect(result.plan).toBe(UserPlan.ANONYMOUS);
    expect(result.used).toBe(1);
    expect(result.limit).toBe(1);
    expect(result.remaining).toBe(0);
    expect(result.canGenerate).toBe(false);
  });

  it('should generate PDF for free user', async () => {
    pdfServiceMock.generatePDF.mockResolvedValueOnce({
      buffer: Buffer.from('pdf-content'),
      filename: 'carta-test.pdf',
    });

    const result = await service.generatePdf(
      inputDto,
      { userId: 1, email: 'test@example.com', plan: UserPlan.FREE },
      false,
    );

    expect(chartCalculationServiceMock.calculateChart).toHaveBeenCalled();
    expect(
      interpretationServiceMock.generateFullInterpretation,
    ).toHaveBeenCalled();
    expect(aiSynthesisServiceMock.generateSynthesis).not.toHaveBeenCalled();
    expect(pdfServiceMock.generatePDF).toHaveBeenCalledWith(
      expect.objectContaining({
        chartData,
        interpretation: fullInterpretation,
        aiSynthesis: undefined,
        isPremium: false,
      }),
    );
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.filename).toBe('carta-test.pdf');
  });

  it('should generate PDF with AI synthesis for premium user', async () => {
    pdfServiceMock.generatePDF.mockResolvedValueOnce({
      buffer: Buffer.from('pdf-premium-content'),
      filename: 'carta-premium.pdf',
    });

    const result = await service.generatePdf(
      inputDto,
      { userId: 2, email: 'premium@example.com', plan: UserPlan.PREMIUM },
      true,
    );

    expect(aiSynthesisServiceMock.generateSynthesis).toHaveBeenCalledWith(
      expect.objectContaining({
        chartData,
        interpretation: fullInterpretation,
        userName: 'Test',
      }),
      2,
    );
    expect(pdfServiceMock.generatePDF).toHaveBeenCalledWith(
      expect.objectContaining({
        aiSynthesis: 'síntesis premium',
        isPremium: true,
      }),
    );
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.filename).toBe('carta-premium.pdf');
  });

  it('should generate synthesis only for premium user', async () => {
    const result = await service.generateSynthesisOnly(inputDto, 3);

    expect(chartCalculationServiceMock.calculateChart).toHaveBeenCalled();
    expect(
      interpretationServiceMock.generateFullInterpretation,
    ).toHaveBeenCalled();
    expect(aiSynthesisServiceMock.generateSynthesis).toHaveBeenCalledWith(
      expect.objectContaining({
        chartData,
        interpretation: fullInterpretation,
        userName: 'Test',
      }),
      3,
    );
    expect(result.synthesis).toBe('síntesis premium');
    expect(result.provider).toBe('groq');
    expect(result.generatedAt).toBeDefined();
  });
});
