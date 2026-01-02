/**
 * TanStack Query hooks for daily reading (carta del día)
 *
 * Custom hooks using TanStack Query for data fetching and caching.
 * These hooks consume the daily-reading-api functions and provide reactive data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/utils/useToast';

import {
  getDailyReading,
  getDailyReadingToday,
  getDailyReadingTodayPublic,
  getDailyReadingHistory,
  regenerateDailyReading,
} from '@/lib/api/daily-reading-api';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const dailyReadingQueryKeys = {
  all: ['daily-reading'] as const,
  today: () => [...dailyReadingQueryKeys.all, 'today'] as const,
  history: (page: number, limit: number) =>
    [...dailyReadingQueryKeys.all, 'history', { page, limit }] as const,
} as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch today's daily reading if it exists (authenticated)
 * Returns null if no daily reading exists for today
 */
export function useDailyReadingToday() {
  return useQuery({
    queryKey: dailyReadingQueryKeys.today(),
    queryFn: getDailyReadingToday,
  });
}

/**
 * Hook to fetch today's daily reading if it exists (public - no auth required)
 * Returns null if no daily reading exists for today
 * This endpoint returns only DB info, no AI interpretation
 */
export function useDailyReadingTodayPublic() {
  return useQuery({
    queryKey: [...dailyReadingQueryKeys.all, 'today-public'] as const,
    queryFn: getDailyReadingTodayPublic,
  });
}

/**
 * Hook to fetch paginated history of daily readings
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 */
export function useDailyReadingHistory(page: number, limit: number) {
  return useQuery({
    queryKey: dailyReadingQueryKeys.history(page, limit),
    queryFn: () => getDailyReadingHistory(page, limit),
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create today's daily reading.
 * Creates a new daily reading for today. Errors if one already exists (409).
 * On success: invalidates all daily reading queries and shows toast.
 */
export function useDailyReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: getDailyReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyReadingQueryKeys.all });
      toast.success('¡Tu carta del día está lista!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al crear carta del día');
    },
  });
}

/**
 * Hook to regenerate daily reading (Premium only)
 * On success: invalidates all daily reading queries (today + history) and shows toast
 * On error: shows specific message for Premium required
 */
export function useRegenerateDailyReading() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: regenerateDailyReading,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dailyReadingQueryKeys.all });
      toast.success('Carta del día regenerada');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Error al regenerar carta del día');
    },
  });
}
