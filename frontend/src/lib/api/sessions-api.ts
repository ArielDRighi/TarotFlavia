/**
 * Sessions API Service
 *
 * Functions for all sessions-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { TimeSlot, Session, SessionDetail, BookSessionDto, CancelSessionDto } from '@/types';

// ============================================================================
// Available Slots
// ============================================================================

/**
 * Fetch available time slots for a tarotista in a date range
 * @param tarotistaId - Tarotista ID (numeric)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 * @param durationMinutes - Duration in minutes (30, 60, or 90)
 * @returns Promise<TimeSlot[]> Array of time slots with availability
 * @throws Error with clear message on failure
 */
export async function getAvailableSlots(
  tarotistaId: number,
  startDate: string,
  endDate: string,
  durationMinutes: number
): Promise<TimeSlot[]> {
  try {
    const response = await apiClient.get<TimeSlot[]>(API_ENDPOINTS.SCHEDULING.AVAILABLE_SLOTS, {
      params: { tarotistaId, startDate, endDate, durationMinutes },
    });
    return response.data;
  } catch {
    throw new Error('Error al obtener slots disponibles');
  }
}

// ============================================================================
// Book Session
// ============================================================================

/**
 * Book a new session with a tarotista
 * @param data - BookSessionDto with tarotistaId, date, time, duration
 * @returns Promise<Session> The created session
 * @throws Error with clear message on failure
 */
export async function bookSession(data: BookSessionDto): Promise<Session> {
  try {
    const response = await apiClient.post<Session>(API_ENDPOINTS.SCHEDULING.BOOK, data);
    return response.data;
  } catch (error: unknown) {
    // Handle 409 Conflict specifically for slot already booked
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 409) {
        throw new Error('Slot no disponible');
      }
    }
    throw new Error('Error al reservar sesión');
  }
}

// ============================================================================
// My Sessions
// ============================================================================

/**
 * Fetch user's sessions with optional status filter
 * @param status - Optional session status filter
 * @returns Promise<Session[]> Array of user's sessions
 * @throws Error with clear message on failure
 */
export async function getMySessions(status?: string): Promise<Session[]> {
  try {
    const response = await apiClient.get<Session[]>(API_ENDPOINTS.SCHEDULING.MY_SESSIONS, {
      params: status ? { status } : undefined,
    });
    return response.data;
  } catch {
    throw new Error('Error al obtener sesiones');
  }
}

// ============================================================================
// Session Detail
// ============================================================================

/**
 * Fetch detailed information of a specific session
 * @param id - Session ID (numeric)
 * @returns Promise<SessionDetail> Session detail with full information
 * @throws Error with clear message on failure
 */
export async function getSessionDetail(id: number): Promise<SessionDetail> {
  try {
    const response = await apiClient.get<SessionDetail>(
      API_ENDPOINTS.SCHEDULING.SESSION_DETAIL(id)
    );
    return response.data;
  } catch (error: unknown) {
    // Handle 404 specifically for non-existent sessions
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Sesión no encontrada');
      }
    }
    throw new Error('Error al obtener detalle de sesión');
  }
}

// ============================================================================
// Cancel Session
// ============================================================================

/**
 * Cancel a session
 * @param id - Session ID (numeric)
 * @param data - Cancellation data with reason
 * @returns Promise<void>
 * @throws {Error} Session not found (404) or cancellation error
 */
export async function cancelSession(id: number, data: CancelSessionDto): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.SCHEDULING.CANCEL_SESSION(id), data);
  } catch (error: unknown) {
    // Handle 404 specifically for non-existent sessions
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Sesión no encontrada');
      }
    }
    throw new Error('Error al cancelar sesión');
  }
}
