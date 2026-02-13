/**
 * Tipos de Geocoding para Carta Astral
 *
 * Define las interfaces TypeScript para la búsqueda y selección
 * de lugares de nacimiento mediante geocoding.
 */

/**
 * Lugar geocodificado
 */
export interface GeocodedPlace {
  placeId: string;
  displayName: string;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

/**
 * Respuesta de búsqueda de lugares
 */
export interface GeocodeSearchResponse {
  results: GeocodedPlace[];
  count: number;
}
