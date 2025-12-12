/**
 * Scheduling API Service
 *
 * Re-export and extend sessions API for scheduling-specific use cases.
 * This file provides convenience functions for the booking calendar component.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { TimeSlot } from '@/types';

// Re-export all session functions
export * from './sessions-api';

// ============================================================================
// Available Slots (Convenience Function for BookingCalendar)
// ============================================================================

/**
 * Fetch available time slots for a specific tarotista and date
 * Convenience wrapper for BookingCalendar component
 *
 * @param params - Request parameters
 * @param params.tarotistaId - Tarotista ID (numeric)
 * @param params.date - Date in YYYY-MM-DD format
 * @param params.durationMinutes - Optional duration filter (30, 60, or 90)
 * @returns Promise<TimeSlot[]> Array of time slots for the specified date
 * @throws Error with clear message on failure
 */
export async function getAvailableSlots(params: {
  tarotistaId: number;
  date: string;
  durationMinutes?: number;
}): Promise<TimeSlot[]> {
  try {
    const response = await apiClient.get<TimeSlot[]>(API_ENDPOINTS.SCHEDULING.AVAILABLE_SLOTS, {
      params: {
        tarotistaId: params.tarotistaId,
        startDate: params.date,
        endDate: params.date, // Same day
        durationMinutes: params.durationMinutes,
      },
    });
    return response.data;
  } catch {
    throw new Error('Error al obtener slots disponibles');
  }
}
