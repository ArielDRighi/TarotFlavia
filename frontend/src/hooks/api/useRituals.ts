'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getRituals,
  getFeaturedRituals,
  getCategories,
  getLunarInfo,
  getRitualBySlug,
  completeRitual,
  getRitualHistory,
  getRitualStats,
} from '@/lib/api/rituals-api';
import type { RitualFilters, CompleteRitualRequest } from '@/types/ritual.types';

/**
 * Query keys for ritual-related queries
 * Used for cache invalidation and refetching
 */
export const ritualKeys = {
  all: ['rituals'] as const,
  list: (filters?: RitualFilters) => [...ritualKeys.all, 'list', filters] as const,
  featured: () => [...ritualKeys.all, 'featured'] as const,
  categories: () => [...ritualKeys.all, 'categories'] as const,
  lunarInfo: () => [...ritualKeys.all, 'lunar-info'] as const,
  detail: (slug: string) => [...ritualKeys.all, 'detail', slug] as const,
  history: (limit?: number) => [...ritualKeys.all, 'history', limit] as const,
  stats: () => [...ritualKeys.all, 'stats'] as const,
};

/**
 * Hook para obtener lista de rituales con filtros opcionales
 *
 * @param filters - Filtros opcionales (categoría, dificultad, fase lunar, búsqueda)
 * @returns Query con lista de rituales
 *
 * @example
 * ```tsx
 * const { data: rituals, isLoading } = useRituals({ category: 'lunar' });
 * ```
 */
export function useRituals(filters?: RitualFilters) {
  return useQuery({
    queryKey: ritualKeys.list(filters),
    queryFn: () => getRituals(filters),
    staleTime: 1000 * 60 * 30, // 30 minutos
  });
}

/**
 * Hook para obtener rituales destacados según fase lunar
 *
 * @returns Query con rituales destacados
 *
 * @example
 * ```tsx
 * const { data: featured } = useFeaturedRituals();
 * ```
 */
export function useFeaturedRituals() {
  return useQuery({
    queryKey: ritualKeys.featured(),
    queryFn: getFeaturedRituals,
    staleTime: 1000 * 60 * 60, // 1 hora (cambia con fase lunar)
  });
}

/**
 * Hook para obtener categorías de rituales con conteo
 *
 * @returns Query con categorías y conteos
 *
 * @example
 * ```tsx
 * const { data: categories } = useRitualCategories();
 * ```
 */
export function useRitualCategories() {
  return useQuery({
    queryKey: ritualKeys.categories(),
    queryFn: getCategories,
    staleTime: 1000 * 60 * 60 * 24, // 24 horas (raramente cambia)
  });
}

/**
 * Hook para obtener información de la fase lunar actual
 * Auto-refetch cada hora
 *
 * @returns Query con información lunar
 *
 * @example
 * ```tsx
 * const { data: lunarInfo } = useLunarInfo();
 * // lunarInfo.phaseName, lunarInfo.zodiacSign, etc.
 * ```
 */
export function useLunarInfo() {
  return useQuery({
    queryKey: ritualKeys.lunarInfo(),
    queryFn: getLunarInfo,
    staleTime: 1000 * 60 * 60, // 1 hora
    refetchInterval: 1000 * 60 * 60, // Refetch cada hora
  });
}

/**
 * Hook para obtener detalle de un ritual por slug
 *
 * @param slug - Slug del ritual
 * @returns Query con detalle del ritual
 *
 * @example
 * ```tsx
 * const { data: ritual } = useRitual('ritual-luna-nueva');
 * ```
 */
export function useRitual(slug: string) {
  return useQuery({
    queryKey: ritualKeys.detail(slug),
    queryFn: () => getRitualBySlug(slug),
    enabled: !!slug,
    staleTime: 1000 * 60 * 30,
  });
}

/**
 * Hook para marcar un ritual como completado
 * Invalida automáticamente el detalle, historial y estadísticas
 *
 * @returns Mutation para completar ritual
 *
 * @example
 * ```tsx
 * const completeMutation = useCompleteRitual();
 *
 * const handleComplete = () => {
 *   completeMutation.mutate({
 *     ritualId: 1,
 *     data: { notes: 'Muy tranquilizador', rating: 5 }
 *   });
 * };
 * ```
 */
export function useCompleteRitual() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ritualId, data }: { ritualId: number; data: CompleteRitualRequest }) =>
      completeRitual(ritualId, data),
    onSuccess: () => {
      // Invalidar detalle (completionCount puede cambiar), historial y stats
      queryClient.invalidateQueries({ queryKey: [...ritualKeys.all, 'detail'] });
      queryClient.invalidateQueries({ queryKey: ritualKeys.history() });
      queryClient.invalidateQueries({ queryKey: ritualKeys.stats() });
    },
  });
}

/**
 * Hook para obtener historial de rituales completados
 * Requiere autenticación
 *
 * @param limit - Número máximo de entradas (por defecto: 20)
 * @returns Query con historial
 *
 * @example
 * ```tsx
 * const { data: history } = useRitualHistory(10);
 * ```
 */
export function useRitualHistory(limit?: number) {
  return useQuery({
    queryKey: ritualKeys.history(limit),
    queryFn: () => getRitualHistory(limit),
  });
}

/**
 * Hook para obtener estadísticas de rituales del usuario
 * Requiere autenticación
 *
 * @returns Query con estadísticas (total completados, racha, categoría favorita)
 *
 * @example
 * ```tsx
 * const { data: stats } = useRitualStats();
 * // stats.totalCompleted, stats.currentStreak, stats.favoriteCategory
 * ```
 */
export function useRitualStats() {
  return useQuery({
    queryKey: ritualKeys.stats(),
    queryFn: getRitualStats,
  });
}
