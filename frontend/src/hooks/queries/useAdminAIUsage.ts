/**
 * Admin AI Usage React Query Hooks
 */

import { useQuery } from '@tanstack/react-query';
import { getAIUsageStats } from '@/lib/api/admin-ai-usage-api';

/**
 * Hook para obtener estadísticas de uso de IA
 * @param startDate - Fecha de inicio opcional (ISO format)
 * @param endDate - Fecha de fin opcional (ISO format)
 * @returns Query con estadísticas de uso de IA
 */
export function useAIUsageStats(startDate?: string, endDate?: string) {
  return useQuery({
    queryKey: ['admin', 'ai-usage', startDate, endDate],
    queryFn: () => getAIUsageStats(startDate, endDate),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000, // Refetch cada 5 minutos
  });
}
