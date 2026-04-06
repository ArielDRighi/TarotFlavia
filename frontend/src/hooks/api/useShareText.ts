/**
 * TanStack Query hooks for share text functionality
 *
 * Custom hooks using TanStack Query for fetching share text from readings.
 * These hooks consume the API functions from readings-api and daily-reading-api.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getShareText } from '@/lib/api/readings-api';
import { getDailyShareText } from '@/lib/api/daily-reading-api';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const shareTextQueryKeys = {
  all: ['shareText'] as const,
  reading: (id: number) => [...shareTextQueryKeys.all, 'reading', id] as const,
  daily: () => [...shareTextQueryKeys.all, 'daily'] as const,
} as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch formatted share text for a reading
 * @param readingId - Reading ID (will not fetch if id is 0 or falsy)
 * @returns Query result with share text data
 */
export function useReadingShareText(readingId: number) {
  return useQuery({
    queryKey: shareTextQueryKeys.reading(readingId),
    queryFn: () => getShareText(readingId),
    enabled: readingId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes - share text is relatively static
  });
}

/**
 * Hook to fetch formatted share text for today's daily reading
 * @returns Query result with share text data
 */
export function useDailyShareText(options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: shareTextQueryKeys.daily(),
    queryFn: getDailyShareText,
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes - daily reading doesn't change frequently
  });
}
