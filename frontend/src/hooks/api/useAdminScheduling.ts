/**
 * TanStack Query hooks for admin scheduling management
 *
 * Provides queries and mutations for managing tarotista weekly availability
 * and blocked dates (admin only).
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  adminGetWeeklyAvailability,
  adminSetWeeklyAvailability,
  adminRemoveWeeklyAvailability,
  adminGetBlockedDates,
  adminAddBlockedDate,
  adminRemoveBlockedDate,
} from '@/lib/api/admin-scheduling-api';
import type { SetWeeklyAvailabilityDto, AddExceptionDto } from '@/types';

// ============================================================================
// Query Keys
// ============================================================================

export const adminSchedulingQueryKeys = {
  all: ['admin', 'scheduling'] as const,
  availability: (tarotistaId: number) =>
    [...adminSchedulingQueryKeys.all, 'availability', tarotistaId] as const,
  blockedDates: (tarotistaId: number) =>
    [...adminSchedulingQueryKeys.all, 'blocked-dates', tarotistaId] as const,
} as const;

// ============================================================================
// Queries
// ============================================================================

/**
 * Hook to fetch weekly availability slots for a tarotista (admin view)
 * @param tarotistaId - Tarotista ID
 * @returns TanStack Query result with availability list
 */
export function useAdminWeeklyAvailability(tarotistaId: number) {
  return useQuery({
    queryKey: adminSchedulingQueryKeys.availability(tarotistaId),
    queryFn: () => adminGetWeeklyAvailability(tarotistaId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to fetch blocked dates / exceptions for a tarotista (admin view)
 * @param tarotistaId - Tarotista ID
 * @returns TanStack Query result with exceptions list
 */
export function useAdminBlockedDates(tarotistaId: number) {
  return useQuery({
    queryKey: adminSchedulingQueryKeys.blockedDates(tarotistaId),
    queryFn: () => adminGetBlockedDates(tarotistaId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Hook to set a weekly availability slot (admin only)
 * Invalidates availability query for the given tarotista on success.
 * @returns TanStack Mutation result
 */
export function useSetWeeklyAvailability(tarotistaId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SetWeeklyAvailabilityDto) => adminSetWeeklyAvailability(tarotistaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminSchedulingQueryKeys.availability(tarotistaId),
      });
    },
  });
}

/**
 * Hook to remove a weekly availability slot (admin only)
 * Invalidates availability query for the given tarotista on success.
 * @returns TanStack Mutation result
 */
export function useRemoveWeeklyAvailability(tarotistaId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (availabilityId: number) =>
      adminRemoveWeeklyAvailability(tarotistaId, availabilityId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminSchedulingQueryKeys.availability(tarotistaId),
      });
    },
  });
}

/**
 * Hook to add a blocked date / exception (admin only)
 * Invalidates blocked dates query for the given tarotista on success.
 * @returns TanStack Mutation result
 */
export function useAddBlockedDate(tarotistaId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AddExceptionDto) => adminAddBlockedDate(tarotistaId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminSchedulingQueryKeys.blockedDates(tarotistaId),
      });
    },
  });
}

/**
 * Hook to remove a blocked date / exception (admin only)
 * Invalidates blocked dates query for the given tarotista on success.
 * @returns TanStack Mutation result
 */
export function useRemoveBlockedDate(tarotistaId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dateId: number) => adminRemoveBlockedDate(tarotistaId, dateId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: adminSchedulingQueryKeys.blockedDates(tarotistaId),
      });
    },
  });
}
