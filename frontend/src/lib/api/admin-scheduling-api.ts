/**
 * Admin Scheduling API
 *
 * Admin-only API functions for managing tarotista weekly availability and blocked dates.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  TarotistAvailability,
  TarotistException,
  SetWeeklyAvailabilityDto,
  AddExceptionDto,
} from '@/types';

// ============================================================================
// Availability
// ============================================================================

/**
 * Fetch weekly availability for a tarotista (admin view)
 * @param tarotistaId - Tarotista ID (numeric)
 * @returns Promise<TarotistAvailability[]> Array of availability slots
 * @throws Error with clear message on failure
 */
export async function adminGetWeeklyAvailability(
  tarotistaId: number
): Promise<TarotistAvailability[]> {
  try {
    const response = await apiClient.get<TarotistAvailability[]>(
      API_ENDPOINTS.ADMIN.TAROTISTA_AVAILABILITY(tarotistaId)
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener la disponibilidad semanal');
  }
}

/**
 * Set (create/replace) a weekly availability slot for a tarotista (admin only)
 * @param tarotistaId - Tarotista ID (numeric)
 * @param data - Day of week + time range
 * @returns Promise<TarotistAvailability> The created availability slot
 * @throws Error with clear message on failure
 */
export async function adminSetWeeklyAvailability(
  tarotistaId: number,
  data: SetWeeklyAvailabilityDto
): Promise<TarotistAvailability> {
  try {
    const response = await apiClient.post<TarotistAvailability>(
      API_ENDPOINTS.ADMIN.TAROTISTA_AVAILABILITY(tarotistaId),
      data
    );
    return response.data;
  } catch {
    throw new Error('Error al guardar la disponibilidad semanal');
  }
}

/**
 * Remove a weekly availability slot for a tarotista (admin only)
 * @param tarotistaId - Tarotista ID (numeric)
 * @param availabilityId - Availability slot ID (numeric)
 * @returns Promise<void>
 * @throws Error with clear message on failure (404 → 'Disponibilidad no encontrada')
 */
export async function adminRemoveWeeklyAvailability(
  tarotistaId: number,
  availabilityId: number
): Promise<void> {
  try {
    await apiClient.delete(
      API_ENDPOINTS.ADMIN.TAROTISTA_AVAILABILITY_BY_ID(tarotistaId, availabilityId)
    );
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Disponibilidad no encontrada');
      }
    }
    throw new Error('Error al eliminar la disponibilidad semanal');
  }
}

// ============================================================================
// Blocked Dates / Exceptions
// ============================================================================

/**
 * Fetch all blocked dates / exceptions for a tarotista (admin view)
 * @param tarotistaId - Tarotista ID (numeric)
 * @returns Promise<TarotistException[]> Array of exceptions
 * @throws Error with clear message on failure
 */
export async function adminGetBlockedDates(tarotistaId: number): Promise<TarotistException[]> {
  try {
    const response = await apiClient.get<TarotistException[]>(
      API_ENDPOINTS.ADMIN.TAROTISTA_BLOCKED_DATES(tarotistaId)
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener las fechas bloqueadas');
  }
}

/**
 * Add a blocked date / exception for a tarotista (admin only)
 * @param tarotistaId - Tarotista ID (numeric)
 * @param data - Exception data (date, type, optional time range + reason)
 * @returns Promise<TarotistException> The created exception
 * @throws Error with clear message on failure
 */
export async function adminAddBlockedDate(
  tarotistaId: number,
  data: AddExceptionDto
): Promise<TarotistException> {
  try {
    const response = await apiClient.post<TarotistException>(
      API_ENDPOINTS.ADMIN.TAROTISTA_BLOCKED_DATES(tarotistaId),
      data
    );
    return response.data;
  } catch {
    throw new Error('Error al agregar la fecha bloqueada');
  }
}

/**
 * Remove a blocked date / exception for a tarotista (admin only)
 * @param tarotistaId - Tarotista ID (numeric)
 * @param dateId - Exception ID (numeric)
 * @returns Promise<void>
 * @throws Error with clear message on failure (404 → 'Fecha bloqueada no encontrada')
 */
export async function adminRemoveBlockedDate(tarotistaId: number, dateId: number): Promise<void> {
  try {
    await apiClient.delete(API_ENDPOINTS.ADMIN.TAROTISTA_BLOCKED_DATE_BY_ID(tarotistaId, dateId));
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Fecha bloqueada no encontrada');
      }
    }
    throw new Error('Error al eliminar la fecha bloqueada');
  }
}
