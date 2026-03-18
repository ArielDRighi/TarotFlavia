/**
 * TanStack Query hooks for admin holistic services management
 *
 * Provides queries and mutations for admin-only service and transaction history.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminGetHolisticServices,
  adminCreateHolisticService,
  adminUpdateHolisticService,
  adminGetAllPurchases,
} from '@/lib/api/admin-holistic-services-api';
import { holisticServiceQueryKeys } from './useHolisticServices';
import type { CreateHolisticServicePayload, UpdateHolisticServicePayload } from '@/types';

// ============================================================================
// Admin Query Keys (extends base keys)
// ============================================================================

export const adminHolisticServiceQueryKeys = {
  admin: ['admin', 'holistic-services'] as const,
  adminList: () => [...adminHolisticServiceQueryKeys.admin, 'list'] as const,
  allPurchases: () => [...adminHolisticServiceQueryKeys.admin, 'all-purchases'] as const,
} as const;

// ============================================================================
// Admin Queries
// ============================================================================

/**
 * Hook to fetch all holistic services with admin data (includes sensitive fields)
 * @returns TanStack Query result with full admin service list
 */
export function useAdminHolisticServices() {
  return useQuery({
    queryKey: adminHolisticServiceQueryKeys.adminList(),
    queryFn: adminGetHolisticServices,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch the full transaction history for admin (read-only)
 * @returns TanStack Query result with all purchases including MP data
 */
export function useAllPurchases() {
  return useQuery({
    queryKey: adminHolisticServiceQueryKeys.allPurchases(),
    queryFn: adminGetAllPurchases,
    staleTime: 30 * 1000, // 30 seconds
  });
}

// ============================================================================
// Admin Mutations
// ============================================================================

/**
 * Hook to create a new holistic service (admin only)
 * Invalidates admin list on success.
 * @returns TanStack Mutation result for creating a service
 */
export function useCreateHolisticService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateHolisticServicePayload) => adminCreateHolisticService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminHolisticServiceQueryKeys.adminList() });
      // Also invalidate the public list so the new service appears in the catalog
      queryClient.invalidateQueries({ queryKey: holisticServiceQueryKeys.lists() });
    },
  });
}

/**
 * Hook to update an existing holistic service (admin only)
 * Invalidates admin list and public detail cache on success.
 * @returns TanStack Mutation result for updating a service
 */
export function useUpdateHolisticService() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateHolisticServicePayload }) =>
      adminUpdateHolisticService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminHolisticServiceQueryKeys.adminList() });
      // Invalidate public list and details cache (slug may change)
      queryClient.invalidateQueries({ queryKey: holisticServiceQueryKeys.all });
    },
  });
}
