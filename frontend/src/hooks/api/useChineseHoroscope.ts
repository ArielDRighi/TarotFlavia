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
  getChineseHoroscope,
} from '@/lib/api/chinese-horoscope-api';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

export const chineseHoroscopeKeys = {
  all: ['chinese-horoscope'] as const,
  myAnimal: (year?: number) => [...chineseHoroscopeKeys.all, 'my', year] as const,
  byYear: (year: number) => [...chineseHoroscopeKeys.all, year] as const,
  byAnimal: (year: number, animal: ChineseZodiacAnimal) =>
    [...chineseHoroscopeKeys.all, year, animal] as const,
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
 */
export function useMyAnimalHoroscope(year?: number) {
  return useQuery({
    queryKey: chineseHoroscopeKeys.myAnimal(year),
    queryFn: () => getMyAnimalHoroscope(year),
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (es anual)
    retry: false,
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
 * Hook para obtener un horóscopo chino específico
 * @param year Año del horóscopo
 * @param animal Animal del zodiaco
 */
export function useChineseHoroscope(year: number, animal: ChineseZodiacAnimal | null) {
  return useQuery({
    queryKey: chineseHoroscopeKeys.byAnimal(year, animal!),
    queryFn: () => getChineseHoroscope(year, animal!),
    enabled: !!animal,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas
  });
}
