import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { GeocodeCacheService } from './geocode-cache.service';
import {
  GeocodeSearchResponseDto,
  GeocodedPlaceDto,
} from '../dto/geocode-response.dto';

interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: string[];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
    country_code?: string;
  };
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: {
    osm_id: number;
    osm_type: string;
    name: string;
    country?: string;
    state?: string;
    city?: string;
    type?: string;
  };
}

interface PhotonFeatureCollection {
  features: PhotonFeature[];
}

interface TimezoneDBResult {
  status: string;
  message?: string;
  zoneName?: string;
  abbreviation?: string;
  gmtOffset?: number;
}

/**
 * Servicio de Geocodificación
 *
 * Convierte nombres de lugares en coordenadas geográficas (latitud, longitud)
 * y obtiene la zona horaria correspondiente, necesario para calcular cartas astrales precisas.
 *
 * Características:
 * - Busca lugares usando Photon (Komoot) como fuente primaria — Gratis, sin API key
 * - Fallback automático a Nominatim (OpenStreetMap) si Photon falla
 * - Obtiene timezone usando TimeZoneDB (opcional, con fallback por longitud)
 * - Rate limiting: Nominatim requiere máximo 1 request/segundo
 * - Caché robusto: búsquedas 7 días, lugares 30 días, timezones 1 año
 *
 * @example
 * // Buscar lugares
 * const results = await service.searchPlaces('Buenos Aires');
 * // Obtener timezone
 * const tz = await service.getTimezone(-34.6037, -58.3816);
 */
@Injectable()
export class GeocodeService {
  private readonly logger = new Logger(GeocodeService.name);

  // URLs de APIs
  private readonly PHOTON_URL = 'https://photon.komoot.io/api/';
  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';
  private readonly TIMEZONEDB_URL =
    'http://api.timezonedb.com/v2.1/get-time-zone';

