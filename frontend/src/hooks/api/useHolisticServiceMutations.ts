/**
 * TanStack Query mutation hooks for holistic services (authenticated user)
 *
 * Provides reactive mutations for creating and cancelling purchases.
 */
'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createPurchase, cancelPurchase } from '@/lib/api/holistic-services-api';
import { holisticServiceQueryKeys } from './useHolisticServices';
import type { CreatePurchasePayload } from '@/types';

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to create a new purchase for a holistic service
 * Invalidates the user's purchases list on success.
 * @returns TanStack Mutation result for creating a purchase
 */
export function useCreatePurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePurchasePayload) => createPurchase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: holisticServiceQueryKeys.purchases() });
    },
  });
}

/**
 * Hook to cancel a pending purchase
 * Invalidates the user's purchases list and the specific purchase detail on success.
 * @returns TanStack Mutation result for cancelling a purchase
 */
export function useCancelPurchase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cancelPurchase(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: holisticServiceQueryKeys.purchases() });
      queryClient.invalidateQueries({
        queryKey: holisticServiceQueryKeys.purchaseDetail(id),
      });
    },
  });
}
