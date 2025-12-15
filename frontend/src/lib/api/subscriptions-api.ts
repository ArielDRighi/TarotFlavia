/**
 * Subscriptions API Service
 *
 * Servicio para gestionar suscripciones de usuarios y tarotistas favoritos
 */
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  UserSubscription,
  SetFavoriteTarotistaDto,
  SetFavoriteTarotistaResponse,
} from '@/types';

/**
 * Get current user's subscription information
 */
export async function getMySubscription(): Promise<UserSubscription> {
  try {
    const response = await apiClient.get<UserSubscription>(
      API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION
    );
    return response.data;
  } catch {
    throw new Error('Error al obtener suscripción');
  }
}

/**
 * Set favorite tarotista for current user
 */
export async function setFavoriteTarotista(
  tarotistaId: number
): Promise<SetFavoriteTarotistaResponse> {
  try {
    const dto: SetFavoriteTarotistaDto = { tarotistaId };
    const response = await apiClient.post<SetFavoriteTarotistaResponse>(
      API_ENDPOINTS.SUBSCRIPTIONS.SET_FAVORITE,
      dto
    );
    return response.data;
  } catch {
    throw new Error('Error al establecer tarotista favorito');
  }
}
