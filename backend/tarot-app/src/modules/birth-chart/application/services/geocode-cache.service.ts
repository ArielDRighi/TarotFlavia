import { Injectable, Inject, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GeocodedPlaceDto } from '../../application/dto/geocode-response.dto';

/**
 * Servicio de caché para geocodificación
 *
 * Gestiona el almacenamiento en caché de:
 * - Resultados de búsqueda de lugares (7 días TTL)
 * - Detalles de lugar específico (30 días TTL)
 * - Zonas horarias por coordenadas (1 año TTL)
 *
 * Utiliza el sistema de caché existente de NestJS (@nestjs/cache-manager)
 * para evitar llamadas repetidas a APIs externas (Nominatim, TimeZoneDB).
 *
 * @example
 * // Verificar si existe búsqueda en caché
 * const cached = await service.getSearchResults('Buenos Aires');
 * if (cached) {
 *   return cached;
 * }
 *
 * // Guardar resultados en caché
 * await service.setSearchResults('Buenos Aires', results);
 */
@Injectable()
export class GeocodeCacheService {
  private readonly logger = new Logger(GeocodeCacheService.name);

  // TTL para diferentes tipos de caché
  private readonly SEARCH_RESULTS_TTL = 7 * 24 * 60 * 60 * 1000; // 7 días
  private readonly PLACE_DETAILS_TTL = 30 * 24 * 60 * 60 * 1000; // 30 días
  private readonly TIMEZONE_TTL = 365 * 24 * 60 * 60 * 1000; // 1 año

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  /**
   * Obtiene resultados de búsqueda desde caché
   */
  async getSearchResults(query: string): Promise<GeocodedPlaceDto[] | null> {
    const key = `geocode:search:${this.normalizeQuery(query)}`;
    const cached = await this.cacheManager.get<GeocodedPlaceDto[]>(key);

    if (cached) {
      this.logger.debug(`Cache hit for search: ${query}`);
      return cached;
    }

    this.logger.debug(`Cache miss for search: ${query}`);
    return null;
  }

  /**
   * Guarda resultados de búsqueda en caché
   */
  async setSearchResults(
    query: string,
    results: GeocodedPlaceDto[],
  ): Promise<void> {
    const key = `geocode:search:${this.normalizeQuery(query)}`;
    await this.cacheManager.set(key, results, this.SEARCH_RESULTS_TTL);
    this.logger.debug(`Cached search results for: ${query}`);
  }

  /**
   * Obtiene detalles de un lugar específico desde caché (reverse geocoding)
   */
  async getPlaceDetails(coordKey: string): Promise<GeocodedPlaceDto | null> {
    const key = `geocode:place:${coordKey}`;
    const cached = await this.cacheManager.get<GeocodedPlaceDto>(key);

    if (cached) {
      this.logger.debug(`Cache hit for place details: ${coordKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for place details: ${coordKey}`);
    return null;
  }

  /**
   * Guarda detalles de un lugar en caché (reverse geocoding)
   */
  async setPlaceDetails(
    coordKey: string,
    place: GeocodedPlaceDto,
  ): Promise<void> {
    const key = `geocode:place:${coordKey}`;
    await this.cacheManager.set(key, place, this.PLACE_DETAILS_TTL);
    this.logger.debug(`Cached place details: ${coordKey}`);
  }

  /**
   * Obtiene timezone desde caché por coordenadas
   */
  async getTimezone(coordKey: string): Promise<string | null> {
    const key = `geocode:tz:${coordKey}`;
    const cached = await this.cacheManager.get<string>(key);

    if (cached) {
      this.logger.debug(`Cache hit for timezone: ${coordKey}`);
      return cached;
    }

    this.logger.debug(`Cache miss for timezone: ${coordKey}`);
    return null;
  }

  /**
   * Guarda timezone en caché
   */
  async setTimezone(coordKey: string, timezone: string): Promise<void> {
    const key = `geocode:tz:${coordKey}`;
    await this.cacheManager.set(key, timezone, this.TIMEZONE_TTL);
    this.logger.debug(`Cached timezone: ${coordKey} -> ${timezone}`);
  }

  /**
   * Normaliza query para usar como clave de caché
   * - Convierte a minúsculas
   * - Elimina espacios al inicio/final
   * - Reemplaza múltiples espacios por guión bajo
   */
  private normalizeQuery(query: string): string {
    return query.toLowerCase().trim().replace(/\s+/g, '_');
  }
}
