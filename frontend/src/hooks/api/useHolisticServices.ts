/**
 * TanStack Query hooks for holistic services (public + authenticated user)
 *
 * Provides reactive data fetching for the service catalog and user purchases.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import {
  getHolisticServices,
  getHolisticServiceDetail,
  getMyPurchases,
  getPurchaseDetail,
} from '@/lib/api/holistic-services-api';

// ============================================================================
// Query Keys
// ============================================================================

export const holisticServiceQueryKeys = {
  all: ['holistic-services'] as const,
  lists: () => [...holisticServiceQueryKeys.all, 'list'] as const,
  details: () => [...holisticServiceQueryKeys.all, 'detail'] as const,
  detail: (slug: string) => [...holisticServiceQueryKeys.details(), slug] as const,
  purchases: () => [...holisticServiceQueryKeys.all, 'purchases'] as const,
  myPurchases: () => [...holisticServiceQueryKeys.purchases(), 'mine'] as const,
  purchaseDetail: (id: number) => [...holisticServiceQueryKeys.purchases(), 'detail', id] as const,
} as const;

// ============================================================================
// Public: Catalog Queries
// ============================================================================

/**
 * Hook to fetch the full holistic services catalog
 * @returns TanStack Query result with array of active services
 */
export function useHolisticServices() {
  return useQuery({
    queryKey: holisticServiceQueryKeys.lists(),
    queryFn: getHolisticServices,
    staleTime: 5 * 60 * 1000, // 5 minutes - catalog changes infrequently
  });
}

/**
 * Hook to fetch the detail of a single holistic service by slug
 * @param slug - Service slug
 * @returns TanStack Query result with service detail (includes longDescription)
 */
export function useHolisticServiceDetail(slug: string) {
  return useQuery({
    queryKey: holisticServiceQueryKeys.detail(slug),
    queryFn: () => getHolisticServiceDetail(slug),
    enabled: slug.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// Authenticated: Purchase Queries
// ============================================================================

/**
 * Hook to fetch the authenticated user's purchases
 * @returns TanStack Query result with array of purchases
 */
export function useMyPurchases() {
  return useQuery({
    queryKey: holisticServiceQueryKeys.myPurchases(),
    queryFn: getMyPurchases,
    staleTime: 1 * 60 * 1000, // 1 minute - purchases may change after payment
  });
}

/**
 * Hook to fetch the detail of a specific purchase
 * @param id - Purchase ID (numeric)
 * @returns TanStack Query result with purchase detail
 */
export function usePurchaseDetail(id: number) {
  return useQuery({
    queryKey: holisticServiceQueryKeys.purchaseDetail(id),
    queryFn: () => getPurchaseDetail(id),
    enabled: id > 0,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
