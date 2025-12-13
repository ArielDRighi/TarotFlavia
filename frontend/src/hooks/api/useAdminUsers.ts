/**
 * Hook for fetching admin users with filters
 */

import { useQuery } from '@tanstack/react-query';
import { fetchAdminUsers } from '@/lib/api/admin-users-api';
import type { UserFilters } from '@/types/admin-users.types';

/**
 * Fetch admin users with pagination and filters
 */
export function useAdminUsers(filters: UserFilters = {}) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1 * 60 * 1000, // 1 minuto
    refetchOnWindowFocus: true,
  });
}
