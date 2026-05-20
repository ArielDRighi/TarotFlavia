/**
 * API functions for admin security and rate limiting management
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  RateLimitResponse,
  SecurityEventsResponse,
  SecurityEventFilters,
  IPActionResponse,
} from '@/types/admin-security.types';

/**
 * Obtener datos completos de rate limiting (violations, blocked IPs y stats)
 * Backend retorna todo en una sola respuesta
 */
export async function fetchRateLimitData(): Promise<RateLimitResponse> {
  const response = await apiClient.get<RateLimitResponse>(API_ENDPOINTS.ADMIN.RATE_LIMIT_DATA);
  return response.data;
}

/**
 * Obtener eventos de seguridad con filtros y paginación
 */
export async function fetchSecurityEvents(
  filters: SecurityEventFilters = {}
): Promise<SecurityEventsResponse> {
  const response = await apiClient.get<SecurityEventsResponse>(
    API_ENDPOINTS.ADMIN.SECURITY_EVENTS,
    {
      params: filters,
    }
  );
  return response.data;
}

/**
 * Desbloquear una IP
 * @param ip - Dirección IP a desbloquear
 * @returns Respuesta con mensaje y detalles de la IP desbloqueada
 * @backend_endpoint DELETE /admin/rate-limits/unblock-ip/:ip
 */
export async function unblockIP(ip: string): Promise<IPActionResponse> {
  const response = await apiClient.delete<IPActionResponse>(API_ENDPOINTS.ADMIN.UNBLOCK_IP(ip));
  return response.data;
}