  /**
   * Rate limiting Nominatim: máximo 1 request/segundo.
   *
   * IMPORTANTE (MVP / single-instance):
   * - Este rate limit es solo en memoria y por proceso (un singleton de NestJS).
   *   Si se ejecutan múltiples instancias del backend (horizontal scaling),
   *   cada una mantiene su propio estado y el tráfico agregado puede exceder
   *   el límite global de Nominatim (1 req/seg).
   * - La actualización de este timestamp no es atómica: múltiples requests
   *   concurrentes en la misma instancia podrían acercarse demasiado entre sí.
   *
   * Antes de escalar a múltiples instancias, reemplazar este mecanismo por
   * un rate limiter distribuido (por ejemplo, usando Redis o similar) o una
   * librería de rate limiting que soporte locks distribuidos.
   */
  private lastNominatimRequest = 0;
  private readonly NOMINATIM_RATE_LIMIT_MS = 1100; // 1.1 segundos

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly cacheService: GeocodeCacheService,
  ) {}

  /**
   * Busca lugares por texto.
   *
   * Estrategia híbrida:
   * 1. Verifica caché primero
   * 2. Intenta Photon (Komoot) — mejor cobertura de localidades pequeñas, sin duplicados
   * 3. Si Photon falla, hace fallback automático a Nominatim (OSM)
   */
  async searchPlaces(query: string): Promise<GeocodeSearchResponseDto> {
    this.logger.debug(`Searching places for: ${query}`);

    // Verificar caché
    const cached = await this.cacheService.getSearchResults(query);
    if (cached) {
      this.logger.debug('Returning cached search results');
      return {
        results: cached,
        count: cached.length,
      };
    }

    try {
      return await this.searchWithPhoton(query);
    } catch (photonError) {
      const photonErr = photonError as Error;
      this.logger.warn(
        `Photon geocoding failed, using Nominatim fallback: ${photonErr.message}`,
      );
      return await this.searchWithNominatim(query);
    }
  }

  /**
   * Busca lugares usando Photon (Komoot) como fuente primaria.
   *
   * Photon utiliza los mismos datos OSM pero con Elasticsearch,
   * ofreciendo mejor cobertura, sin duplicados y soporte de acentos.
   * Es completamente gratuito y no requiere API key.
   *
   * @see https://photon.komoot.io/
   */
  private async searchWithPhoton(
    query: string,
  ): Promise<GeocodeSearchResponseDto> {
    const response = await firstValueFrom(
      this.httpService.get<PhotonFeatureCollection>(this.PHOTON_URL, {
        params: {
          q: query,
          lang: 'es',
          limit: 5,
        },
        headers: {
          'User-Agent': 'Auguria/1.0 (contact@auguria.com)',
        },
      }),
    );

    const results: GeocodedPlaceDto[] = await Promise.all(
      response.data.features.map(async (feature) => {
        const longitude = feature.geometry.coordinates[0];
        const latitude = feature.geometry.coordinates[1];

        const timezone = await this.getTimezone(latitude, longitude);

        const displayName = this.buildPhotonDisplayName(feature.properties);

        return {
          placeId: `photon_${feature.properties.osm_type}_${feature.properties.osm_id}`,
          displayName,
          city: feature.properties.name,
          country: feature.properties.country ?? '',
          latitude,
          longitude,
          timezone,
        };
      }),
    );

    const responseDto: GeocodeSearchResponseDto = {
      results,
      count: results.length,
    };

    await this.cacheService.setSearchResults(query, results);

    return responseDto;
  }

  /**
   * Busca lugares usando Nominatim (OpenStreetMap) como fuente de fallback.
   *
   * Se invoca automáticamente cuando Photon no está disponible.
   * Aplica rate limiting (máximo 1 req/seg) según la política de uso de Nominatim.
   */
  private async searchWithNominatim(
    query: string,
  ): Promise<GeocodeSearchResponseDto> {
    // Rate limiting
    await this.waitForRateLimit();

    try {
      const response = await firstValueFrom(
        this.httpService.get<NominatimResult[]>(this.NOMINATIM_URL, {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 5,
            'accept-language': 'es',
          },
          headers: {
            'User-Agent': 'Auguria/1.0 (contact@auguria.com)', // Requerido por Nominatim
          },
        }),
      );

      const results: GeocodedPlaceDto[] = await Promise.all(
        response.data.map(async (result) => {
          const latitude = parseFloat(result.lat);
          const longitude = parseFloat(result.lon);

          const timezone = await this.getTimezone(latitude, longitude);

          return {
            placeId: `osm_${result.osm_type}_${result.osm_id}`,
            displayName: result.display_name,
            city: this.extractCity(result.address),
            country: result.address?.country ?? '',
            latitude,
            longitude,
            timezone,
          };
        }),
      );

      const responseDto: GeocodeSearchResponseDto = {
        results,
        count: results.length,
      };

      await this.cacheService.setSearchResults(query, results);

      return responseDto;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error searching places for query "${query}": ${err.message}`,
        err.stack,
      );
      throw new Error('No se pudo buscar el lugar. Intente de nuevo.', {
        cause: err,
      });
    }
  }

  /**
   * Obtiene la zona horaria para unas coordenadas
   */
  async getTimezone(latitude: number, longitude: number): Promise<string> {
    // Usamos 4 decimales (~11m) para evitar colisiones cerca de fronteras de zona horaria
    const coordKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // Verificar caché
    const cached = await this.cacheService.getTimezone(coordKey);
    if (cached) {
      return cached;
    }

    const apiKey = this.configService.get<string>('TIMEZONEDB_API_KEY');

    if (!apiKey) {
      // Fallback: estimar timezone por longitud (muy impreciso pero funcional)
      this.logger.warn('No TIMEZONEDB_API_KEY configured, using fallback');
      const timezone = this.estimateTimezoneByLongitude(longitude);
      await this.cacheService.setTimezone(coordKey, timezone);
      return timezone;
    }

    try {
      const response = await firstValueFrom(
        this.httpService.get<TimezoneDBResult>(this.TIMEZONEDB_URL, {
          params: {
            key: apiKey,
            format: 'json',
            by: 'position',
            lat: latitude,
            lng: longitude,
          },
        }),
      );

      if (response.data.status === 'OK' && response.data.zoneName) {
        await this.cacheService.setTimezone(coordKey, response.data.zoneName);
        return response.data.zoneName;
      }

      throw new Error(response.data.message ?? 'Unknown error');
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting timezone for coordinates (${latitude}, ${longitude}): ${err.message}`,
        err.stack,
      );
      const fallbackTimezone = this.estimateTimezoneByLongitude(longitude);
      await this.cacheService.setTimezone(coordKey, fallbackTimezone);
      return fallbackTimezone;
    }
  }

  /**
   * Obtiene detalles de un lugar específico por coordenadas (reverse geocoding)
   */
  async getPlaceDetails(
    latitude: number,
    longitude: number,
  ): Promise<GeocodedPlaceDto | null> {
    // Usamos 4 decimales (~11m) para precisión en el cache key
    const coordKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;

    // Verificar caché
    const cached = await this.cacheService.getPlaceDetails(coordKey);
    if (cached) {
      this.logger.debug('Returning cached place details');
      return cached;
    }

    // Rate limiting
    await this.waitForRateLimit();

    try {
      const response = await firstValueFrom(
        this.httpService.get<NominatimResult>(
          'https://nominatim.openstreetmap.org/reverse',
          {
            params: {
              lat: latitude,
              lon: longitude,
              format: 'json',
              addressdetails: 1,
              'accept-language': 'es',
            },
            headers: {
              'User-Agent': 'Auguria/1.0 (contact@auguria.com)',
            },
          },
        ),
      );

      const result = response.data;
      const timezone = await this.getTimezone(latitude, longitude);

      const place: GeocodedPlaceDto = {
        placeId: `osm_${result.osm_type}_${result.osm_id}`,
        displayName: result.display_name,
        city: this.extractCity(result.address),
        country: result.address?.country ?? '',
        latitude,
        longitude,
        timezone,
      };

      // Guardar en caché
      await this.cacheService.setPlaceDetails(coordKey, place);

      return place;
    } catch (error) {
      const err = error as Error;
      this.logger.error(
        `Error getting place details for coordinates (${latitude}, ${longitude}): ${err.message}`,
        err.stack,
      );
      return null;
    }
  }

  /**
   * Construye el displayName a partir de las propiedades de un feature de Photon.
   *
   * Photon no devuelve un campo display_name listo, por lo que se construye
   * manualmente concatenando name + state (si existe) + country (si existe).
   */
  private buildPhotonDisplayName(
    properties: PhotonFeature['properties'],
  ): string {
    const parts: string[] = [properties.name];
    if (properties.state) {
      parts.push(properties.state);
    }
    if (properties.country) {
      parts.push(properties.country);
    }
    return parts.join(', ');
  }

  /**
   * Extrae la ciudad del objeto address de Nominatim
   */
  private extractCity(address?: NominatimResult['address']): string {
    if (!address) return '';
    return (
      address.city ??
      address.town ??
      address.village ??
      address.municipality ??
      ''
    );
  }

  /**
   * Estima timezone por longitud (fallback muy básico)
   *
   * Cada 15 grados de longitud = 1 hora de diferencia con UTC
   * Nota: Este es un fallback muy impreciso. Úsalo solo cuando TimeZoneDB no esté disponible.
   */
  private estimateTimezoneByLongitude(longitude: number): string {
    // Cada 15 grados de longitud = 1 hora de diferencia con UTC
    const offsetHours = Math.round(longitude / 15);

    if (offsetHours === 0) return 'UTC';
    if (offsetHours > 0) return `Etc/GMT-${offsetHours}`;
    return `Etc/GMT+${Math.abs(offsetHours)}`;
  }

  /**
   * Rate limiting para Nominatim
   *
   * Nominatim policy requires max 1 request per second
   * https://operations.osmfoundation.org/policies/nominatim/
   */
  private async waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastNominatimRequest;

    if (timeSinceLastRequest < this.NOMINATIM_RATE_LIMIT_MS) {
      const waitTime = this.NOMINATIM_RATE_LIMIT_MS - timeSinceLastRequest;
      this.logger.debug(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }

    this.lastNominatimRequest = Date.now();
  }
}
