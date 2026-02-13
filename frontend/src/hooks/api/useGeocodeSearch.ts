/**
 * Geocode Search Hook
 *
 * Hook para buscar ubicaciones con geocodificación (con debounce)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/utils/useDebounce';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import type { GeocodeSearchResponse } from '@/types/birth-chart-geocode.types';

/**
 * Hook para buscar ubicaciones con debounce automático
 * @param query - Texto de búsqueda (mínimo 3 caracteres)
 * @param debounceMs - Tiempo de debounce en ms (por defecto 300ms)
 */
export function useGeocodeSearch(query: string, debounceMs = 300) {
  const debouncedQuery = useDebounce(query, debounceMs);

  return useQuery({
    queryKey: ['geocode', debouncedQuery],
    queryFn: async () => {
      const response = await apiClient.get<GeocodeSearchResponse>(
        API_ENDPOINTS.BIRTH_CHART.GEOCODE,
        { params: { query: debouncedQuery } }
      );
      return response.data;
    },
    enabled: debouncedQuery.length >= 3, // Solo buscar si hay 3+ caracteres
    staleTime: 1000 * 60 * 5, // 5 minutos (ubicaciones no cambian frecuentemente)
  });
}
