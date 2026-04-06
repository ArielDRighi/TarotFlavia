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
import { useCallback } from 'react';
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
  return useQuery<UserCapabilities>({
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
