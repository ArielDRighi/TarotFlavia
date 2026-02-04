/**
 * TanStack Query hooks for pendulum API
 *
 * Custom hooks using TanStack Query for data fetching and caching.
 * These hooks consume the pendulum-api functions and provide reactive data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  queryPendulum,
  getPendulumHistory,
  getPendulumStats,
  deletePendulumQuery,
} from '@/lib/api/pendulum-api';
import type { PendulumQueryRequest, PendulumResponse } from '@/types/pendulum.types';
import type { PendulumFeatureLimit } from '@/types/capabilities.types';
import { useUserCapabilities } from './useUserCapabilities';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const pendulumKeys = {
  all: ['pendulum'] as const,
  history: (limit?: number, filter?: PendulumResponse) => {
    const params: { limit?: number; filter?: PendulumResponse } = {};
    if (limit !== undefined) params.limit = limit;
    if (filter !== undefined) params.filter = filter;
    return [...pendulumKeys.all, 'history', params] as const;
  },
  stats: () => [...pendulumKeys.all, 'stats'] as const,
} as const;

// ============================================================================
// Pendulum Query Mutation
// ============================================================================

/**
 * Hook to query the pendulum
 * On success: invalidates all pendulum queries and user capabilities
 */
export function usePendulumQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: PendulumQueryRequest) => queryPendulum(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendulumKeys.all });
      queryClient.invalidateQueries({ queryKey: ['user', 'capabilities'] });
    },
  });
}

// ============================================================================
// Pendulum History Query
// ============================================================================

/**
 * Hook to fetch pendulum query history
 * @param limit - Optional limit of items to fetch
 * @param filter - Optional filter by response type (yes/no/maybe)
 */
export function usePendulumHistory(limit?: number, filter?: PendulumResponse) {
  return useQuery({
    queryKey: pendulumKeys.history(limit, filter),
    queryFn: () => getPendulumHistory(limit, filter),
  });
}

// ============================================================================
// Pendulum Stats Query
// ============================================================================

/**
 * Hook to fetch pendulum statistics
 * Shows distribution of yes/no/maybe responses
 */
export function usePendulumStats() {
  return useQuery({
    queryKey: pendulumKeys.stats(),
    queryFn: getPendulumStats,
  });
}

// ============================================================================
// Delete Pendulum Query Mutation
// ============================================================================

/**
 * Hook to delete a pendulum query from history
 * On success: invalidates all pendulum queries
 */
export function useDeletePendulumQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queryId: number) => deletePendulumQuery(queryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pendulumKeys.all });
    },
  });
}

// ============================================================================
// Pendulum Capabilities Helper
// ============================================================================

/**
 * Hook to get pendulum capabilities from user capabilities
 * Returns pendulum limits, usage, and reset time
 *
 * @returns PendulumFeatureLimit or null if not available
 */
export function usePendulumCapabilities(): PendulumFeatureLimit | null {
  const { data: capabilities } = useUserCapabilities();
  return capabilities?.pendulum ?? null;
}
