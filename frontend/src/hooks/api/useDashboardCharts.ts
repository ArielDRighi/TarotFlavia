/**
 * Hook for fetching admin dashboard charts data
 */

import { useQuery } from '@tanstack/react-query';
import { fetchDashboardCharts } from '@/lib/api/dashboard-api';

/**
 * Fetch dashboard charts data
 */
export function useDashboardCharts() {
  return useQuery({
    queryKey: ['admin', 'dashboard', 'charts'],
    queryFn: fetchDashboardCharts,
    staleTime: 2 * 60 * 1000, // 2 minutos
    refetchOnWindowFocus: true,
  });
}
