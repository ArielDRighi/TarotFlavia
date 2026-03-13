/**
 * Admin Holistic Services API
 *
 * Admin-only API functions for managing holistic services and approving payments.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  HolisticServiceAdmin,
  CreateHolisticServicePayload,
  UpdateHolisticServicePayload,
  ServicePurchase,
  ApprovePurchasePayload,
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
// Admin: Purchase / Payment Management
// ============================================================================

/**
 * Fetch all purchases pending payment approval (admin only)
 * @returns Promise<ServicePurchase[]> Array of pending purchases
 * @throws Error with clear message on failure
 */
export async function adminGetPendingPayments(): Promise<ServicePurchase[]> {
  try {
    const response = await apiClient.get<ServicePurchase[]>(
      API_ENDPOINTS.HOLISTIC_SERVICES.ADMIN_PENDING_PAYMENTS
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener pagos pendientes');
  }
}

/**
 * Approve a purchase payment (admin only)
 * @param id - Purchase ID (numeric)
 * @param data - Optional payment reference
 * @returns Promise<ServicePurchase> The approved purchase
 * @throws Error with clear message on failure (404 → 'Compra no encontrada')
 */
export async function adminApprovePayment(
  id: number,
  data: ApprovePurchasePayload = {}
): Promise<ServicePurchase> {
  try {
    const response = await apiClient.patch<ServicePurchase>(
      API_ENDPOINTS.HOLISTIC_SERVICES.ADMIN_APPROVE_PAYMENT(id),
      data
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Compra no encontrada');
      }
    }
    throw new Error('Error al aprobar el pago');
  }
}
