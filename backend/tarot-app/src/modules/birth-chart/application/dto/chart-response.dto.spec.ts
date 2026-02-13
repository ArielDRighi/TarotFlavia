import { plainToInstance } from 'class-transformer';
import {
  PlanetPositionDto,
  HouseCuspDto,
  ChartAspectDto,
  ChartDistributionDto,
  BasicChartResponseDto,
  FullChartResponseDto,
  PremiumChartResponseDto,
  SavedChartSummaryDto,
  ChartHistoryResponseDto,
} from './chart-response.dto';

describe('PlanetPositionDto', () => {
  it('should create a valid instance', () => {
    const dto = plainToInstance(PlanetPositionDto, {
      planet: 'sun',
      sign: 'leo',
      signName: 'Leo',
      signDegree: 15.5,
      formattedPosition: "15° 30' Leo",
      house: 5,
      isRetrograde: false,
    });

    expect(dto).toBeDefined();
    expect(dto.planet).toBe('sun');
    expect(dto.sign).toBe('leo');
    expect(dto.signName).toBe('Leo');
    expect(dto.signDegree).toBe(15.5);
    expect(dto.formattedPosition).toBe("15° 30' Leo");
    expect(dto.house).toBe(5);
    expect(dto.isRetrograde).toBe(false);
  });
});

describe('HouseCuspDto', () => {
  it('should create a valid instance', () => {
    const dto = plainToInstance(HouseCuspDto, {
      house: 1,
      sign: 'virgo',
      signName: 'Virgo',
      signDegree: 12.25,
      formattedPosition: "12° 15' Virgo",
    });

    expect(dto).toBeDefined();
    expect(dto.house).toBe(1);
    expect(dto.sign).toBe('virgo');
    expect(dto.signName).toBe('Virgo');
    expect(dto.signDegree).toBe(12.25);
    expect(dto.formattedPosition).toBe("12° 15' Virgo");
  });
});

describe('ChartAspectDto', () => {
  it('should create a valid instance', () => {
    const dto = plainToInstance(ChartAspectDto, {
      planet1: 'sun',
      planet1Name: 'Sol',
      planet2: 'moon',
      planet2Name: 'Luna',
      aspectType: 'trine',
      aspectName: 'Trígono',
      aspectSymbol: '△',
      orb: 2.5,
      isApplying: true,
    });

    expect(dto).toBeDefined();
    expect(dto.planet1).toBe('sun');
    expect(dto.planet1Name).toBe('Sol');
    expect(dto.planet2).toBe('moon');
    expect(dto.planet2Name).toBe('Luna');
    expect(dto.aspectType).toBe('trine');
    expect(dto.aspectName).toBe('Trígono');
    expect(dto.aspectSymbol).toBe('△');
    expect(dto.orb).toBe(2.5);
    expect(dto.isApplying).toBe(true);
  });
});

describe('ChartDistributionDto', () => {
  it('should create a valid instance with elements and modalities', () => {
    const dto = plainToInstance(ChartDistributionDto, {
      elements: [
        { name: 'Fuego', count: 3, percentage: 27 },
        { name: 'Tierra', count: 4, percentage: 36 },
        { name: 'Aire', count: 2, percentage: 18 },
        { name: 'Agua', count: 2, percentage: 18 },
      ],
      modalities: [
        { name: 'Cardinal', count: 4, percentage: 36 },
        { name: 'Fijo', count: 3, percentage: 27 },
        { name: 'Mutable', count: 4, percentage: 36 },
      ],
    });

    expect(dto).toBeDefined();
    expect(dto.elements).toHaveLength(4);
    expect(dto.modalities).toHaveLength(3);
    expect(dto.elements[0].name).toBe('Fuego');
    expect(dto.modalities[0].percentage).toBe(36);
  });
});

describe('BasicChartResponseDto', () => {
  it('should create a valid basic response (for Anonymous users)', () => {
    const dto = plainToInstance(BasicChartResponseDto, {
      success: true,
      chartSvgData: {
        planets: [],
        houses: [],
        aspects: [],
      },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'Test' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'Test' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'Test' },
      },
      calculationTimeMs: 125,
    });

    expect(dto).toBeDefined();
    expect(dto.success).toBe(true);
    expect(dto.bigThree).toBeDefined();
    expect(dto.bigThree.sun.sign).toBe('leo');
    expect(dto.calculationTimeMs).toBe(125);
  });

  it('should have Big Three with Spanish names', () => {
    const dto = plainToInstance(BasicChartResponseDto, {
      success: true,
      chartSvgData: { planets: [], houses: [], aspects: [] },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'Test' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'Test' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'Test' },
      },
      calculationTimeMs: 125,
    });

    expect(dto.bigThree.moon.signName).toBe('Escorpio');
  });
});

