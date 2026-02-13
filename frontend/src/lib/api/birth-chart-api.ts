/**
 * Birth Chart API Functions
 *
 * Funciones para interactuar con el API de Carta Astral.
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { GeocodeSearchResponse } from '@/types/birth-chart-geocode.types';

/**
 * Busca lugares por nombre para geocoding
 *
 * @param query - Texto de búsqueda (mínimo 3 caracteres)
 * @returns Listado de lugares encontrados con coordenadas
 */
export async function searchPlaces(query: string): Promise<GeocodeSearchResponse> {
  const response = await apiClient.get<GeocodeSearchResponse>(API_ENDPOINTS.BIRTH_CHART.GEOCODE, {
    params: { query },
  });

  return response.data;
}
