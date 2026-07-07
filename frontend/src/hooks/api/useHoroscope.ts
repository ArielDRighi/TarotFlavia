/**
 * Horoscope Hooks
 *
 * Custom React Query hooks para consultar horóscopos diarios
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getTodayAllHoroscopes,
  getTodayHoroscope,
  getMySignHoroscope,
} from '@/lib/api/horoscope-api';
import type { ZodiacSign } from '@/types/horoscope.types';

/**
 * Estados de error tipados para `useMySignHoroscope`.
 *
 * - `no-birthdate`: el backend respondió 400 porque el usuario no tiene
 *   fecha de nacimiento configurada → mostrar CTA a `/perfil`.
 * - `not-generated`: el backend respondió 404 porque el horóscopo del día
 *   para el signo del usuario todavía no fue generado → mostrar mensaje
 *   "se está preparando".
 * - `error`: cualquier otro error (5xx, red, desconocido) → mostrar
 *   mensaje de error genérico con opción de reintentar.
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

/**
 * Query keys para horóscopos
 * Organizados jerárquicamente para facilitar invalidaciones
 */
export const horoscopeQueryKeys = {
  all: ['horoscope'] as const,
  todayAll: () => [...horoscopeQueryKeys.all, 'today', 'all'] as const,
  todaySign: (sign: ZodiacSign) => [...horoscopeQueryKeys.all, 'today', sign] as const,
  mySign: () => [...horoscopeQueryKeys.all, 'my-sign'] as const,
} as const;

/**
 * Hook para obtener todos los horóscopos de hoy
 *
 * @example
 * ```tsx
 * function HoroscopeList() {
 *   const { data, isLoading, error } = useTodayAllHoroscopes();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error />;
 *
 *   return data.map(h => <HoroscopeCard key={h.id} horoscope={h} />);
 * }
 * ```
 */
export function useTodayAllHoroscopes() {
  return useQuery({
    queryKey: horoscopeQueryKeys.todayAll(),
    queryFn: getTodayAllHoroscopes,
    staleTime: 1000 * 60 * 60, // 1 hora - el horóscopo no cambia durante el día
  });
}

/**
 * Hook para obtener el horóscopo de un signo específico para hoy
 *
 * @param sign - Signo zodiacal (requerido, no nullable)
 *
 * @example
 * ```tsx
 * function HoroscopeDetail({ sign }: { sign: ZodiacSign | null }) {
 *   // El componente maneja el caso null antes de llamar al hook
 *   if (!sign) return <SelectSign />;
 *
 *   const { data, isLoading, error } = useTodayHoroscope(sign);
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error />;
 *
 *   return <HoroscopeCard horoscope={data} />;
 * }
 * ```
 */
export function useTodayHoroscope(sign: ZodiacSign) {
  return useQuery({
    queryKey: horoscopeQueryKeys.todaySign(sign),
    queryFn: () => getTodayHoroscope(sign),
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener el horóscopo del usuario autenticado
 * basado en su fecha de nacimiento.
 *
 * Retorna además `errorState` que diferencia los distintos motivos de
 * fallo (ver {@link MySignHoroscopeErrorState}) para que los componentes
 * no confundan "fecha no configurada" con "horóscopo no generado" o
 * con un error transitorio.
 *
 * Política de reintentos:
 * - 400 / 404 (cualquier 4xx) → NO reintenta (es un error legítimo).
 * - 5xx, red u otros → reintenta hasta 2 veces.
 *
 * @example
 * ```tsx
 * function MyHoroscope() {
 *   const { data, isLoading, errorState, refetch } = useMySignHoroscope();
 *
 *   if (isLoading) return <Spinner />;
 *   if (errorState === 'no-birthdate') return <ConfigureBirthDate />;
 *   if (errorState === 'not-generated') return <PreparingMessage />;
 *   if (errorState === 'error') return <ErrorWithRetry onRetry={refetch} />;
 *
 *   return <HoroscopeCard horoscope={data!} />;
 * }
 * ```
 */
export function useMySignHoroscope() {
  const query = useQuery({
    queryKey: horoscopeQueryKeys.mySign(),
    queryFn: getMySignHoroscope,
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: (failureCount, error) => {
      const status = getHttpStatus(error);
      // 4xx (400 sin birthDate, 404 sin generar, etc.) → no reintentar
      if (status !== undefined && status >= 400 && status < 500) {
        return false;
      }
      // 5xx / red / desconocido → hasta 2 reintentos
      return failureCount < 2;
    },
  });

  let errorState: MySignHoroscopeErrorState | null = null;
  if (query.error) {
    const status = getHttpStatus(query.error);
    if (status === 400) {
      errorState = 'no-birthdate';
    } else if (status === 404) {
      errorState = 'not-generated';
    } else {
      errorState = 'error';
    }
  }

  return { ...query, errorState };
}