describe('FullChartResponseDto', () => {
  it('should extend BasicChartResponseDto', () => {
    const dto = plainToInstance(FullChartResponseDto, {
      success: true,
      chartSvgData: { planets: [], houses: [], aspects: [] },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'Test' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'Test' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'Test' },
      },
      calculationTimeMs: 125,
      distribution: {
        elements: [],
        modalities: [],
      },
      interpretations: {
        planets: [],
      },
      canDownloadPdf: true,
    });

    expect(dto).toBeDefined();
    expect(dto.success).toBe(true); // From BasicChartResponseDto
    expect(dto.distribution).toBeDefined();
    expect(dto.interpretations).toBeDefined();
    expect(dto.canDownloadPdf).toBe(true);
  });

  it('should include distribution and interpretations', () => {
    const dto = plainToInstance(FullChartResponseDto, {
      success: true,
      chartSvgData: { planets: [], houses: [], aspects: [] },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'Test' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'Test' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'Test' },
      },
      calculationTimeMs: 125,
      distribution: {
        elements: [{ name: 'Fuego', count: 3, percentage: 27 }],
        modalities: [{ name: 'Cardinal', count: 4, percentage: 36 }],
      },
      interpretations: {
        planets: [
          {
            planet: 'sun',
            planetName: 'Sol',
            intro: 'Test',
            inSign: 'Test',
            inHouse: 'Test',
            aspects: [],
          },
        ],
      },
      canDownloadPdf: true,
    });

    expect(dto.distribution.elements).toHaveLength(1);
    expect(dto.interpretations.planets).toHaveLength(1);
    expect(dto.interpretations.planets[0].planetName).toBe('Sol');
  });
});

describe('PremiumChartResponseDto', () => {
  it('should extend FullChartResponseDto', () => {
    const dto = plainToInstance(PremiumChartResponseDto, {
      success: true,
      chartSvgData: { planets: [], houses: [], aspects: [] },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'Test' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'Test' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'Test' },
      },
      calculationTimeMs: 125,
      distribution: { elements: [], modalities: [] },
      interpretations: { planets: [] },
      canDownloadPdf: true,
      savedChartId: 1,
      aiSynthesis: {
        content: 'Síntesis personalizada...',
        generatedAt: '2026-02-10T12:00:00Z',
        provider: 'groq-llama3.1-70b',
      },
      canAccessHistory: true,
    });

    expect(dto).toBeDefined();
    expect(dto.canDownloadPdf).toBe(true); // From FullChartResponseDto
    expect(dto.savedChartId).toBe(1);
    expect(dto.aiSynthesis).toBeDefined();
    expect(dto.aiSynthesis.provider).toBe('groq-llama3.1-70b');
    expect(dto.canAccessHistory).toBe(true);
  });

  it('should allow optional savedChartId', () => {
    const dto = plainToInstance(PremiumChartResponseDto, {
      success: true,
      chartSvgData: { planets: [], houses: [], aspects: [] },
      planets: [],
      houses: [],
      aspects: [],
      bigThree: {
        sun: { sign: 'leo', signName: 'Leo', interpretation: 'Test' },
        moon: { sign: 'scorpio', signName: 'Escorpio', interpretation: 'Test' },
        ascendant: { sign: 'virgo', signName: 'Virgo', interpretation: 'Test' },
      },
      calculationTimeMs: 125,
      distribution: { elements: [], modalities: [] },
      interpretations: { planets: [] },
      canDownloadPdf: true,
      aiSynthesis: {
        content: 'Test',
        generatedAt: '2026-02-10T12:00:00Z',
        provider: 'groq',
      },
      canAccessHistory: true,
    });

    expect(dto.savedChartId).toBeUndefined();
  });
});

describe('SavedChartSummaryDto', () => {
  it('should create a valid instance for chart history', () => {
    const dto = plainToInstance(SavedChartSummaryDto, {
      id: 1,
      name: 'Mi carta natal',
      birthDate: '1990-05-15',
      sunSign: 'Leo',
      moonSign: 'Escorpio',
      ascendantSign: 'Virgo',
      createdAt: '2026-02-06T12:00:00Z',
    });

    expect(dto).toBeDefined();
    expect(dto.id).toBe(1);
    expect(dto.name).toBe('Mi carta natal');
    expect(dto.sunSign).toBe('Leo');
    expect(dto.moonSign).toBe('Escorpio');
    expect(dto.ascendantSign).toBe('Virgo');
  });
});

describe('ChartHistoryResponseDto', () => {
  it('should create a valid paginated response', () => {
    const dto = plainToInstance(ChartHistoryResponseDto, {
      data: [
        {
          id: 1,
          name: 'Mi carta natal',
          birthDate: '1990-05-15',
          sunSign: 'Leo',
          moonSign: 'Escorpio',
          ascendantSign: 'Virgo',
          createdAt: '2026-02-06T12:00:00Z',
        },
      ],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 5,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(dto).toBeDefined();
    expect(dto.data).toHaveLength(1);
    expect(dto.meta.totalItems).toBe(5);
    expect(dto.meta.page).toBe(1);
    expect(dto.meta.limit).toBe(10);
    expect(dto.meta.totalPages).toBe(1);
    expect(dto.meta.hasNextPage).toBe(false);
    expect(dto.meta.hasPreviousPage).toBe(false);
  });

  it('should handle empty chart list', () => {
    const dto = plainToInstance(ChartHistoryResponseDto, {
      data: [],
      meta: {
        page: 1,
        limit: 10,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(dto.data).toHaveLength(0);
    expect(dto.meta.totalItems).toBe(0);
  });
});
