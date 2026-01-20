/**
 * Chinese Horoscope Hooks
 *
 * React Query hooks para el horóscopo chino (anual)
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import {
  calculateAnimal,
  getMyAnimalHoroscope,
  getChineseHoroscopesByYear,
  getChineseHoroscopeByElement,
} from '@/lib/api/chinese-horoscope-api';
import type { ChineseZodiacAnimal, ChineseElementCode } from '@/types/chinese-horoscope.types';

export const chineseHoroscopeKeys = {
  all: ['chinese-horoscope'] as const,
  myAnimal: (year?: number) => [...chineseHoroscopeKeys.all, 'my', year] as const,
  byYear: (year: number) => [...chineseHoroscopeKeys.all, year] as const,
  byAnimalElement: (year: number, animal: ChineseZodiacAnimal, element: ChineseElementCode) =>
    [...chineseHoroscopeKeys.all, year, animal, element] as const,
  calculate: (birthDate: string) => [...chineseHoroscopeKeys.all, 'calculate', birthDate] as const,
} as const;

/**
 * Hook para calcular el animal del zodiaco chino
 * @param birthDate Fecha de nacimiento en formato YYYY-MM-DD
 */
export function useCalculateAnimal(birthDate: string | null) {
  return useQuery({
    queryKey: chineseHoroscopeKeys.calculate(birthDate || ''),
    queryFn: () => calculateAnimal(birthDate!),
    enabled: !!birthDate,
    staleTime: Infinity, // El animal nunca cambia
  });
}

/**
 * Hook para obtener el horóscopo chino del usuario autenticado
 * @param year Año del horóscopo (opcional)
 * @param options Opciones del hook (enabled para habilitar/deshabilitar la query)
 */
export function useMyAnimalHoroscope(year?: number, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: chineseHoroscopeKeys.myAnimal(year),
    queryFn: () => getMyAnimalHoroscope(year),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (es anual)
    retry: false,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Hook para obtener todos los horóscopos chinos de un año
 * @param year Año del horóscopo
 */
export function useChineseHoroscopesByYear(year: number) {
  return useQuery({
    queryKey: chineseHoroscopeKeys.byYear(year),
    queryFn: () => getChineseHoroscopesByYear(year),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}

/**
 * Hook para obtener un horóscopo chino por animal y elemento
 * @param year Año del horóscopo
 * @param animal Animal del zodiaco
 * @param element Elemento Wu Xing
 */
export function useChineseHoroscopeByElement(
  year: number,
  animal: ChineseZodiacAnimal | null,
  element: ChineseElementCode | null
) {
  return useQuery({
    queryKey: chineseHoroscopeKeys.byAnimalElement(year, animal!, element!),
    queryFn: () => getChineseHoroscopeByElement(year, animal!, element!),
    enabled: !!animal && !!element,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
