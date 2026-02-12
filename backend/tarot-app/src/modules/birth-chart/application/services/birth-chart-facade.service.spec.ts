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
    generateFullInterpretation: jest.fn().mockResolvedValue({
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
    }),
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
    generateSynthesis: jest.fn(),
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

  const chartRepositoryMock = {
    create: jest.fn(),
    save: jest.fn(),
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
      {
        name: 'Test',
        birthDate: '1990-05-15',
        birthTime: '14:30',
        birthPlace: 'Buenos Aires',
        latitude: -34.6,
        longitude: -58.3,
        timezone: 'America/Argentina/Buenos_Aires',
      },
      UserPlan.ANONYMOUS,
      null,
      'fingerprint',
    );

    expect(result.success).toBe(true);
    expect(
      interpretationServiceMock.generateBigThreeInterpretation,
    ).toHaveBeenCalled();
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
});
