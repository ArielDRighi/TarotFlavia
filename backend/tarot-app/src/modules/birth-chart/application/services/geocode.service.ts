import { Injectable } from '@nestjs/common';
import {
  GeocodeSearchResponseDto,
  GeocodedPlaceDto,
} from '../dto/geocode-response.dto';

const GEOCODE_CATALOG: ReadonlyArray<GeocodedPlaceDto> = [
  {
    placeId: 'ar-buenos-aires',
    displayName: 'Buenos Aires, Argentina',
    city: 'Buenos Aires',
    country: 'Argentina',
    latitude: -34.6037,
    longitude: -58.3816,
    timezone: 'America/Argentina/Buenos_Aires',
  },
  {
    placeId: 'es-madrid',
    displayName: 'Madrid, España',
    city: 'Madrid',
    country: 'España',
    latitude: 40.4168,
    longitude: -3.7038,
    timezone: 'Europe/Madrid',
  },
  {
    placeId: 'mx-ciudad-de-mexico',
    displayName: 'Ciudad de México, México',
    city: 'Ciudad de México',
    country: 'México',
    latitude: 19.4326,
    longitude: -99.1332,
    timezone: 'America/Mexico_City',
  },
  {
    placeId: 'co-bogota',
    displayName: 'Bogotá, Colombia',
    city: 'Bogotá',
    country: 'Colombia',
    latitude: 4.711,
    longitude: -74.0721,
    timezone: 'America/Bogota',
  },
  {
    placeId: 'cl-santiago',
    displayName: 'Santiago, Chile',
    city: 'Santiago',
    country: 'Chile',
    latitude: -33.4489,
    longitude: -70.6693,
    timezone: 'America/Santiago',
  },
];

@Injectable()
export class GeocodeService {
  searchPlaces(query: string): GeocodeSearchResponseDto {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return { results: [], count: 0 };
    }

    const results = GEOCODE_CATALOG.filter((item) =>
      `${item.displayName} ${item.city} ${item.country}`
        .toLowerCase()
        .includes(normalizedQuery),
    );

    return {
      results,
      count: results.length,
    };
  }
}
