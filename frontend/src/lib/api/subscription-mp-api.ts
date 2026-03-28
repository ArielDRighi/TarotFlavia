/**
 * Subscription MercadoPago API Service
 *
 * Servicio para gestionar suscripciones premium con MercadoPago:
 * - Crear preapproval (inicia el flujo de checkout)
 * - Consultar estado de suscripción (para polling post-checkout)
 * - Cancelar suscripción activa
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  CreatePreapprovalResponse,
  MpSubscriptionStatus,
  CancelSubscriptionResponse,
} from '@/types';

/**
 * Create a MercadoPago preapproval subscription
 * Returns the checkout URL to redirect the user to MercadoPago
 */
export async function createPreapproval(): Promise<CreatePreapprovalResponse> {
  try {
    const response = await apiClient.post<CreatePreapprovalResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PREAPPROVAL
    );
    return response.data;
  } catch {
    throw new Error('Error al crear suscripción');
  }
}

/**
 * Get current user's MP subscription status
 * Returns plan, subscriptionStatus, planExpiresAt, and mpPreapprovalId
 * Reads directly from DB (fresh data, suitable for polling)
 */
export async function getSubscriptionStatus(): Promise<MpSubscriptionStatus> {
  try {
    const response = await apiClient.get<MpSubscriptionStatus>(API_ENDPOINTS.SUBSCRIPTIONS.STATUS);
    return response.data;
  } catch {
    throw new Error('Error al obtener estado de suscripción');
  }
}

/**
 * Cancel current user's MercadoPago subscription
 * Plan remains premium until planExpiresAt after cancellation
 */
export async function cancelSubscription(): Promise<CancelSubscriptionResponse> {
  try {
    const response = await apiClient.post<CancelSubscriptionResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.CANCEL
    );
    return response.data;
  } catch {
    throw new Error('Error al cancelar suscripción');
  }
}
