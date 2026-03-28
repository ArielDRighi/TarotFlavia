/**
 * TanStack Query hooks for MercadoPago subscription API
 *
 * Custom hooks for managing premium subscription lifecycle:
 * - useCreatePreapproval: mutation to start the MP checkout flow
 * - useSubscriptionStatus: query to get current subscription state (supports polling)
 * - useCancelSubscription: mutation to cancel active subscription
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createPreapproval,
  getSubscriptionStatus,
  cancelSubscription,
} from '@/lib/api/subscription-mp-api';
import { capabilitiesQueryKeys } from './useUserCapabilities';
import type { MpSubscriptionStatus } from '@/types';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const subscriptionMpQueryKeys = {
  all: ['subscriptions', 'mp'] as const,
  status: ['subscriptions', 'mp', 'status'] as const,
} as const;

// ============================================================================
// Options types
// ============================================================================

interface UseSubscriptionStatusOptions {
  /** Interval in ms for polling — set to false to disable */
  refetchInterval?: number | false;
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a MercadoPago preapproval subscription
 * Returns the checkout URL (initPoint) to redirect the user to MP
 *
 * @example
 * ```tsx
 * const { mutate: createPreapproval, isPending } = useCreatePreapproval();
 *
 * const handleUpgrade = () => {
 *   createPreapproval(undefined, {
 *     onSuccess: ({ initPoint }) => {
 *       window.location.href = initPoint;
 *     },
 *   });
 * };
 * ```
 */
export function useCreatePreapproval() {
  return useMutation({
    mutationFn: createPreapproval,
  });
}

/**
 * Hook to cancel the current user's MercadoPago subscription
 * Automatically invalidates capabilities and subscription status on success
 *
 * @example
 * ```tsx
 * const { mutate: cancel, isPending } = useCancelSubscription();
 *
 * const handleCancel = () => {
 *   cancel(undefined, {
 *     onSuccess: ({ planExpiresAt }) => {
 *       toast.success(`Suscripción cancelada. Acceso hasta ${planExpiresAt}`);
 *     },
 *   });
 * };
 * ```
 */
export function useCancelSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      // Invalidate capabilities to reflect updated plan state
      queryClient.invalidateQueries({ queryKey: capabilitiesQueryKeys.capabilities });
      // Invalidate subscription status to reflect cancelled state
      queryClient.invalidateQueries({ queryKey: subscriptionMpQueryKeys.status });
    },
  });
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch current user's MP subscription status
 * Reads directly from DB (fresh data, suitable for post-checkout polling)
 *
 * @param options.refetchInterval - Interval in ms for polling. Use 2000 for activation polling.
 *   Set to false to disable polling (default).
 *
 * @example
 * ```tsx
 * // Polling mode (post-checkout activation)
 * const { data: status } = useSubscriptionStatus({ refetchInterval: 2000 });
 *
 * // Normal mode
 * const { data: status } = useSubscriptionStatus();
 * ```
 */
export function useSubscriptionStatus(options?: UseSubscriptionStatusOptions) {
  return useQuery<MpSubscriptionStatus>({
    queryKey: subscriptionMpQueryKeys.status,
    queryFn: getSubscriptionStatus,
    refetchInterval: options?.refetchInterval,
    staleTime: 0, // Always fresh for status checks
  });
}
