/**
 * Utility to invalidate user-related queries after mutations
 *
 * This helper ensures that after operations that affect user limits or capabilities,
 * all relevant React Query caches are invalidated to fetch fresh data.
 *
 * @module invalidate-user-data
 */
import type { QueryClient } from '@tanstack/react-query';
import { capabilitiesQueryKeys } from '@/hooks/api/useUserCapabilities';
import { userQueryKeys } from '@/hooks/api/useUser';

/**
 * Invalidates user-related queries in parallel
 *
 * Use this after mutations that affect:
 * - User capabilities (daily limits, feature access)
 * - User profile data
 *
 * @param queryClient - TanStack Query client instance
 * @returns Promise that resolves when all invalidations are complete
 *
 * @example
 * ```typescript
 * onSuccess: async () => {
 *   await invalidateUserData(queryClient);
 *   toast.success('Action completed');
 * }
 * ```
 */
export async function invalidateUserData(queryClient: QueryClient): Promise<void> {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: capabilitiesQueryKeys.capabilities }),
    queryClient.invalidateQueries({ queryKey: userQueryKeys.profile }),
  ]);
}
