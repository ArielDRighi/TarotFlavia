/**
 * Admin Audit Logs Types
 *
 * Tipos para el registro de auditoría de acciones administrativas
 * Refleja el contrato del backend en /admin/audit-logs
 */

/**
 * Tipo de acción de auditoría
 */
export type AuditActionType =
  | 'USER_BANNED'
  | 'USER_UNBANNED'
  | 'PLAN_CHANGED'
  | 'ROLE_ADDED'
  | 'ROLE_REMOVED'
  | 'TAROTISTA_APPROVED'
  | 'TAROTISTA_REJECTED'
  | 'TAROTISTA_DEACTIVATED'
  | 'TAROTISTA_REACTIVATED'
  | 'IP_BLOCKED'
  | 'IP_UNBLOCKED'
  | 'PLAN_CONFIG_UPDATED'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED';

/**
 * Tipo de entidad afectada
 */
export type AuditEntityType =
  | 'User'
  | 'Tarotista'
  | 'Reading'
  | 'Session'
  | 'PlanConfig'
  | 'IP'
  | 'Application';

/**
 * Log de auditoría
 */
export interface AuditLog {
  id: number;
  userId: number;
  userName: string;
  targetUserId?: number;
  action: AuditActionType;
  entityType: AuditEntityType;
  entityId: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
}

/**
 * Filtros para logs de auditoría
 */
export interface AuditLogFilters {
  userId?: number;
  action?: AuditActionType;
  entityType?: AuditEntityType;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Metadata de paginación (según contrato del backend)
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

/**
 * Respuesta paginada de logs de auditoría
 */
export interface AuditLogsResponse {
  data: AuditLog[];
  meta: PaginationMeta;
}
