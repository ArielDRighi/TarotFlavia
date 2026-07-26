/**
 * Horoscope Hooks
 *
 * Custom React Query hooks para consultar horóscopos diarios.
 *
 * "Hoy" = el día calendario LOCAL del visitante (no el día UTC). El horóscopo
 * cambia a las 00:00 hora local y, mientras el del día nuevo todavía no fue
 * generado (el cron corre a las 06:00 UTC), se muestra el del día anterior como
 * fallback. Ver useLocalToday() para el rollover automático a medianoche local.
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { getHoroscopeByDate, getHoroscopeByDateAndSign } from '@/lib/api/horoscope-api';
import { useLocalToday } from '@/hooks/utils/useLocalToday';
import { shiftDateString } from '@/lib/utils/date';
import { useAuthStore } from '@/stores/authStore';
import { getZodiacSignFromDate } from '@/lib/utils/zodiac';
import type { ZodiacSign } from '@/types/horoscope.types';

/** El horóscopo del día no cambia una vez generado. */
const HOROSCOPE_STALE_TIME = 1000 * 60 * 60; // 1 hora

/**
 * Estados de error tipados para `useMyLocalSignHoroscope`.
 *
 * - `no-birthdate`: el usuario no tiene fecha de nacimiento configurada → CTA a `/perfil`.
 * - `not-generated`: el horóscopo del día (y el de ayer como fallback) todavía no
 *   fue generado para el signo del usuario → mostrar "se está preparando".
 * - `error`: cualquier otro error (5xx, red, desconocido) → mensaje genérico + retry.
 */
export type MySignHoroscopeErrorState = 'no-birthdate' | 'not-generated' | 'error';

/**
 * Extrae el HTTP status code de un error (tipo AxiosError) si existe.
 */
function getHttpStatus(error: unknown): number | undefined {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: unknown }).response;
    if (response && typeof response === 'object' && 'status' in response) {
      const status = (response as { status?: unknown }).status;
      if (typeof status === 'number') {
        return status;
      }
    }
  }
  return undefined;
}

/** No reintentar en 4xx (404 = no generado, error legítimo); sí en 5xx/red. */
function retryNon4xx(failureCount: number, error: unknown): boolean {
  const status = getHttpStatus(error);
  if (status !== undefined && status >= 400 && status < 500) {
    return false;
  }
  return failureCount < 2;
}

/**
 * Query keys para horóscopos. Scopeadas por FECHA para que cada día local viva
 * en su propia entrada de caché y el rollover a medianoche traiga datos nuevos.
 */
export const horoscopeQueryKeys = {
  all: ['horoscope'] as const,
  byDate: (date: string) => [...horoscopeQueryKeys.all, 'by-date', date] as const,
  byDateSign: (date: string, sign: ZodiacSign) =>
    [...horoscopeQueryKeys.all, 'by-date', date, sign] as const,
} as const;

/**
 * Hook para obtener todos los horóscopos del día LOCAL del visitante.
 * Si el día local aún no fue generado (respuesta vacía), cae al día anterior.
 */
export function useLocalDailyHoroscopes() {
  const today = useLocalToday();
  const yesterday = shiftDateString(today, -1);

  const todayQuery = useQuery({
    queryKey: horoscopeQueryKeys.byDate(today),
    queryFn: () => getHoroscopeByDate(today),
    staleTime: HOROSCOPE_STALE_TIME,
    retry: retryNon4xx,
  });

  const todayEmpty = todayQuery.isSuccess && (todayQuery.data?.length ?? 0) === 0;

  const yesterdayQuery = useQuery({
    queryKey: horoscopeQueryKeys.byDate(yesterday),
    queryFn: () => getHoroscopeByDate(yesterday),
    enabled: todayEmpty,
    staleTime: HOROSCOPE_STALE_TIME,
    retry: retryNon4xx,
  });

  const hasToday = (todayQuery.data?.length ?? 0) > 0;
  const data = hasToday ? todayQuery.data : todayEmpty ? yesterdayQuery.data : todayQuery.data;
  const isLoading = todayQuery.isLoading || (todayEmpty && yesterdayQuery.isLoading);
  const error = todayQuery.error ?? (todayEmpty ? yesterdayQuery.error : null);
  const isShowingPreviousDay = !hasToday && (yesterdayQuery.data?.length ?? 0) > 0;

  return { data, isLoading, error, isShowingPreviousDay };
}

/**
 * Hook para obtener el horóscopo de un signo específico para el día LOCAL.
 * Si el día local aún no fue generado (404), cae al día anterior.
 *
 * @param sign - Signo zodiacal, o null para deshabilitar la consulta.
 */
export function useLocalHoroscope(sign: ZodiacSign | null) {
  const today = useLocalToday();
  const yesterday = shiftDateString(today, -1);
  const enabled = sign !== null;
  // Placeholder key segment cuando no hay signo (la query está deshabilitada).
  const keySign = (sign ?? 'aries') as ZodiacSign;

  const todayQuery = useQuery({
    queryKey: horoscopeQueryKeys.byDateSign(today, keySign),
    queryFn: () => getHoroscopeByDateAndSign(today, sign as ZodiacSign),
    enabled,
    staleTime: HOROSCOPE_STALE_TIME,
    retry: retryNon4xx,
  });

  const todayNotGenerated = enabled && getHttpStatus(todayQuery.error) === 404;

  const yesterdayQuery = useQuery({
    queryKey: horoscopeQueryKeys.byDateSign(yesterday, keySign),
    queryFn: () => getHoroscopeByDateAndSign(yesterday, sign as ZodiacSign),
    enabled: enabled && todayNotGenerated,
    staleTime: HOROSCOPE_STALE_TIME,
    retry: retryNon4xx,
  });

  const data = todayQuery.data ?? (todayNotGenerated ? yesterdayQuery.data : undefined);
  const isLoading =
    enabled && (todayQuery.isLoading || (todayNotGenerated && yesterdayQuery.isLoading));

  // Error real solo si: hoy falló por algo que NO es 404, o hoy 404 y ayer también falló.
  let error: unknown = null;
  if (todayQuery.error && !todayNotGenerated) {
    error = todayQuery.error;
  } else if (todayNotGenerated && yesterdayQuery.error) {
    error = yesterdayQuery.error;
  }

  const isShowingPreviousDay = !todayQuery.data && todayNotGenerated && !!yesterdayQuery.data;

  return {
    data,
    isLoading,
    error,
    isShowingPreviousDay,
    refetch: todayQuery.refetch,
    isRefetching: todayQuery.isRefetching,
  };
}

/**
 * Hook para el horóscopo del usuario autenticado, para el día LOCAL.
 *
 * El signo se calcula en el cliente desde `birthDate` (igual que las páginas),
 * y se consulta por fecha local con fallback a ayer. Expone `errorState` para
 * diferenciar "sin fecha de nacimiento" de "no generado" y de errores reales.
 */
export function useMyLocalSignHoroscope() {
  const birthDate = useAuthStore((state) => state.user?.birthDate);
  const sign = birthDate ? getZodiacSignFromDate(new Date(birthDate)) : null;

  const query = useLocalHoroscope(sign);

  let errorState: MySignHoroscopeErrorState | null = null;
  if (!sign) {
    errorState = 'no-birthdate';
  } else if (query.error) {
    errorState = getHttpStatus(query.error) === 404 ? 'not-generated' : 'error';
  } else if (!query.isLoading && !query.data) {
    errorState = 'not-generated';
  }

  return { ...query, errorState };
}
