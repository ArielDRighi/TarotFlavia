/**
 * TanStack Query hooks for tarotistas API
 *
 * Custom hooks using TanStack Query for data fetching and caching.
 * These hooks consume the tarotistas-api functions and provide reactive data management.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getTarotistas, getTarotistaById } from '@/lib/api/tarotistas-api';
import type { TarotistaFilters } from '@/types';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const tarotistaQueryKeys = {
  all: ['tarotistas'] as const,
  lists: () => [...tarotistaQueryKeys.all, 'list'] as const,
  list: (filters?: TarotistaFilters) => [...tarotistaQueryKeys.lists(), filters] as const,
  details: () => [...tarotistaQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...tarotistaQueryKeys.details(), id] as const,
} as const;

// ============================================================================
// Tarotistas Queries
// ============================================================================

/**
 * Hook to fetch paginated list of tarotistas with optional filters
 * @param filters - Optional filters (search, especialidad, orderBy, page, limit)
 * @returns TanStack Query result with tarotistas data
 */
export function useTarotistas(filters?: TarotistaFilters) {
  return useQuery({
    queryKey: tarotistaQueryKeys.list(filters),
    queryFn: () => getTarotistas(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes - catalog data doesn't change often
  });
}

/**
 * Hook to fetch detailed profile of a specific tarotista
 * @param id - Tarotista ID (numeric)
 * @returns TanStack Query result with tarotista detail
 */
export function useTarotistaDetail(id: number) {
  return useQuery({
    queryKey: tarotistaQueryKeys.detail(id),
    queryFn: () => getTarotistaById(id),
    enabled: id > 0, // Only fetch if ID is valid
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
