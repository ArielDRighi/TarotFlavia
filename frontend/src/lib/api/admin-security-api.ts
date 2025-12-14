/**
 * API functions for admin security and rate limiting management
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  RateLimitViolation,
  BlockedIP,
  SecurityEventsResponse,
  SecurityEventFilters,
  BlockIPDto,
  IPActionResponse,
} from '@/types/admin-security.types';

/**
 * Obtener lista de violaciones de rate limiting
 */
export async function fetchRateLimitViolations(): Promise<RateLimitViolation[]> {
  const response = await apiClient.get<RateLimitViolation[]>(
    API_ENDPOINTS.ADMIN.RATE_LIMIT_VIOLATIONS
  );
  return response.data;
}

/**
 * Obtener lista de IPs bloqueadas
 */
export async function fetchBlockedIPs(): Promise<BlockedIP[]> {
  const response = await apiClient.get<BlockedIP[]>(API_ENDPOINTS.ADMIN.BLOCKED_IPS);
  return response.data;
}

/**
 * Bloquear una IP
 */
export async function blockIP(data: BlockIPDto): Promise<IPActionResponse> {
  const response = await apiClient.post<IPActionResponse>(API_ENDPOINTS.ADMIN.BLOCK_IP, data);
  return response.data;
}

/**
 * Desbloquear una IP
 */
export async function unblockIP(ip: string): Promise<IPActionResponse> {
  const response = await apiClient.delete<IPActionResponse>(API_ENDPOINTS.ADMIN.UNBLOCK_IP(ip));
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
