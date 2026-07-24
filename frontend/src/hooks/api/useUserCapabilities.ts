/**
 * TanStack Query hooks for user capabilities API
 *
 * Custom hooks using TanStack Query for user capabilities data fetching and caching.
 * This is the SINGLE SOURCE OF TRUTH for user capabilities in the frontend.
 *
 * Capabilities are computed by the backend based on:
 * - User's plan (anonymous, free, premium)
 * - Current usage counts
 * - Plan limits and features
 *
 * This hook replaces the old pattern of calculating capabilities in multiple
 * components. All components should read from this hook instead.
 */
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect } from 'react';
import { apiClient } from '@/lib/api/axios-config';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { getSessionFingerprint } from '@/lib/utils/fingerprint';
import type { UserCapabilities } from '@/types';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const capabilitiesQueryKeys = {
  capabilities: ['user', 'capabilities'] as const,
} as const;

// ============================================================================
// User Capabilities Query
// ============================================================================

/**
 * Hook to fetch current user capabilities
 *
 * Returns what features the user can access based on their plan and usage.
 * Works for both authenticated and anonymous users.
 *
 * Key features:
 * - staleTime: 0 (always revalidate for fresh data)
 * - refetchOnWindowFocus: true (refresh when user returns to tab)
 * - refetchOnMount: true (refresh when component mounts)
 * - Auto-refetch when the daily limit resets (crossing midnight UTC), so a
 *   stale "límite alcanzado" state does not persist into the new day without a
 *   manual page refresh.
 *
 * @returns React Query result with UserCapabilities data
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { data: capabilities, isLoading } = useUserCapabilities();
 *
 *   if (isLoading) return <Spinner />;
 *
 *   if (!capabilities?.canCreateTarotReading) {
 *     return <UpgradeModal />;
 *   }
 *
 *   return <CreateReadingForm />;
 * }
 * ```
 */
export function useUserCapabilities(options?: { enabled?: boolean }) {
  const queryClient = useQueryClient();

  const query = useQuery<UserCapabilities>({
    queryKey: capabilitiesQueryKeys.capabilities,
    queryFn: async () => {
      // Get fingerprint for anonymous users to track usage
      const fingerprint = await getSessionFingerprint();

      const response = await apiClient.get<UserCapabilities>(API_ENDPOINTS.USERS.CAPABILITIES, {
        params: { fingerprint },
      });
      return response.data;
    },
    enabled: options?.enabled !== false,
    staleTime: 0, // Always revalidate for fresh data
    refetchOnWindowFocus: true, // Refresh when user returns to tab
    refetchOnMount: true, // Refresh when component mounts
  });

  // Schedule a refetch for the exact moment the daily limit resets (midnight UTC).
  // staleTime:0 alone is not enough: it marks data stale but only refetches on an
  // event (mount/focus/reconnect). If the tab stays open across midnight on the
  // "límite alcanzado" screen, the query never revalidates and shows yesterday's
  // stale state until a manual refresh. This timer closes that gap.
  //
  // We key off tarotReadings.resetAt as the daily clock: dailyCard shares the same
  // midnight-UTC boundary, and invalidating refetches the whole response, so a
  // single timer refreshes every daily feature. Using the daily reset (max ~24h)
  // also stays well under the setTimeout overflow limit (~24.8 days), unlike the
  // pendulum reset which can be monthly/lifetime.
  const resetAt = query.data?.tarotReadings?.resetAt;
  useEffect(() => {
    if (!resetAt) return;

    const msUntilReset = new Date(resetAt).getTime() - Date.now();

    // Only schedule for a reset that is still ahead. A reset already in the past
    // is handled by refetchOnMount/refetchOnWindowFocus (a fresh fetch always
    // returns the next midnight UTC), so no immediate invalidation is needed.
    if (msUntilReset <= 0) return;

    // +5s margin so the backend has safely crossed midnight UTC before we refetch,
    // tolerating small client/server clock skew (firing early would refetch the
    // same resetAt and, since the dependency wouldn't change, skip rescheduling).
    const timer = setTimeout(() => {
      void queryClient.invalidateQueries({
        queryKey: capabilitiesQueryKeys.capabilities,
      });
    }, msUntilReset + 5000);

    return () => clearTimeout(timer);
  }, [resetAt, queryClient]);

  return query;
}

// ============================================================================
// Invalidate Capabilities Helper
// ============================================================================

/**
 * Hook to get a function that invalidates capabilities cache
 *
 * Use this after mutations that change user's usage counts (e.g., creating readings)
 * to ensure capabilities are refreshed and UI reflects new limits.
 *
 * @returns Function to invalidate capabilities cache
 *
 * @example
 * ```tsx
 * function CreateReadingButton() {
 *   const invalidateCapabilities = useInvalidateCapabilities();
 *   const { mutate: createReading } = useCreateReading();
 *
 *   const handleCreate = () => {
 *     createReading(data, {
 *       onSuccess: () => {
 *         invalidateCapabilities(); // Refresh capabilities
 *         toast.success('Lectura creada');
 *       }
 *     });
 *   };
 *
 *   return <Button onClick={handleCreate}>Crear</Button>;
 * }
 * ```
 */
export function useInvalidateCapabilities() {
  const queryClient = useQueryClient();

  return useCallback(() => {
    queryClient.invalidateQueries({ queryKey: capabilitiesQueryKeys.capabilities });
  }, [queryClient]);
}
