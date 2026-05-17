/**
 * Admin Chinese Horoscope Hooks
 *
 * React Query hooks para gestionar el estado de generación del horóscopo chino.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getChineseHoroscopeAdminStatus,
  generateMissingChineseHoroscopes,
} from '@/lib/api/admin-chinese-horoscope-api';
import type {
  ChineseHoroscopeYearStatus,
  GenerateMissingResponse,
} from '@/types/admin-chinese-horoscope.types';

const QUERY_KEY = (year: number) => ['admin', 'chinese-horoscope', 'status', year] as const;

/** Intervalo de polling mientras se está generando (30 segundos) */
const POLLING_INTERVAL_MS = 30_000;

interface UseChineseHoroscopeAdminStatusOptions {
  /** Activar polling automático (útil durante la generación) */
  pollingEnabled?: boolean;
}

/**
 * Obtiene el estado de generación de horóscopos chinos para un año.
 * Soporta polling automático para reflejar el progreso de generación.
 */
export function useChineseHoroscopeAdminStatus(
  year: number,
  options: UseChineseHoroscopeAdminStatusOptions = {}
) {
  const { pollingEnabled = true } = options;

  return useQuery<ChineseHoroscopeYearStatus>({
    queryKey: QUERY_KEY(year),
    queryFn: () => getChineseHoroscopeAdminStatus(year),
    enabled: pollingEnabled,
    refetchInterval: pollingEnabled ? POLLING_INTERVAL_MS : false,
  });
}

/**
 * Dispara la generación de horóscopos chinos faltantes para un año.
 * El backend responde inmediatamente (fire-and-forget).
 * Al completar, invalida la query de status para refrescar el contador.
 */
export function useGenerateMissingChineseHoroscopes() {
  const queryClient = useQueryClient();

  return useMutation<GenerateMissingResponse, Error, number>({
    mutationFn: (year: number) => generateMissingChineseHoroscopes(year),
    onSuccess: (_data, year) => {
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY(year) });
    },
  });
}
