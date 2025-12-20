/**
 * API functions for admin audit logs management
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type { AuditLogsResponse, AuditLogFilters } from '@/types/admin-audit.types';

/**
 * Obtener logs de auditoría con filtros y paginación
 */
export async function fetchAuditLogs(filters: AuditLogFilters = {}): Promise<AuditLogsResponse> {
  const response = await apiClient.get<AuditLogsResponse>(API_ENDPOINTS.ADMIN.AUDIT_LOGS, {
    params: filters,
  });
  return response.data;
}
