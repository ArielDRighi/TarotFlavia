import { Test, TestingModule } from '@nestjs/testing';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { GeocodeService } from './geocode.service';
import { GeocodeCacheService } from './geocode-cache.service';
import { GeocodedPlaceDto } from '../dto/geocode-response.dto';

describe('GeocodeService', () => {
  let service: GeocodeService;
  let httpService: jest.Mocked<HttpService>;
  let configService: jest.Mocked<ConfigService>;
  let cacheService: jest.Mocked<GeocodeCacheService>;

  const mockNominatimResult = {
    place_id: 123456,
    licence: 'ODbL',
    osm_type: 'relation',
    osm_id: 1123456,
    boundingbox: ['-34.7', '-34.5', '-58.5', '-58.2'],
    lat: '-34.6037',
    lon: '-58.3816',
    display_name: 'Buenos Aires, Argentina',
    class: 'place',
    type: 'city',
    importance: 0.75,
    address: {
      city: 'Buenos Aires',
      country: 'Argentina',
      country_code: 'ar',
    },
  };

  const mockTimezoneDBResult = {
    status: 'OK',
    zoneName: 'America/Argentina/Buenos_Aires',
    abbreviation: 'ART',
    gmtOffset: -10800,
  };

  const mockPhotonFeatureCollection = {
    features: [
      {
        geometry: { coordinates: [-65.4095, -24.7859] },
        properties: {
          osm_id: 98765,
          osm_type: 'R',
          name: 'Salta',
          country: 'Argentina',
          state: 'Salta',
          type: 'city',
        },
      },
    ],
  };

  beforeEach(async () => {
    const mockHttpService = {
      get: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const mockCacheService = {
      getSearchResults: jest.fn(),
      setSearchResults: jest.fn(),
      getPlaceDetails: jest.fn(),
      setPlaceDetails: jest.fn(),
      getTimezone: jest.fn(),
      setTimezone: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GeocodeService,
        {
          provide: HttpService,
          useValue: mockHttpService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: GeocodeCacheService,
          useValue: mockCacheService,
        },
      ],
    }).compile();

    service = module.get<GeocodeService>(GeocodeService);
    httpService = module.get(HttpService);
    configService = module.get(ConfigService);
    cacheService = module.get(GeocodeCacheService);

    jest.clearAllMocks();
  });

  describe('searchPlaces', () => {
    it('should return cached results if available', async () => {
      const cachedResults: GeocodedPlaceDto[] = [
        {
          placeId: 'cached-id',
          displayName: 'Buenos Aires, Argentina',
          city: 'Buenos Aires',
          country: 'Argentina',
          latitude: -34.6037,
          longitude: -58.3816,
          timezone: 'America/Argentina/Buenos_Aires',
        },
      ];

      cacheService.getSearchResults.mockResolvedValue(cachedResults);

      const result = await service.searchPlaces('Buenos Aires');

      expect(result.results).toEqual(cachedResults);
      expect(result.count).toBe(1);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from Photon as primary source on cache miss', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('America/Argentina/Salta');

      const mockPhotonResponse: AxiosResponse = {
        data: mockPhotonFeatureCollection,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockPhotonResponse));

      const result = await service.searchPlaces('Salta');

      expect(result.results).toHaveLength(1);
      expect(result.results[0].city).toBe('Salta');
      expect(result.results[0].country).toBe('Argentina');
      expect(result.results[0].latitude).toBe(-24.7859);
      expect(result.results[0].longitude).toBe(-65.4095);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://photon.komoot.io/api/',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'Salta',
            lang: 'es',
            limit: 5,
          }),
          headers: expect.objectContaining({
            'User-Agent': 'Auguria/1.0 (contact@auguria.com)',
          }),
        }),
      );
      expect(cacheService.setSearchResults).toHaveBeenCalled();
    });

    it('should map Photon result to GeocodedPlaceDto with correct placeId format', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('America/Argentina/Salta');

      const mockPhotonResponse: AxiosResponse = {
        data: mockPhotonFeatureCollection,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockPhotonResponse));

      const result = await service.searchPlaces('Salta');

      expect(result.results[0].placeId).toBe('photon_R_98765');
    });

    it('should build displayName as "name, state, country" from Photon response', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('America/Argentina/Salta');

      const mockPhotonResponse: AxiosResponse = {
        data: mockPhotonFeatureCollection,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockPhotonResponse));

      const result = await service.searchPlaces('Salta');

      expect(result.results[0].displayName).toBe('Salta, Salta, Argentina');
    });

    it('should build displayName without state when state is absent', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('UTC');

      const featureWithoutState = {
        features: [
          {
            geometry: { coordinates: [-58.3816, -34.6037] },
            properties: {
              osm_id: 11111,
              osm_type: 'N',
              name: 'Buenos Aires',
              country: 'Argentina',
              type: 'city',
            },
          },
        ],
      };

      const mockPhotonResponse: AxiosResponse = {
        data: featureWithoutState,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockPhotonResponse));

      const result = await service.searchPlaces('Buenos Aires');

      expect(result.results[0].displayName).toBe('Buenos Aires, Argentina');
    });

    it('should fallback to Nominatim when Photon fails', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null); // No API key, use longitude fallback

      // Photon falla en el primer llamado
      const mockNominatimResponse: AxiosResponse = {
        data: [mockNominatimResult],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get
        .mockReturnValueOnce(throwError(() => new Error('Photon timeout')))
        .mockReturnValue(of(mockNominatimResponse));

      const result = await service.searchPlaces('Buenos Aires');

      expect(result.results).toHaveLength(1);
      expect(result.results[0].city).toBe('Buenos Aires');
      expect(result.results[0].country).toBe('Argentina');
      // El segundo llamado debe ser a Nominatim
      expect(httpService.get).toHaveBeenCalledTimes(2);
      expect(httpService.get).toHaveBeenNthCalledWith(
        1,
        'https://photon.komoot.io/api/',
        expect.anything(),
      );
      expect(httpService.get).toHaveBeenNthCalledWith(
        2,
        'https://nominatim.openstreetmap.org/search',
        expect.anything(),
      );
    });

    it('should throw error when both Photon and Nominatim fail', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);

      httpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      await expect(service.searchPlaces('Invalid')).rejects.toThrow(
        'No se pudo buscar el lugar',
      );
    });

    it('should call Photon with basic search parameters for cities', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('UTC');

      const mockPhotonResponse: AxiosResponse = {
        data: { features: [] },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockPhotonResponse));

      await service.searchPlaces('Paris');

      expect(httpService.get).toHaveBeenCalledWith(
        'https://photon.komoot.io/api/',
        expect.objectContaining({
          params: expect.objectContaining({
            q: 'Paris',
            lang: 'es',
            limit: 5,
          }),
        }),
      );
    });

    it('should respect rate limiting between Nominatim fallback requests', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null);

      const mockNominatimResponse: AxiosResponse = {
        data: [mockNominatimResult],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      // Photon falla, Nominatim responde
      httpService.get
        .mockReturnValueOnce(throwError(() => new Error('Photon down')))
        .mockReturnValueOnce(of(mockNominatimResponse))
        .mockReturnValueOnce(throwError(() => new Error('Photon down')))
        .mockReturnValue(of(mockNominatimResponse));

      const start = Date.now();
      await service.searchPlaces('Buenos Aires');
      await service.searchPlaces('Madrid');
      const duration = Date.now() - start;

      // Should wait at least 1100ms between Nominatim requests
      expect(duration).toBeGreaterThanOrEqual(1000);
    });
  });

  describe('getTimezone', () => {
    it('should return cached timezone if available', async () => {
      cacheService.getTimezone.mockResolvedValue(
        'America/Argentina/Buenos_Aires',
      );

      const result = await service.getTimezone(-34.6037, -58.3816);

      expect(result).toBe('America/Argentina/Buenos_Aires');
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from TimeZoneDB if API key is configured', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue('test-api-key');

      const mockResponse: AxiosResponse = {
        data: mockTimezoneDBResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getTimezone(-34.6037, -58.3816);

      expect(result).toBe('America/Argentina/Buenos_Aires');
      expect(httpService.get).toHaveBeenCalledWith(
        'http://api.timezonedb.com/v2.1/get-time-zone',
        expect.objectContaining({
          params: expect.objectContaining({
            key: 'test-api-key',
            format: 'json',
            by: 'position',
            lat: -34.6037,
            lng: -58.3816,
          }),
        }),
      );
      expect(cacheService.setTimezone).toHaveBeenCalled();
    });

    it('should use fallback if no API key configured', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null);

      const result = await service.getTimezone(0, -45);

      // Longitude -45 -> Offset -3 hours -> Etc/GMT+3
      expect(result).toBe('Etc/GMT+3');
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should use fallback if TimeZoneDB fails', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue('test-api-key');

      httpService.get.mockReturnValue(throwError(() => new Error('API Error')));

      const result = await service.getTimezone(0, 30);

      // Longitude 30 -> Offset +2 hours -> Etc/GMT-2
      expect(result).toBe('Etc/GMT-2');
    });

    it('should handle TimeZoneDB error responses', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue('test-api-key');

      const mockResponse: AxiosResponse = {
        data: {
          status: 'FAILED',
          message: 'Invalid API key',
        },
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getTimezone(0, 15);

      // Should fallback to longitude estimation
      expect(result).toBe('Etc/GMT-1');
    });
  });

  describe('estimateTimezoneByLongitude', () => {
    it('should return UTC for longitude 0', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null);

      const result = await service.getTimezone(0, 0);

      expect(result).toBe('UTC');
    });

    it('should estimate positive offset correctly', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null);

      // Longitude 45 -> +3 hours
      const result = await service.getTimezone(0, 45);

      expect(result).toBe('Etc/GMT-3');
    });

    it('should estimate negative offset correctly', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null);

      // Longitude -60 -> -4 hours
      const result = await service.getTimezone(0, -60);

      expect(result).toBe('Etc/GMT+4');
    });

    it('should round to nearest hour', async () => {
      cacheService.getTimezone.mockResolvedValue(null);
      configService.get.mockReturnValue(null);

      // Longitude 22.5 -> ~1.5 hours -> rounds to +2
      const result = await service.getTimezone(0, 22.5);

      expect(result).toBe('Etc/GMT-2');
    });
  });

  describe('extractCity (via searchPlaces with Nominatim fallback)', () => {
    it('should extract city from address', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('UTC');

      // Photon falla, Nominatim responde
      const mockNominatimResponse: AxiosResponse = {
        data: [
          {
            ...mockNominatimResult,
            address: {
              city: 'Buenos Aires',
              country: 'Argentina',
            },
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get
        .mockReturnValueOnce(throwError(() => new Error('Photon unavailable')))
        .mockReturnValue(of(mockNominatimResponse));

      const result = await service.searchPlaces('Buenos Aires');

      expect(result.results[0].city).toBe('Buenos Aires');
    });

    it('should fallback to town if city not available', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('UTC');

      const mockNominatimResponse: AxiosResponse = {
        data: [
          {
            ...mockNominatimResult,
            address: {
              town: 'Small Town',
              country: 'Country',
            },
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get
        .mockReturnValueOnce(throwError(() => new Error('Photon unavailable')))
        .mockReturnValue(of(mockNominatimResponse));

      const result = await service.searchPlaces('Town');

      expect(result.results[0].city).toBe('Small Town');
    });

    it('should return empty string if no city info', async () => {
      cacheService.getSearchResults.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('UTC');

      const mockNominatimResponse: AxiosResponse = {
        data: [
          {
            ...mockNominatimResult,
            address: {
              country: 'Country',
            },
          },
        ],
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get
        .mockReturnValueOnce(throwError(() => new Error('Photon unavailable')))
        .mockReturnValue(of(mockNominatimResponse));

      const result = await service.searchPlaces('Place');

      expect(result.results[0].city).toBe('');
    });
  });

  describe('getPlaceDetails', () => {
    it('should return cached place details if available', async () => {
      const mockPlace: GeocodedPlaceDto = {
        placeId: 'osm_relation_1123456',
        displayName: 'Buenos Aires, Argentina',
        city: 'Buenos Aires',
        country: 'Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      cacheService.getPlaceDetails.mockResolvedValue(mockPlace);

      const result = await service.getPlaceDetails(-34.6037, -58.3816);

      expect(result).toEqual(mockPlace);
      expect(httpService.get).not.toHaveBeenCalled();
    });

    it('should fetch from Nominatim reverse geocoding if cache miss', async () => {
      cacheService.getPlaceDetails.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue(
        'America/Argentina/Buenos_Aires',
      );

      const mockResponse: AxiosResponse = {
        data: mockNominatimResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const result = await service.getPlaceDetails(-34.6037, -58.3816);

      expect(result).not.toBeNull();
      expect(result?.city).toBe('Buenos Aires');
      expect(result?.country).toBe('Argentina');
      expect(result?.latitude).toBe(-34.6037);
      expect(result?.longitude).toBe(-58.3816);
      expect(httpService.get).toHaveBeenCalledWith(
        'https://nominatim.openstreetmap.org/reverse',
        expect.objectContaining({
          params: expect.objectContaining({
            lat: -34.6037,
            lon: -58.3816,
            format: 'json',
            addressdetails: 1,
            'accept-language': 'es',
          }),
          headers: {
            'User-Agent': 'Auguria/1.0 (contact@auguria.com)',
          },
        }),
      );
      expect(cacheService.setPlaceDetails).toHaveBeenCalled();
    });

    it('should respect rate limiting when fetching place details', async () => {
      cacheService.getPlaceDetails.mockResolvedValue(null);
      cacheService.getTimezone.mockResolvedValue('UTC');

      const mockResponse: AxiosResponse = {
        data: mockNominatimResult,
        status: 200,
        statusText: 'OK',
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      };

      httpService.get.mockReturnValue(of(mockResponse));

      const start = Date.now();
      await service.getPlaceDetails(-34.6037, -58.3816);
      await service.getPlaceDetails(40.7128, -74.006);
      const duration = Date.now() - start;

      // Should wait at least 1100ms between requests
      expect(duration).toBeGreaterThanOrEqual(1000);
    });

    it('should return null if reverse geocoding fails', async () => {
      cacheService.getPlaceDetails.mockResolvedValue(null);
      httpService.get.mockReturnValue(
        throwError(() => new Error('Network error')),
      );

      const result = await service.getPlaceDetails(0, 0);

      expect(result).toBeNull();
    });

    it('should use 4 decimal precision for cache key', async () => {
      const mockPlace: GeocodedPlaceDto = {
        placeId: 'osm_relation_1123456',
        displayName: 'Test Location',
        city: 'Test City',
        country: 'Test Country',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'UTC',
      };

      cacheService.getPlaceDetails.mockResolvedValue(mockPlace);

      await service.getPlaceDetails(-34.60374123, -58.38165789);

      // Should call with 4 decimal places
      expect(cacheService.getPlaceDetails).toHaveBeenCalledWith(
        '-34.6037,-58.3817',
      );
    });
  });
});
