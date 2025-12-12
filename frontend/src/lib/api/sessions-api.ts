/**
 * Sessions API Service
 *
 * Functions for all sessions-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { TimeSlot, Session, SessionDetail, BookSessionDto } from '@/types';

// ============================================================================
// Available Slots
// ============================================================================

/**
 * Fetch available time slots for a tarotista on a specific date
 * @param tarotistaId - Tarotista ID (numeric)
 * @param date - Date in YYYY-MM-DD format
 * @returns Promise<TimeSlot[]> Array of time slots with availability
 * @throws Error with clear message on failure
 */
export async function getAvailableSlots(tarotistaId: number, date: string): Promise<TimeSlot[]> {
  try {
    const response = await apiClient.get<TimeSlot[]>(API_ENDPOINTS.SCHEDULING.AVAILABLE_SLOTS, {
      params: { tarotistaId, date },
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
 * @returns Promise<void>
 * @throws Error with clear message on failure
 */
export async function cancelSession(id: number): Promise<void> {
  try {
    await apiClient.post(API_ENDPOINTS.SCHEDULING.CANCEL_SESSION(id));
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
