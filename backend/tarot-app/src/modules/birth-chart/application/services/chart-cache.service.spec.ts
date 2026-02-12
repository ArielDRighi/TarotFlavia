import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ChartCacheService } from './chart-cache.service';
import { ChartData, PlanetPosition } from '../../entities/birth-chart.entity';
import { FullChartInterpretation } from './chart-interpretation.service';
import { ZodiacSign } from '../../domain/enums';

describe('ChartCacheService', () => {
  let service: ChartCacheService;

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChartCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ChartCacheService>(ChartCacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ============================================================================
  // GENERACIÓN DE CLAVES DE CACHÉ
  // ============================================================================

  describe('generateChartCacheKey', () => {
    it('should generate deterministic cache key for same inputs', () => {
      const birthDate = new Date('1990-05-15');
      const birthTime = '14:30:00';
      const latitude = -34.6037;
      const longitude = -58.3816;

      const key1 = service.generateChartCacheKey(
        birthDate,
        birthTime,
        latitude,
        longitude,
      );
      const key2 = service.generateChartCacheKey(
        birthDate,
        birthTime,
        latitude,
        longitude,
      );

      expect(key1).toBe(key2);
      expect(key1).toHaveLength(64); // SHA-256 hex = 64 caracteres
    });

    it('should generate different keys for different dates', () => {
      const birthTime = '14:30:00';
      const latitude = -34.6037;
      const longitude = -58.3816;

      const key1 = service.generateChartCacheKey(
        new Date('1990-05-15'),
        birthTime,
        latitude,
        longitude,
      );
      const key2 = service.generateChartCacheKey(
        new Date('1990-05-16'),
        birthTime,
        latitude,
        longitude,
      );

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different times', () => {
      const birthDate = new Date('1990-05-15');
      const latitude = -34.6037;
      const longitude = -58.3816;

      const key1 = service.generateChartCacheKey(
        birthDate,
        '14:30:00',
        latitude,
        longitude,
      );
      const key2 = service.generateChartCacheKey(
        birthDate,
        '14:31:00',
        latitude,
        longitude,
      );

      expect(key1).not.toBe(key2);
    });

    it('should generate different keys for different coordinates', () => {
      const birthDate = new Date('1990-05-15');
      const birthTime = '14:30:00';

      const key1 = service.generateChartCacheKey(
        birthDate,
        birthTime,
        -34.6037,
        -58.3816,
      );
      const key2 = service.generateChartCacheKey(
        birthDate,
        birthTime,
        -34.6038,
        -58.3816,
      );

      expect(key1).not.toBe(key2);
    });
  });

  describe('generateSynthesisCacheKey', () => {
    it('should generate synthesis key from chart key', () => {
      const chartKey = 'abc123';
      const synthesisKey = service.generateSynthesisCacheKey(chartKey);

      expect(synthesisKey).toBe('synthesis:abc123');
    });
  });

  describe('generateInterpretationCacheKey', () => {
    it('should generate interpretation key from chart key', () => {
      const chartKey = 'abc123';
      const interpretationKey =
        service.generateInterpretationCacheKey(chartKey);

      expect(interpretationKey).toBe('interpretation:abc123');
    });
  });

  // ============================================================================
  // CACHÉ DE CÁLCULOS DE CARTA
  // ============================================================================

  describe('getChartCalculation', () => {
    it('should return cached chart data if exists', async () => {
      const cacheKey = 'test-key';
      const cachedData = {
        chartData: { planets: [] } as unknown as ChartData,
        calculatedAt: new Date().toISOString(),
        cacheKey,
      };

      mockCacheManager.get.mockResolvedValue(cachedData);

      const result = await service.getChartCalculation(cacheKey);

      expect(result).toEqual(cachedData);
      expect(mockCacheManager.get).toHaveBeenCalledWith('chart:test-key');
    });

    it('should return null if cache miss', async () => {
      const cacheKey = 'test-key';
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getChartCalculation(cacheKey);

      expect(result).toBeNull();
    });

    it('should return null if error occurs', async () => {
      const cacheKey = 'test-key';
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.getChartCalculation(cacheKey);

      expect(result).toBeNull();
    });
  });

  describe('setChartCalculation', () => {
    it('should save chart data to cache with 24h TTL', async () => {
      const cacheKey = 'test-key';
      const chartData = {
        planets: [],
        houses: [],
        aspects: [],
        ascendant: {} as unknown as PlanetPosition,
        midheaven: {} as unknown as PlanetPosition,
        distribution: {
          elements: { fire: 0, earth: 0, air: 0, water: 0 },
          modalities: { cardinal: 0, fixed: 0, mutable: 0 },
          polarity: { masculine: 0, feminine: 0 },
        },
      } as ChartData;

      await service.setChartCalculation(cacheKey, chartData);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'chart:test-key',
        expect.objectContaining({
          chartData,
          cacheKey,
        }),
        24 * 60 * 60 * 1000, // 24 hours
      );
    });

    it('should not throw if cache fails', async () => {
      const cacheKey = 'test-key';
      const chartData: ChartData = {} as unknown as ChartData;

      mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

      await expect(
        service.setChartCalculation(cacheKey, chartData),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // CACHÉ DE SÍNTESIS DE IA
  // ============================================================================

  describe('getSynthesis', () => {
    it('should return cached synthesis if exists', async () => {
      const chartCacheKey = 'test-chart-key';
      const cachedSynthesis = {
        synthesis: 'Test synthesis',
        generatedAt: new Date().toISOString(),
        provider: 'openai',
        model: 'gpt-4',
      };

      mockCacheManager.get.mockResolvedValue(cachedSynthesis);

      const result = await service.getSynthesis(chartCacheKey);

      expect(result).toEqual(cachedSynthesis);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'synthesis:test-chart-key',
      );
    });

    it('should return null if cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getSynthesis('test-key');

      expect(result).toBeNull();
    });

    it('should return null if error occurs', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.getSynthesis('test-key');

      expect(result).toBeNull();
    });
  });

  describe('setSynthesis', () => {
    it('should save synthesis to cache with 7 days TTL', async () => {
      const chartCacheKey = 'test-key';
      const synthesis = 'Test synthesis';
      const provider = 'openai';
      const model = 'gpt-4';

      await service.setSynthesis(chartCacheKey, synthesis, provider, model);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'synthesis:test-key',
        expect.objectContaining({
          synthesis,
          provider,
          model,
        }),
        7 * 24 * 60 * 60 * 1000, // 7 days
      );
    });

    it('should not throw if cache fails', async () => {
      mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

      await expect(
        service.setSynthesis('test-key', 'synthesis', 'openai', 'gpt-4'),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // CACHÉ DE INTERPRETACIONES
  // ============================================================================

  describe('getInterpretation', () => {
    it('should return cached interpretation if exists', async () => {
      const chartCacheKey = 'test-chart-key';
      const cachedInterpretation: FullChartInterpretation = {
        bigThree: {
          sun: {
            sign: ZodiacSign.LEO,
            signName: 'Leo',
            interpretation: 'Sol en Leo',
          },
          moon: {
            sign: ZodiacSign.SCORPIO,
            signName: 'Escorpio',
            interpretation: 'Luna en Escorpio',
          },
          ascendant: {
            sign: ZodiacSign.VIRGO,
            signName: 'Virgo',
            interpretation: 'Ascendente en Virgo',
          },
        },
        planets: [],
        distribution: {
          elements: [],
          modalities: [],
        },
        aspectSummary: {
          total: 0,
          harmonious: 0,
          challenging: 0,
        },
      };

      mockCacheManager.get.mockResolvedValue(cachedInterpretation);

      const result = await service.getInterpretation(chartCacheKey);

      expect(result).toEqual(cachedInterpretation);
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'interpretation:test-chart-key',
      );
    });

    it('should return null if cache miss', async () => {
      mockCacheManager.get.mockResolvedValue(null);

      const result = await service.getInterpretation('test-key');

      expect(result).toBeNull();
    });

    it('should return null if error occurs', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));

      const result = await service.getInterpretation('test-key');

      expect(result).toBeNull();
    });
  });

  describe('setInterpretation', () => {
    it('should save interpretation to cache with 30 days TTL', async () => {
      const chartCacheKey = 'test-key';
      const interpretation: FullChartInterpretation = {
        bigThree: {
          sun: {
            sign: ZodiacSign.LEO,
            signName: 'Leo',
            interpretation: 'Sol en Leo',
          },
          moon: {
            sign: ZodiacSign.SCORPIO,
            signName: 'Escorpio',
            interpretation: 'Luna en Escorpio',
          },
          ascendant: {
            sign: ZodiacSign.VIRGO,
            signName: 'Virgo',
            interpretation: 'Ascendente en Virgo',
          },
        },
        planets: [],
        distribution: {
          elements: [],
          modalities: [],
        },
        aspectSummary: {
          total: 0,
          harmonious: 0,
          challenging: 0,
        },
      };

      await service.setInterpretation(chartCacheKey, interpretation);

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'interpretation:test-key',
        interpretation,
        30 * 24 * 60 * 60 * 1000, // 30 days
      );
    });

    it('should not throw if cache fails', async () => {
      mockCacheManager.set.mockRejectedValue(new Error('Cache error'));

      await expect(
        service.setInterpretation(
          'test-key',
          {} as unknown as FullChartInterpretation,
        ),
      ).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // INVALIDACIÓN DE CACHÉ
  // ============================================================================

  describe('invalidateChart', () => {
    it('should delete all cache entries for a chart', async () => {
      const chartCacheKey = 'test-key';

      await service.invalidateChart(chartCacheKey);

      expect(mockCacheManager.del).toHaveBeenCalledTimes(3);
      expect(mockCacheManager.del).toHaveBeenCalledWith('chart:test-key');
      expect(mockCacheManager.del).toHaveBeenCalledWith('synthesis:test-key');
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'interpretation:test-key',
      );
    });

    it('should not throw if deletion fails', async () => {
      mockCacheManager.del.mockRejectedValue(new Error('Delete error'));

      await expect(service.invalidateChart('test-key')).resolves.not.toThrow();
    });
  });

  // ============================================================================
  // ESTADÍSTICAS DE CACHÉ
  // ============================================================================

  describe('getCacheStats', () => {
    it('should return cache statistics', async () => {
      const stats = await service.getCacheStats();

      expect(stats).toEqual({
        chartCalculations: 0,
        syntheses: 0,
        interpretations: 0,
      });
    });
  });
});
