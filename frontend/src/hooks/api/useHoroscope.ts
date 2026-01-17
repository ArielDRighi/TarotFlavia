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
 * @param sign - Signo zodiacal (puede ser null para deshabilitar la query)
 *
 * @example
 * ```tsx
 * function HoroscopeDetail({ sign }: { sign: ZodiacSign }) {
 *   const { data, isLoading, error } = useTodayHoroscope(sign);
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <Error />;
 *
 *   return <HoroscopeCard horoscope={data} />;
 * }
 * ```
 */
export function useTodayHoroscope(sign: ZodiacSign | null) {
  return useQuery({
    queryKey: horoscopeQueryKeys.todaySign(sign!),
    queryFn: () => getTodayHoroscope(sign!),
    enabled: !!sign, // Solo ejecutar si hay un signo
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}

/**
 * Hook para obtener el horóscopo del usuario autenticado
 * basado en su fecha de nacimiento
 *
 * IMPORTANTE: Este hook puede fallar si el usuario no tiene configurada
 * su fecha de nacimiento. Por eso retry está deshabilitado.
 *
 * @example
 * ```tsx
 * function MyHoroscope() {
 *   const { data, isLoading, error } = useMySignHoroscope();
 *
 *   if (isLoading) return <Spinner />;
 *   if (error) return <ConfigureBirthDate />;
 *
 *   return <HoroscopeCard horoscope={data} />;
 * }
 * ```
 */
export function useMySignHoroscope() {
  return useQuery({
    queryKey: horoscopeQueryKeys.mySign(),
    queryFn: getMySignHoroscope,
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: false, // No reintentar si falla (probablemente por falta de birthDate)
  });
}
