/**
 * Hook for admin audit logs management
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAuditLogs } from '@/lib/api/admin-audit-api';
import type { AuditLogFilters } from '@/types/admin-audit.types';

/**
 * Hook para obtener logs de auditoría con filtros
 */
export function useAuditLogs(filters: AuditLogFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'audit-logs', filters],
    queryFn: () => fetchAuditLogs(filters),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refresh automático cada minuto
    refetchOnWindowFocus: true,
  });
}
