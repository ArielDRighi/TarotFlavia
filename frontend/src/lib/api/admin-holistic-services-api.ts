/**
 * Admin Holistic Services API
 *
 * Admin-only API functions for managing holistic services and viewing purchase history.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  HolisticServiceAdmin,
  CreateHolisticServicePayload,
  UpdateHolisticServicePayload,
  ServicePurchase,
} from '@/types';

// ============================================================================
// Admin: Service Management
// ============================================================================

/**
 * Fetch all holistic services (admin view, includes sensitive fields)
 * @returns Promise<HolisticServiceAdmin[]> Array of all services with admin data
 * @throws Error with clear message on failure
 */
export async function adminGetHolisticServices(): Promise<HolisticServiceAdmin[]> {
  try {
    const response = await apiClient.get<HolisticServiceAdmin[]>(
      API_ENDPOINTS.HOLISTIC_SERVICES.ADMIN_LIST
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener servicios holísticos');
  }
}

/**
 * Create a new holistic service (admin only)
 * @param data - Full service creation payload
 * @returns Promise<HolisticServiceAdmin> The created service with admin data
 * @throws Error with clear message on failure
 */
export async function adminCreateHolisticService(
  data: CreateHolisticServicePayload
): Promise<HolisticServiceAdmin> {
  try {
    const response = await apiClient.post<HolisticServiceAdmin>(
      API_ENDPOINTS.HOLISTIC_SERVICES.ADMIN_LIST,
      data
    );
    return response.data;
  } catch {
    throw new Error('Error al crear el servicio');
  }
}

/**
 * Update an existing holistic service (admin only)
 * @param id - Service ID (numeric)
 * @param data - Partial update payload
 * @returns Promise<HolisticServiceAdmin> The updated service with admin data
 * @throws Error with clear message on failure (404 → 'Servicio no encontrado')
 */
export async function adminUpdateHolisticService(
  id: number,
  data: UpdateHolisticServicePayload
): Promise<HolisticServiceAdmin> {
  try {
    const response = await apiClient.patch<HolisticServiceAdmin>(
      API_ENDPOINTS.HOLISTIC_SERVICES.ADMIN_BY_ID(id),
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Servicio no encontrado');
      }
    }
    throw new Error('Error al actualizar el servicio');
  }
}

// ============================================================================
// Admin: Purchase / Transaction History
// ============================================================================

/**
 * Fetch all purchases (admin only) — read-only transaction history
 * @returns Promise<ServicePurchase[]> Array of all purchases with MP data
 * @throws Error with clear message on failure
 */
export async function adminGetAllPurchases(): Promise<ServicePurchase[]> {
  try {
    const response = await apiClient.get<ServicePurchase[]>(
      API_ENDPOINTS.HOLISTIC_SERVICES.ADMIN_ALL_PURCHASES
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener el historial de transacciones');
  }
}
