/**
 * Hooks for admin security and rate limiting management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchRateLimitViolations,
  fetchBlockedIPs,
  fetchSecurityEvents,
  blockIP,
  unblockIP,
} from '@/lib/api/admin-security-api';
import type { SecurityEventFilters, BlockIPDto } from '@/types/admin-security.types';

/**
 * Hook para obtener violaciones de rate limiting
 */
export function useRateLimitViolations() {
  return useQuery({
    queryKey: ['admin', 'security', 'rate-limit-violations'],
    queryFn: fetchRateLimitViolations,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refresh automático cada 30 segundos
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para obtener IPs bloqueadas
 */
export function useBlockedIPs() {
  return useQuery({
    queryKey: ['admin', 'security', 'blocked-ips'],
    queryFn: fetchBlockedIPs,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refresh automático cada 30 segundos
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para obtener eventos de seguridad con filtros
 */
export function useSecurityEvents(filters: SecurityEventFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'security', 'events', filters],
    queryFn: () => fetchSecurityEvents(filters),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refresh automático cada 30 segundos
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook mutation para bloquear una IP
 */
export function useBlockIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: BlockIPDto) => blockIP(data),
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'rate-limit-violations'] });
    },
  });
}

/**
 * Hook mutation para desbloquear una IP
 */
export function useUnblockIP() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ip: string) => unblockIP(ip),
    onSuccess: () => {
      // Invalidar queries relacionadas para refrescar datos
      queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'blocked-ips'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'rate-limit-violations'] });
    },
  });
}
