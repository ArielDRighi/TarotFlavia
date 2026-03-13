/**
 * Holistic Services API
 *
 * Public and authenticated API functions for holistic services.
 * These are pure API functions - use TanStack Query hooks in hooks/api/ for data fetching.
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  HolisticService,
  HolisticServiceDetail,
  ServicePurchase,
  CreatePurchasePayload,
} from '@/types';

// ============================================================================
// Public: Catalog
// ============================================================================

/**
 * Fetch the list of active holistic services (public catalog)
 * @returns Promise<HolisticService[]> Array of active holistic services
 * @throws Error with clear message on failure
 */
export async function getHolisticServices(): Promise<HolisticService[]> {
  try {
    const response = await apiClient.get<HolisticService[]>(API_ENDPOINTS.HOLISTIC_SERVICES.LIST);
    return response.data;
  } catch {
    throw new Error('Error al obtener servicios holísticos');
  }
}

/**
 * Fetch a single holistic service by slug (public detail page)
 * @param slug - Service slug
 * @returns Promise<HolisticServiceDetail> Service detail with long description
 * @throws Error with clear message on failure (404 → 'Servicio no encontrado')
 */
export async function getHolisticServiceDetail(slug: string): Promise<HolisticServiceDetail> {
  try {
    const response = await apiClient.get<HolisticServiceDetail>(
      API_ENDPOINTS.HOLISTIC_SERVICES.DETAIL(slug)
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Servicio no encontrado');
      }
    }
    throw new Error('Error al obtener detalle del servicio');
  }
}

// ============================================================================
// Authenticated: Purchases
// ============================================================================

/**
 * Create a new purchase for a holistic service (authenticated)
 * @param data - CreatePurchasePayload with holisticServiceId
 * @returns Promise<ServicePurchase> The created purchase
 * @throws Error with clear message on failure
 */
export async function createPurchase(data: CreatePurchasePayload): Promise<ServicePurchase> {
  try {
    const response = await apiClient.post<ServicePurchase>(
      API_ENDPOINTS.HOLISTIC_SERVICES.PURCHASE,
      data
    );
    return response.data;
  } catch {
    throw new Error('Error al crear la compra');
  }
}

/**
 * Fetch the authenticated user's purchases
 * @returns Promise<ServicePurchase[]> Array of the user's purchases
 * @throws Error with clear message on failure
 */
export async function getMyPurchases(): Promise<ServicePurchase[]> {
  try {
    const response = await apiClient.get<ServicePurchase[]>(
      API_ENDPOINTS.HOLISTIC_SERVICES.MY_PURCHASES
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener mis compras');
  }
}

/**
 * Fetch detail of a specific purchase (authenticated owner)
 * @param id - Purchase ID (numeric)
 * @returns Promise<ServicePurchase> The purchase detail
 * @throws Error with clear message on failure (404 → 'Compra no encontrada')
 */
export async function getPurchaseDetail(id: number): Promise<ServicePurchase> {
  try {
    const response = await apiClient.get<ServicePurchase>(
      API_ENDPOINTS.HOLISTIC_SERVICES.PURCHASE_DETAIL(id)
    );
    return response.data;
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Compra no encontrada');
      }
    }
    throw new Error('Error al obtener detalle de la compra');
  }
}

/**
 * Cancel a pending purchase (authenticated owner)
 * @param id - Purchase ID (numeric)
 * @returns Promise<void>
 * @throws Error with clear message on failure (404 → 'Compra no encontrada')
 */
export async function cancelPurchase(id: number): Promise<void> {
  try {
    await apiClient.patch(API_ENDPOINTS.HOLISTIC_SERVICES.CANCEL_PURCHASE(id));
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 404) {
        throw new Error('Compra no encontrada');
      }
    }
    throw new Error('Error al cancelar la compra');
  }
}
