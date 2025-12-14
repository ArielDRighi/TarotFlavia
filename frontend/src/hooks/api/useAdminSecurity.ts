/**
 * Hooks for admin security and rate limiting management
 */

import { useQuery } from '@tanstack/react-query';
import { fetchRateLimitData, fetchSecurityEvents } from '@/lib/api/admin-security-api';
import type { SecurityEventFilters } from '@/types/admin-security.types';

/**
 * Hook para obtener datos completos de rate limiting
 * Incluye violations, blocked IPs y estadísticas
 */
export function useRateLimitData() {
  return useQuery({
    queryKey: ['admin', 'security', 'rate-limiting'],
    queryFn: fetchRateLimitData,
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

// TODO: Backend endpoints pendientes
// Descomentar cuando se implementen POST /admin/security/block-ip y DELETE /admin/security/block-ip/:ip
/*
export function useBlockIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: BlockIPDto) => blockIP(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'rate-limiting'] });
    },
  });
}

export function useUnblockIP() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ip: string) => unblockIP(ip),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'security', 'rate-limiting'] });
    },
  });
}
*/
