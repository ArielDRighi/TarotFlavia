import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminReadings,
  softDeleteReading,
  restoreReading,
} from '@/lib/api/admin-readings-api';
import type { AdminReadingsFilters } from '@/types/admin-readings.types';

export function useAdminReadings(filters: AdminReadingsFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'readings', filters],
    queryFn: () => fetchAdminReadings(filters),
    staleTime: 1 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
}

export function useSoftDeleteReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => softDeleteReading(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'readings'] });
    },
  });
}

export function useRestoreReading() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => restoreReading(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['admin', 'readings'] });
    },
  });
}
