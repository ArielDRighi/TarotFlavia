/**
 * Numerology Hooks
 *
 * React Query hooks para interactuar con la API de numerología
 */

'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  calculateNumerology,
  getMyNumerologyProfile,
  generateNumerologyInterpretation,
  getAllNumerologyMeanings,
  getNumerologyMeaning,
  getDayNumber,
} from '@/lib/api/numerology-api';
import type { CalculateNumerologyRequest } from '@/types/numerology.types';

export const numerologyQueryKeys = {
  all: ['numerology'] as const,
  myProfile: () => [...numerologyQueryKeys.all, 'my-profile'] as const,
  meanings: () => [...numerologyQueryKeys.all, 'meanings'] as const,
  meaning: (num: number) => [...numerologyQueryKeys.all, 'meaning', num] as const,
  dayNumber: () => [...numerologyQueryKeys.all, 'day-number'] as const,
} as const;

/**
 * Hook para obtener mi perfil numerológico
 */
export function useMyNumerologyProfile() {
  return useQuery({
    queryKey: numerologyQueryKeys.myProfile(),
    queryFn: getMyNumerologyProfile,
    staleTime: 1000 * 60 * 60, // 1 hora
    retry: false,
  });
}

/**
 * Hook para calcular perfil (público)
 */
export function useCalculateNumerology() {
  return useMutation({
    mutationFn: (data: CalculateNumerologyRequest) => calculateNumerology(data),
  });
}

/**
 * Hook para generar interpretación IA
 */
export function useGenerateInterpretation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: generateNumerologyInterpretation,
    onSuccess: () => {
      // Invalidar el perfil para forzar un refetch con los datos correctos
      queryClient.invalidateQueries({
        queryKey: numerologyQueryKeys.myProfile(),
      });
    },
  });
}

/**
 * Hook para obtener todos los significados
 */
export function useNumerologyMeanings() {
  return useQuery({
    queryKey: numerologyQueryKeys.meanings(),
    queryFn: getAllNumerologyMeanings,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (no cambian)
  });
}

/**
 * Hook para obtener significado de un número
 */
export function useNumerologyMeaning(number: number | null) {
  return useQuery({
    queryKey: numerologyQueryKeys.meaning(number!),
    queryFn: () => getNumerologyMeaning(number!),
    enabled: number !== null && number > 0,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

/**
 * Hook para obtener número del día
 */
export function useDayNumber() {
  return useQuery({
    queryKey: numerologyQueryKeys.dayNumber(),
    queryFn: getDayNumber,
    staleTime: 1000 * 60 * 60, // 1 hora
  });
}
