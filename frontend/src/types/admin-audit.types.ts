/**
 * Admin Audit Logs Types
 *
 * Tipos para el registro de auditoría de acciones administrativas
 * Refleja el contrato del backend en /admin/audit-logs
 */

/**
 * Tipos de acciones de auditoría (snake_case como en backend enum)
 */
export type AuditActionType =
  | 'user_created'
  | 'user_banned'
  | 'user_unbanned'
  | 'role_added'
  | 'role_removed'
  | 'plan_changed'
  | 'reading_deleted'
  | 'reading_restored'
  | 'card_modified'
  | 'spread_modified'
  | 'config_changed'
  | 'user_deleted';

/**
 * Tipos de entidades auditadas
 */
export type AuditEntityType = 'User' | 'Reading' | 'Card' | 'Spread' | 'Config';

/**
 * Usuario relacionado (de las relaciones user/targetUser del backend)
 */
export interface AuditUser {
  id: number;
  email: string;
  name: string | null;
}

/**
 * Registro de auditoría (match exacto con backend entity AuditLog)
 */
export interface AuditLog {
  id: string; // UUID generado por el backend
  userId: number | null;
  user: AuditUser | null;
  targetUserId: number | null;
  targetUser: AuditUser | null;
  action: AuditActionType;
  entityType: string;
  entityId: string;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown>;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string; // ISO 8601
}

/**
 * Filtros para consulta de audit logs (match exacto con backend QueryAuditLogDto)
 */
export interface AuditLogFilters {
  userId?: number;
  action?: AuditActionType;
  entityType?: string;
  startDate?: string; // ISO 8601
  endDate?: string; // ISO 8601
  page?: number;
  limit?: number;
}

/**
 * Metadata de paginación (match exacto con backend AuditLogListResponse)
 */
export interface AuditLogsPaginationMeta {
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Respuesta paginada de logs de auditoría (match exacto con backend)
 */
export interface AuditLogsResponse {
  logs: AuditLog[];
  meta: AuditLogsPaginationMeta;
}
