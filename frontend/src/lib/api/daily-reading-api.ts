/**
 * Daily Reading API Service
 *
 * Functions for daily reading (carta del día) API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { DailyReading, PaginatedDailyReadings } from '@/types';

// ============================================================================
// Daily Reading Functions
// ============================================================================

/**
 * Create the daily reading for today.
 * Only creates a new daily reading; errors if one already exists for today.
 * @returns Promise<DailyReading> The newly created daily reading for today
 * @throws Error with clear message on failure, including if one already exists (409)
 */
export async function getDailyReading(): Promise<DailyReading> {
  try {
    const response = await apiClient.post<DailyReading>(API_ENDPOINTS.DAILY_READING.BASE);
    return response.data;
  } catch (error: unknown) {
    // If daily reading already exists for today, show a clear message
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response &&
      error.response.status === 409
    ) {
      throw new Error('Ya tienes una carta del día para hoy');
    }
    throw new Error('Error al crear carta del día');
  }
}

/**
 * Get today's daily reading if it exists (authenticated endpoint)
 * Backend returns null with 200 status when no reading exists (NOT 404)
 * @returns Promise<DailyReading | null> The daily reading or null if not exists
 * @throws Error with clear message on failure
 */
export async function getDailyReadingToday(): Promise<DailyReading | null> {
  const response = await apiClient.get<DailyReading | null>(API_ENDPOINTS.DAILY_READING.TODAY);
  return response.data;
}

// Note: getDailyReadingTodayPublic function removed in TASK-005A
// Public daily reading now uses POST with fingerprint via createDailyReadingPublic()

/**
 * Create today's daily reading for anonymous user (public endpoint - no authentication)
 * Generates a random card for the anonymous user based on their fingerprint.
 * Each fingerprint gets a unique random card per day.
 *
 * Note: This function deliberately does NOT catch/transform errors.
 * It re-throws the original AxiosError to preserve response.status,
 * which components need to check (409 for duplicate, 403 for limit) to show AnonymousLimitReached.
 *
 * @param fingerprint - Unique identifier for anonymous session
 * @returns Promise<DailyReading> The newly created daily reading
 * @throws AxiosError with response.status 409 if fingerprint already has a card for today
 * @throws AxiosError with response.status 403 if anonymous limit reached (future use)
 */
export async function createDailyReadingPublic(fingerprint: string): Promise<DailyReading> {
  const response = await apiClient.post<DailyReading>(API_ENDPOINTS.DAILY_READING.PUBLIC, {
    fingerprint,
  });
  return response.data;
}

/**
 * Get paginated history of daily readings
 * @param page - Page number (1-indexed)
 * @param limit - Number of items per page
 * @returns Promise<PaginatedDailyReadings> Paginated daily readings
 * @throws Error with clear message on failure
 */
export async function getDailyReadingHistory(
  page: number,
  limit: number
): Promise<PaginatedDailyReadings> {
  try {
    const response = await apiClient.get<PaginatedDailyReadings>(
      API_ENDPOINTS.DAILY_READING.HISTORY,
      {
        params: { page, limit },
      }
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener historial de cartas del día');
  }
}

/**
 * Regenerate the daily reading (Premium only)
 * @returns Promise<DailyReading> The regenerated daily reading
 * @throws Error with specific message for Premium required
 * @throws Error with clear message on other failures
 */
export async function regenerateDailyReading(): Promise<DailyReading> {
  try {
    const response = await apiClient.post<DailyReading>(API_ENDPOINTS.DAILY_READING.REGENERATE);
    return response.data;
  } catch (error: unknown) {
    // Check for Premium required error (403 Forbidden)
    if (
      error &&
      typeof error === 'object' &&
      'response' in error &&
      error.response &&
      typeof error.response === 'object' &&
      'status' in error.response &&
      error.response.status === 403
    ) {
      throw new Error('Se requiere suscripción Premium para regenerar la carta del día');
    }
    throw new Error('Error al regenerar carta del día');
  }
}
