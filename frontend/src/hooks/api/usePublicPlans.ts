/**
 * TanStack Query hook for public plan configuration
 *
 * Fetches plan data from the public endpoint (no authentication required).
 * Used by the /premium page to display dynamic pricing and plan features.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchPublicPlans } from '@/lib/api/public-plans-api';
import type { PlanConfig } from '@/types/admin.types';

// ============================================================================
// Query Keys
// ============================================================================

export const publicPlansQueryKeys = {
  all: ['plans', 'public'] as const,
} as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch public plan configuration (no authentication required).
 * Suitable for the /premium landing page visible to all users.
 *
 * @example
 * ```tsx
 * const { data: plans, isLoading } = usePublicPlans();
 * const premiumPlan = plans?.find(p => p.planType === 'premium');
 * ```
 */
export function usePublicPlans() {
  return useQuery<PlanConfig[]>({
    queryKey: publicPlansQueryKeys.all,
    queryFn: fetchPublicPlans,
    staleTime: 5 * 60 * 1000, // 5 minutes — plan config changes rarely
  });
}
