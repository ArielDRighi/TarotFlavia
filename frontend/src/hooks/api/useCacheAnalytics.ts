/**
 * Hooks for cache analytics management
 *
 * NOTA: El endpoint /admin/cache/analytics NO incluye warming status.
 * El warming status se obtiene de un endpoint separado: /admin/cache/warm/status
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCacheAnalytics,
  getCacheWarmingStatus,
  invalidateAllCache,
  invalidateTarotistaCache,
  triggerCacheWarming,
} from '@/lib/api/admin-cache-api';

/**
 * Hook para obtener analytics de caché (sin warming status)
 * Backend: GET /admin/cache/analytics
 */
export function useCacheAnalytics() {
  return useQuery({
    queryKey: ['admin', 'cache', 'analytics'],
    queryFn: getCacheAnalytics,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refresh automático cada 30 segundos
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para obtener warming status (endpoint separado)
 * Backend: GET /admin/cache/warm/status
 */
export function useCacheWarmingStatus() {
  return useQuery({
    queryKey: ['admin', 'cache', 'warming', 'status'],
    queryFn: getCacheWarmingStatus,
    staleTime: 5 * 1000, // 5 segundos (más frecuente porque puede cambiar rápido)
    refetchInterval: 5 * 1000,
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para invalidar todo el caché
 * Backend: DELETE /admin/cache/global
 */
export function useInvalidateAllCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invalidateAllCache,
    onSuccess: () => {
      // Invalidar analytics para refrescar stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'cache', 'analytics'] });
    },
  });
}

/**
 * Hook para invalidar caché de un tarotista específico
 * Backend: DELETE /admin/cache/tarotistas/:id
 */
export function useInvalidateTarotistaCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invalidateTarotistaCache,
    onSuccess: () => {
      // Invalidar analytics para refrescar stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'cache', 'analytics'] });
    },
  });
}

/**
 * Hook para ejecutar cache warming manualmente
 * Backend: POST /admin/cache/warm
 */
export function useTriggerCacheWarming() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ topN }: { topN?: number } = {}) => triggerCacheWarming(topN),
    onSuccess: () => {
      // Invalidar warming status para refrescar progreso
      queryClient.invalidateQueries({ queryKey: ['admin', 'cache', 'warming', 'status'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'cache', 'analytics'] });
    },
  });
}
