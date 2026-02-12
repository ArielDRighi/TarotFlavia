import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GeocodeCacheService } from './geocode-cache.service';
import { GeocodedPlaceDto } from '../../application/dto/geocode-response.dto';

describe('GeocodeCacheService', () => {
  let service: GeocodeCacheService;
  let cacheManager: jest.Mocked<Cache>;

  const mockPlace: GeocodedPlaceDto = {
    placeId: 'test-place-id',
    displayName: 'Buenos Aires, Argentina',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  };

  beforeEach(async () => {
    const mockCacheManager: Partial<Cache> = {
      get: jest.fn(),
      set: jest.fn(),
      del: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocodeCacheService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<GeocodeCacheService>(GeocodeCacheService);
    cacheManager = module.get(CACHE_MANAGER);

    jest.clearAllMocks();
  });

  describe('getSearchResults', () => {
    it('should return cached search results if exists', async () => {
      const query = 'Buenos Aires';
      const cachedResults = [mockPlace];
      cacheManager.get.mockResolvedValue(cachedResults);

      const result = await service.getSearchResults(query);

      expect(result).toEqual(cachedResults);
      expect(cacheManager.get).toHaveBeenCalledWith(
        'geocode:search:buenos_aires',
      );
    });

    it('should return null if cache miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.getSearchResults('NonExistent');

      expect(result).toBeNull();
    });

    it('should normalize query to lowercase and replace spaces', async () => {
      await service.getSearchResults('Buenos  Aires  Argentina');

      expect(cacheManager.get).toHaveBeenCalledWith(
        'geocode:search:buenos_aires_argentina',
      );
    });
  });

  describe('setSearchResults', () => {
    it('should store search results with correct TTL', async () => {
      const query = 'Buenos Aires';
      const results = [mockPlace];

      await service.setSearchResults(query, results);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'geocode:search:buenos_aires',
        results,
        7 * 24 * 60 * 60 * 1000, // 7 días en ms
      );
    });
  });

  describe('getPlace', () => {
    it('should return cached place details if exists', async () => {
      const placeId = 'test-place-id';
      cacheManager.get.mockResolvedValue(mockPlace);

      const result = await service.getPlace(placeId);

      expect(result).toEqual(mockPlace);
      expect(cacheManager.get).toHaveBeenCalledWith(
        'geocode:place:test-place-id',
      );
    });

    it('should return null if cache miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.getPlace('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('setPlace', () => {
    it('should store place details with correct TTL', async () => {
      await service.setPlace(mockPlace.placeId, mockPlace);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'geocode:place:test-place-id',
        mockPlace,
        30 * 24 * 60 * 60 * 1000, // 30 días en ms
      );
    });
  });

  describe('getTimezone', () => {
    it('should return cached timezone if exists', async () => {
      const coordKey = '-34.6037,-58.3816';
      const timezone = 'America/Argentina/Buenos_Aires';
      cacheManager.get.mockResolvedValue(timezone);

      const result = await service.getTimezone(coordKey);

      expect(result).toBe(timezone);
      expect(cacheManager.get).toHaveBeenCalledWith(
        'geocode:tz:-34.6037,-58.3816',
      );
    });

    it('should return null if cache miss', async () => {
      cacheManager.get.mockResolvedValue(undefined);

      const result = await service.getTimezone('0,0');

      expect(result).toBeNull();
    });
  });

  describe('setTimezone', () => {
    it('should store timezone with correct TTL', async () => {
      const coordKey = '-34.6037,-58.3816';
      const timezone = 'America/Argentina/Buenos_Aires';

      await service.setTimezone(coordKey, timezone);

      expect(cacheManager.set).toHaveBeenCalledWith(
        'geocode:tz:-34.6037,-58.3816',
        timezone,
        365 * 24 * 60 * 60 * 1000, // 1 año en ms
      );
    });
  });

  describe('normalizeQuery', () => {
    it('should normalize query with multiple spaces', async () => {
      // Test indirectly through getSearchResults
      await service.getSearchResults('Buenos   Aires   Argentina');

      expect(cacheManager.get).toHaveBeenCalledWith(
        'geocode:search:buenos_aires_argentina',
      );
    });

    it('should handle queries with leading/trailing spaces', async () => {
      await service.getSearchResults('  Madrid  ');

      expect(cacheManager.get).toHaveBeenCalledWith('geocode:search:madrid');
    });

    it('should handle special characters', async () => {
      await service.getSearchResults('São Paulo');

      expect(cacheManager.get).toHaveBeenCalledWith('geocode:search:são_paulo');
    });
  });
});
