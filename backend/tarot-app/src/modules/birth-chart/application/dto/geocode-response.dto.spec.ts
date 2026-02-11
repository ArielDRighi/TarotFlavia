import { plainToInstance } from 'class-transformer';
import {
  GeocodedPlaceDto,
  GeocodeSearchResponseDto,
} from './geocode-response.dto';

describe('Geocode Response DTOs', () => {
  describe('GeocodedPlaceDto', () => {
    it('should create a valid GeocodedPlaceDto', () => {
      const input = {
        placeId: 'ChIJZ4a1ZWzKvJUR9BPHX7NLzzs',
        displayName: 'Buenos Aires, Argentina',
        city: 'Buenos Aires',
        country: 'Argentina',
        latitude: -34.6037,
        longitude: -58.3816,
        timezone: 'America/Argentina/Buenos_Aires',
      };

      const dto = plainToInstance(GeocodedPlaceDto, input);

      expect(dto).toBeDefined();
      expect(dto.placeId).toBe('ChIJZ4a1ZWzKvJUR9BPHX7NLzzs');
      expect(dto.displayName).toBe('Buenos Aires, Argentina');
      expect(dto.city).toBe('Buenos Aires');
      expect(dto.country).toBe('Argentina');
      expect(dto.latitude).toBe(-34.6037);
      expect(dto.longitude).toBe(-58.3816);
      expect(dto.timezone).toBe('America/Argentina/Buenos_Aires');
    });

    it('should handle places with complex names', () => {
      const input = {
        placeId: 'abc123',
        displayName: 'São Paulo, Estado de São Paulo, Brasil',
        city: 'São Paulo',
        country: 'Brasil',
        latitude: -23.5505,
        longitude: -46.6333,
        timezone: 'America/Sao_Paulo',
      };

      const dto = plainToInstance(GeocodedPlaceDto, input);

      expect(dto.displayName).toBe('São Paulo, Estado de São Paulo, Brasil');
      expect(dto.city).toBe('São Paulo');
    });

    it('should handle coordinates at various locations', () => {
      // North Pole
      const northPole = plainToInstance(GeocodedPlaceDto, {
        placeId: 'np',
        displayName: 'North Pole',
        city: 'North Pole',
        country: 'Arctic',
        latitude: 90,
        longitude: 0,
        timezone: 'UTC',
      });

      expect(northPole.latitude).toBe(90);

      // Equator
      const equator = plainToInstance(GeocodedPlaceDto, {
        placeId: 'eq',
        displayName: 'Quito, Ecuador',
        city: 'Quito',
        country: 'Ecuador',
        latitude: 0,
        longitude: -78.5,
        timezone: 'America/Guayaquil',
      });

      expect(equator.latitude).toBe(0);

      // International Date Line
      const dateLine = plainToInstance(GeocodedPlaceDto, {
        placeId: 'dl',
        displayName: 'Fiji',
        city: 'Suva',
        country: 'Fiji',
        latitude: -18.1416,
        longitude: 180,
        timezone: 'Pacific/Fiji',
      });

      expect(dateLine.longitude).toBe(180);
    });
  });

  describe('GeocodeSearchResponseDto', () => {
    it('should create a valid GeocodeSearchResponseDto', () => {
      const input = {
        results: [
          {
            placeId: 'place1',
            displayName: 'Buenos Aires, Argentina',
            city: 'Buenos Aires',
            country: 'Argentina',
            latitude: -34.6037,
            longitude: -58.3816,
            timezone: 'America/Argentina/Buenos_Aires',
          },
          {
            placeId: 'place2',
            displayName: 'Buenos Aires, Costa Rica',
            city: 'Buenos Aires',
            country: 'Costa Rica',
            latitude: 9.1645,
            longitude: -83.3303,
            timezone: 'America/Costa_Rica',
          },
        ],
        count: 2,
      };

      const dto = plainToInstance(GeocodeSearchResponseDto, input);

      expect(dto).toBeDefined();
      expect(dto.results).toHaveLength(2);
      expect(dto.count).toBe(2);
      expect(dto.results[0].city).toBe('Buenos Aires');
      expect(dto.results[1].country).toBe('Costa Rica');
    });

    it('should handle empty search results', () => {
      const input = {
        results: [],
        count: 0,
      };

      const dto = plainToInstance(GeocodeSearchResponseDto, input);

      expect(dto.results).toHaveLength(0);
      expect(dto.count).toBe(0);
    });

    it('should handle single result', () => {
      const input = {
        results: [
          {
            placeId: 'unique',
            displayName: 'Ciudad de México, México',
            city: 'Ciudad de México',
            country: 'México',
            latitude: 19.4326,
            longitude: -99.1332,
            timezone: 'America/Mexico_City',
          },
        ],
        count: 1,
      };

      const dto = plainToInstance(GeocodeSearchResponseDto, input);

      expect(dto.results).toHaveLength(1);
      expect(dto.count).toBe(1);
    });

    it('should handle many results', () => {
      const results = Array.from({ length: 20 }, (_, i) => ({
        placeId: `place${i}`,
        displayName: `City ${i}, Country`,
        city: `City ${i}`,
        country: 'Country',
        latitude: i * 1.0,
        longitude: i * -1.0,
        timezone: 'UTC',
      }));

      const input = {
        results,
        count: 20,
      };

      const dto = plainToInstance(GeocodeSearchResponseDto, input);

      expect(dto.results).toHaveLength(20);
      expect(dto.count).toBe(20);
    });
  });
});
