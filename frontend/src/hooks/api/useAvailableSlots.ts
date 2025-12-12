/**
 * TanStack Query hook for available slots API
 *
 * Custom hook for fetching available time slots for booking calendar.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { getAvailableSlots } from '@/lib/api/scheduling-api';

// ============================================================================
// Query Keys
// ============================================================================

export const availableSlotsQueryKeys = {
  all: ['scheduling', 'available-slots'] as const,
  byTarotista: (tarotistaId: number, date: string) =>
    [...availableSlotsQueryKeys.all, { tarotistaId, date }] as const,
} as const;

// ============================================================================
// Available Slots Query
// ============================================================================

/**
 * Hook to fetch available time slots for a specific tarotista and date
 * @param tarotistaId - Tarotista ID (numeric)
 * @param date - Date in YYYY-MM-DD format
 * @returns TanStack Query result with available time slots
 */
export function useAvailableSlots(tarotistaId: number, date: string) {
  return useQuery({
    queryKey: availableSlotsQueryKeys.byTarotista(tarotistaId, date),
    queryFn: () => getAvailableSlots({ tarotistaId, date }),
    enabled: tarotistaId > 0 && /^\d{4}-\d{2}-\d{2}$/.test(date), // Only fetch if valid params and format
    staleTime: 1 * 60 * 1000, // 1 minute - slots can change frequently
  });
}
