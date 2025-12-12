/**
 * TanStack Query hooks for sessions API
 *
 * Custom hooks using TanStack Query for data fetching and caching.
 * These hooks consume the sessions-api functions and provide reactive data management.
 */
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAvailableSlots,
  bookSession,
  getMySessions,
  getSessionDetail,
  cancelSession,
} from '@/lib/api/sessions-api';

// ============================================================================
// Query Keys (for consistency and type safety)
// ============================================================================

export const sessionQueryKeys = {
  all: ['sessions'] as const,
  lists: () => [...sessionQueryKeys.all, 'list'] as const,
  list: (status?: string) => [...sessionQueryKeys.lists(), status] as const,
  details: () => [...sessionQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...sessionQueryKeys.details(), id] as const,
  slots: () => [...sessionQueryKeys.all, 'slots'] as const,
  availableSlots: (
    tarotistaId: number,
    startDate: string,
    endDate: string,
    durationMinutes: number
  ) => [...sessionQueryKeys.slots(), tarotistaId, startDate, endDate, durationMinutes] as const,
} as const;

// ============================================================================
// Available Slots Query
// ============================================================================

/**
 * Hook to fetch available time slots for a tarotista in a date range
 * @param tarotistaId - Tarotista ID (numeric)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param durationMinutes - Duration in minutes (30, 60, or 90)
 * @returns TanStack Query result with available slots
 */
export function useAvailableSlots(
  tarotistaId: number,
  startDate: string,
  endDate: string,
  durationMinutes: number
) {
  return useQuery({
    queryKey: sessionQueryKeys.availableSlots(tarotistaId, startDate, endDate, durationMinutes),
    queryFn: () => getAvailableSlots(tarotistaId, startDate, endDate, durationMinutes),
    enabled: tarotistaId > 0 && startDate.length > 0 && endDate.length > 0 && durationMinutes > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes - slots change frequently
  });
}

// ============================================================================
// Book Session Mutation
// ============================================================================

/**
 * Hook to book a new session
 * @returns TanStack Mutation result for booking a session
 */
export function useBookSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bookSession,
    onSuccess: () => {
      // Invalidate sessions list to refetch after booking
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
      // Invalidate available slots queries to update slot availability after booking
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.slots() });
    },
  });
}

// ============================================================================
// My Sessions Query
// ============================================================================

/**
 * Hook to fetch user's sessions with optional status filter
 * @param status - Optional session status filter ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED')
 * @returns TanStack Query result with sessions data
 */
export function useMySessions(status?: string) {
  return useQuery({
    queryKey: sessionQueryKeys.list(status),
    queryFn: () => getMySessions(status),
    staleTime: 1 * 60 * 1000, // 1 minute - session data changes moderately
  });
}

// ============================================================================
// Session Detail Query
// ============================================================================

/**
 * Hook to fetch detailed information of a specific session
 * @param id - Session ID (numeric)
 * @returns TanStack Query result with session detail
 */
export function useSessionDetail(id: number) {
  return useQuery({
    queryKey: sessionQueryKeys.detail(id),
    queryFn: () => getSessionDetail(id),
    enabled: id > 0, // Only fetch if ID is valid
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

// ============================================================================
// Cancel Session Mutation
// ============================================================================

/**
 * Hook to cancel a session
 * @returns TanStack Mutation result for cancelling a session
 */
export function useCancelSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: number; reason: string }) => cancelSession(id, { reason }),
    onSuccess: () => {
      // Invalidate sessions queries to refetch after cancellation
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.details() });
      // Invalidate available slots queries since cancelling makes slot available again
      queryClient.invalidateQueries({ queryKey: sessionQueryKeys.slots() });
    },
  });
}
