/**
 * Hooks for cache analytics management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getCacheAnalytics,
  invalidateAllCache,
  invalidateTarotistaCache,
  invalidateSpreadCache,
  triggerCacheWarming,
} from '@/lib/api/admin-cache-api';

/**
 * Hook para obtener analytics de caché
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
 * Hook para invalidar todo el caché
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
 * Hook para invalidar caché de un spread específico
 */
export function useInvalidateSpreadCache() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: invalidateSpreadCache,
    onSuccess: () => {
      // Invalidar analytics para refrescar stats
      queryClient.invalidateQueries({ queryKey: ['admin', 'cache', 'analytics'] });
    },
  });
}

/**
 * Hook para ejecutar cache warming manualmente
 */
export function useTriggerCacheWarming() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: triggerCacheWarming,
    onSuccess: () => {
      // Invalidar analytics para refrescar stats de warming
      queryClient.invalidateQueries({ queryKey: ['admin', 'cache', 'analytics'] });
    },
  });
}
