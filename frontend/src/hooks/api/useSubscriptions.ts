/**
 * TanStack Query hooks for subscriptions API
 *
 * Custom hooks using TanStack Query for data fetching and caching.
 * These hooks consume the subscriptions-api functions and provide reactive data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/utils/useToast';
import { getMySubscription, setFavoriteTarotista } from '@/lib/api/subscriptions-api';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const subscriptionQueryKeys = {
  all: ['subscriptions'] as const,
  mySubscription: ['subscriptions', 'my'] as const,
} as const;

// ============================================================================
// Subscription Queries
// ============================================================================

/**
 * Hook to fetch current user's subscription information
 * Includes favorite tarotista and cooldown information
 */
export function useMySubscription() {
  return useQuery({
    queryKey: subscriptionQueryKeys.mySubscription,
    queryFn: getMySubscription,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Subscription Mutations
// ============================================================================

/**
 * Hook to set favorite tarotista for current user
 * Automatically invalidates subscription query on success
 */
export function useSetFavoriteTarotista() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (tarotistaId: number) => setFavoriteTarotista(tarotistaId),
    onSuccess: () => {
      // Invalidate subscription query to refetch updated data
      queryClient.invalidateQueries({
        queryKey: subscriptionQueryKeys.mySubscription,
      });

      toast.success('Tarotista favorito actualizado');
    },
    onError: () => {
      toast.error('Error al establecer tarotista favorito');
    },
  });
}
