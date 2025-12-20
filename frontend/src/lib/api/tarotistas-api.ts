/**
 * Tarotistas API Service
 *
 * Functions for all tarotistas-related API calls.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { PaginatedTarotistas, TarotistaDetail, TarotistaFilters } from '@/types';

// ============================================================================
// Tarotistas Públicos
// ============================================================================

/**
 * Fetch paginated list of tarotistas with optional filters
 * @param filters - Optional filters (search, especialidad, orderBy, etc.)
 * @returns Promise<PaginatedTarotistas> Paginated tarotistas with metadata
 * @throws Error with clear message on failure
 */
export async function getTarotistas(filters?: TarotistaFilters): Promise<PaginatedTarotistas> {
  try {
    const response = await apiClient.get<PaginatedTarotistas>(API_ENDPOINTS.TAROTISTAS.BASE, {
      params: filters || {},
    });
    return response.data;
  } catch {
    throw new Error('Error al obtener tarotistas');
  }
}

/**
 * Fetch detailed profile of a specific tarotista
 * @param id - Tarotista ID (numeric)
 * @returns Promise<TarotistaDetail> Tarotista detail with full profile
 * @throws Error with clear message on failure
 */
export async function getTarotistaById(id: number): Promise<TarotistaDetail> {
  try {
    const response = await apiClient.get<TarotistaDetail>(API_ENDPOINTS.TAROTISTAS.BY_ID(id));
    return response.data;
  } catch (error: unknown) {
    // Handle 404 specifically for inactive/non-existent tarotistas
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Tarotista no encontrado o inactivo');
      }
    }
    throw new Error('Error al obtener tarotista');
  }
}
