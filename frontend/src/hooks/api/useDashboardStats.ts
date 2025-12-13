/**
 * Hook for fetching admin dashboard statistics
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardStats } from '@/lib/api/dashboard-api';

/**
 * Fetch dashboard statistics
 */
export function useDashboardStats() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn: fetchDashboardStats,
    staleTime: 2 * 60 * 1000, // 2 minutos - datos del dashboard se pueden cachear brevemente
    refetchOnWindowFocus: true, // Refetch cuando se vuelve a la ventana
  });
}
