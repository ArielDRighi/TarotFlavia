import { plainToInstance } from 'class-transformer';
import {
  GeocodedPlaceDto,
  GeocodeSearchResponseDto,
} from './geocode-response.dto';

describe('GeocodedPlaceDto', () => {
  it('should create a valid instance', () => {
    const dto = plainToInstance(GeocodedPlaceDto, {
      placeId: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs',
      displayName: 'Buenos Aires, Argentina',
      city: 'Buenos Aires',
      country: 'Argentina',
      latitude: -34.6037,
      longitude: -58.3816,
      timezone: 'America/Argentina/Buenos_Aires',
    });

    expect(dto).toBeDefined();
    expect(dto.placeId).toBe('ChIJZ4a1ZWzKvJUR9BPHX7NLzzs');
    expect(dto.displayName).toBe('Buenos Aires, Argentina');
    expect(dto.city).toBe('Buenos Aires');
    expect(dto.country).toBe('Argentina');
    expect(dto.latitude).toBe(-34.6037);
    expect(dto.longitude).toBe(-58.3816);
    expect(dto.timezone).toBe('America/Argentina/Buenos_Aires');
  });

  it('should handle coordinates correctly', () => {
    const dto = plainToInstance(GeocodedPlaceDto, {
      placeId: 'test',
      displayName: 'Test City',
      city: 'Test City',
      country: 'Test Country',
      latitude: 0,
      longitude: 0,
      timezone: 'UTC',
    });

    expect(dto.latitude).toBe(0);
    expect(dto.longitude).toBe(0);
  });

  it('should have proper API documentation', () => {
    const dto = new GeocodedPlaceDto();
    const metadata = Reflect.getMetadata('swagger/apiModelProperties', dto);
    expect(metadata).toBeDefined();
  });
});

describe('GeocodeSearchResponseDto', () => {
  it('should create a valid instance with multiple results', () => {
    const dto = plainToInstance(GeocodeSearchResponseDto, {
      results: [
        {
          placeId: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs',
          displayName: 'Buenos Aires, Argentina',
          city: 'Buenos Aires',
          country: 'Argentina',
          latitude: -34.6037,
          longitude: -58.3816,
          timezone: 'America/Argentina/Buenos_Aires',
        },
        {
          placeId: 'ChIJ8fA1bTmvt4kRTyQSGmtNxg4',
          displayName: 'Miami, Florida, USA',
          city: 'Miami',
          country: 'USA',
          latitude: 25.7617,
          longitude: -80.1918,
          timezone: 'America/New_York',
        },
      ],
      count: 2,
    });

    expect(dto).toBeDefined();
    expect(dto.results).toHaveLength(2);
    expect(dto.count).toBe(2);
    expect(dto.results[0].city).toBe('Buenos Aires');
    expect(dto.results[1].city).toBe('Miami');
  });

  it('should handle empty results', () => {
    const dto = plainToInstance(GeocodeSearchResponseDto, {
      results: [],
      count: 0,
    });

    expect(dto).toBeDefined();
    expect(dto.results).toHaveLength(0);
    expect(dto.count).toBe(0);
  });

  it('should handle single result', () => {
    const dto = plainToInstance(GeocodeSearchResponseDto, {
      results: [
        {
          placeId: 'test',
          displayName: 'Test City',
          city: 'Test',
          country: 'Test',
          latitude: 0,
          longitude: 0,
          timezone: 'UTC',
        },
      ],
      count: 1,
    });

    expect(dto.results).toHaveLength(1);
    expect(dto.count).toBe(1);
  });

  it('should validate count matches results length', () => {
    const dto = plainToInstance(GeocodeSearchResponseDto, {
      results: [
        {
          placeId: 'test1',
          displayName: 'Test1',
          city: 'Test1',
          country: 'Test',
          latitude: 0,
          longitude: 0,
          timezone: 'UTC',
        },
        {
          placeId: 'test2',
          displayName: 'Test2',
          city: 'Test2',
          country: 'Test',
          latitude: 0,
          longitude: 0,
          timezone: 'UTC',
        },
      ],
      count: 2,
    });

    expect(dto.count).toBe(dto.results.length);
  });

  it('should have proper API documentation', () => {
    const dto = new GeocodeSearchResponseDto();
    const metadata = Reflect.getMetadata('swagger/apiModelProperties', dto);
    expect(metadata).toBeDefined();
  });
});
