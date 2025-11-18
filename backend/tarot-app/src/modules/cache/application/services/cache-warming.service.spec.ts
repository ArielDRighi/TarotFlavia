import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { CacheWarmingService } from './cache-warming.service';
import { CacheStrategyService } from './cache-strategy.service';
import { InterpretationsService } from '../../../tarot/interpretations/interpretations.service';
import { CacheWarmingStatusDto } from '../dto/cache-analytics.dto';

describe('CacheWarmingService', () => {
  let service: CacheWarmingService;
  let cacheStrategyService: CacheStrategyService;
  let interpretationsService: InterpretationsService;

  const mockTopCombinations = [
    {
      cardCombination: [
        { card_id: '1', position: 0, is_reversed: false },
        { card_id: '2', position: 1, is_reversed: true },
      ],
      spreadId: 1,
      hitCount: 50,
    },
    {
      cardCombination: [
        { card_id: '3', position: 0, is_reversed: false },
        { card_id: '4', position: 1, is_reversed: false },
      ],
      spreadId: 2,
      hitCount: 30,
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CacheWarmingService,
        {
          provide: CacheStrategyService,
          useValue: {
            getTopCachedCombinations: jest.fn(),
          },
        },
        {
          provide: InterpretationsService,
          useValue: {
            generateInterpretationForCacheWarming: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<CacheWarmingService>(CacheWarmingService);
    cacheStrategyService =
      module.get<CacheStrategyService>(CacheStrategyService);
    interpretationsService = module.get<InterpretationsService>(
      InterpretationsService,
    );

    // Silenciar logs en tests
    jest.spyOn(Logger.prototype, 'log').mockImplementation();
    jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('warmCache', () => {
    it('should return early if warming is already in progress', async () => {
      // Simular que ya está en progreso
      service['isWarmingInProgress'] = true;

      const result = await service.warmCache(10);

      expect(result).toEqual({
        started: false,
        message: 'Cache warming already in progress',
      });
      expect(
        cacheStrategyService.getTopCachedCombinations,
      ).not.toHaveBeenCalled();
    });

    it('should start warming cache with top combinations', async () => {
      jest
        .spyOn(cacheStrategyService, 'getTopCachedCombinations')
        .mockResolvedValue(mockTopCombinations);

      jest
        .spyOn(interpretationsService, 'generateInterpretationForCacheWarming')
        .mockResolvedValue({ interpretation: 'test', fromCache: false });

      const result = await service.warmCache(2);

      expect(result).toEqual({
        started: true,
        totalCombinations: 2,
        estimatedTimeMinutes: expect.any(Number) as number,
      });

      expect(
        cacheStrategyService.getTopCachedCombinations,
      ).toHaveBeenCalledWith(2);
      expect(service['isWarmingInProgress']).toBe(true);
    });

    it('should process combinations in batches', async () => {
      jest
        .spyOn(cacheStrategyService, 'getTopCachedCombinations')
        .mockResolvedValue(mockTopCombinations);

      const generateSpy = jest
        .spyOn(interpretationsService, 'generateInterpretationForCacheWarming')
        .mockResolvedValue({ interpretation: 'test', fromCache: false });

      await service.warmCache(2);

      // Esperar a que termine el procesamiento asíncrono
      await new Promise((resolve) => setTimeout(resolve, 100));

      expect(generateSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle errors gracefully during warming', async () => {
      jest
        .spyOn(cacheStrategyService, 'getTopCachedCombinations')
        .mockResolvedValue(mockTopCombinations);

      jest
        .spyOn(interpretationsService, 'generateInterpretationForCacheWarming')
        .mockRejectedValue(new Error('AI provider error'));

      const result = await service.warmCache(2);

      expect(result.started).toBe(true);

      // Esperar a que termine el procesamiento asíncrono
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar que manejó el error sin lanzar excepción
      expect(service['warmingErrors']).toBeGreaterThan(0);
    });
  });

  describe('getStatus', () => {
    it('should return correct status when not warming', () => {
      const status: CacheWarmingStatusDto = service.getStatus();

      expect(status).toEqual({
        isRunning: false,
        progress: 0,
        totalCombinations: 0,
        processedCombinations: 0,
        successCount: 0,
        errorCount: 0,
        estimatedTimeRemainingMinutes: 0,
      });
    });

    it('should return correct status during warming', async () => {
      jest
        .spyOn(cacheStrategyService, 'getTopCachedCombinations')
        .mockResolvedValue(mockTopCombinations);

      jest
        .spyOn(interpretationsService, 'generateInterpretationForCacheWarming')
        .mockResolvedValue({ interpretation: 'test', fromCache: false });

      await service.warmCache(2);

      const status: CacheWarmingStatusDto = service.getStatus();

      expect(status.isRunning).toBe(true);
      expect(status.totalCombinations).toBe(2);
    });
  });

  describe('stopWarming', () => {
    it('should stop warming process', async () => {
      jest
        .spyOn(cacheStrategyService, 'getTopCachedCombinations')
        .mockResolvedValue(mockTopCombinations);

      jest
        .spyOn(interpretationsService, 'generateInterpretationForCacheWarming')
        .mockResolvedValue({ interpretation: 'test', fromCache: false });

      await service.warmCache(2);
      expect(service['isWarmingInProgress']).toBe(true);

      service.stopWarming();
      expect(service['isWarmingInProgress']).toBe(false);
    });
  });
});
