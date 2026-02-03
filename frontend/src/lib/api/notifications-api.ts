import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { Notification, UnreadCountResponse, NotificationFilters } from '@/types';

/**
 * Obtener lista de notificaciones con filtros opcionales
 */
export async function getNotifications(filters?: NotificationFilters): Promise<Notification[]> {
  const params = new URLSearchParams();

  if (filters?.unreadOnly !== undefined) {
    params.append('unreadOnly', String(filters.unreadOnly));
  }
  if (filters?.type) {
    params.append('type', filters.type);
  }
  if (filters?.limit !== undefined) {
    params.append('limit', String(filters.limit));
  }
  if (filters?.offset !== undefined) {
    params.append('offset', String(filters.offset));
  }

  const url = params.toString()
    ? `${API_ENDPOINTS.NOTIFICATIONS.BASE}?${params.toString()}`
    : API_ENDPOINTS.NOTIFICATIONS.BASE;

  const response = await apiClient.get<Notification[]>(url);
  return response.data;
}

/**
 * Obtener contador de notificaciones no leídas
 */
export async function getUnreadCount(): Promise<UnreadCountResponse> {
  const response = await apiClient.get<UnreadCountResponse>(API_ENDPOINTS.NOTIFICATIONS.COUNT);
  return response.data;
}

/**
 * Marcar una notificación como leída
 */
export async function markAsRead(id: number): Promise<Notification> {
  const response = await apiClient.patch<Notification>(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
  return response.data;
}

/**
 * Marcar todas las notificaciones como leídas
 */
export async function markAllAsRead(): Promise<{ message: string }> {
  const response = await apiClient.patch<{ message: string }>(
    API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ
  );
  return response.data;
}
