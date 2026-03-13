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
  myPurchases: (page: number, limit: number) =>
    [...holisticServiceQueryKeys.purchases(), 'mine', page, limit] as const,
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
 * Hook to fetch the authenticated user's paginated purchases
 * @param page - Page number (1-indexed, defaults to 1)
 * @param limit - Items per page (defaults to 10)
 * @returns TanStack Query result with paginated purchases
 */
export function useMyPurchases(page = 1, limit = 10) {
  return useQuery({
    queryKey: holisticServiceQueryKeys.myPurchases(page, limit),
    queryFn: () => getMyPurchases(page, limit),
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
