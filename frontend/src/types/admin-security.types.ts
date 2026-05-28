/**
 * Admin Security Types
 *
 * Tipos para la gestión de seguridad y rate limiting desde el panel admin
 * Refleja el contrato del backend en /admin/rate-limits y /admin/security
 */

/**
 * Violación de rate limiting
 *
 * Contrato real backend (RateLimitsAdminController + IPBlockingService):
 * cada item usa la propiedad `ip` (no `ipAddress`).
 */
export interface RateLimitViolation {
  ip: string;
  count: number;
  firstViolation: string;
  lastViolation: string;
}

/**
 * IP bloqueada
 *
 * Contrato real backend: cada item usa la propiedad `ip` (no `ipAddress`).
 */
export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string | null; // Puede ser null si es permanente
}

/**
 * Severidad de evento de seguridad
 */
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Tipo de evento de seguridad
 */
export type SecurityEventType =
  | 'successful_login'
  | 'failed_login'
  | 'password_changed'
  | 'email_changed'
  | 'account_locked'
  | 'account_unlocked'
  | 'invalid_token'
  | 'expired_token'
  | 'permission_denied'
  | 'rate_limit_exceeded'
  | 'suspicious_activity'
  | 'ip_blocked'
  | 'ip_unblocked'
  | 'session_expired'
  | 'other';

/**
 * Evento de seguridad
 */
export interface SecurityEvent {
  id: string;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: number;
  ipAddress: string;
  details: string; // Descripción del evento
  createdAt: string;
}

/**
 * Filtros para eventos de seguridad
 */
export interface SecurityEventFilters {
  eventType?: SecurityEventType;
  severity?: SecurityEventSeverity;
  userId?: number;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

/**
 * Respuesta paginada de eventos de seguridad
 *
 * Contrato estándar del proyecto: { data, meta: { page, limit, totalItems, totalPages } }
 * (Alineado con AuditLogsContent y el resto de tablas paginadas)
 */
export interface SecurityEventsResponse {
  data: SecurityEvent[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
  };
}

/**
 * Estadísticas de rate limiting
 */
export interface RateLimitStats {
  totalViolations: number;
  totalBlockedIps: number;
  activeViolationsCount: number;
}

/**
 * Respuesta completa del endpoint de rate limiting
 * Backend retorna violations, blockedIps y stats en una sola respuesta
 */
export interface RateLimitResponse {
  violations: RateLimitViolation[];
  blockedIps: BlockedIP[];
  stats: RateLimitStats;
}

/**
 * DTO para bloquear IP
 */
export interface BlockIPDto {
  ip: string;
  reason: string;
}

/**
 * Respuesta de acción sobre IP (bloquear/desbloquear)
 */
export interface IPActionResponse {
  message: string;
  ip: string;
}

/**
 * Respuesta del endpoint GET /admin/ip-whitelist
 */
export interface WhitelistResponse {
  ips: string[];
  count: number;
}

/**
 * DTO para agregar/eliminar IP de la whitelist
 */
export interface WhitelistIPDto {
  ip: string;
}

/**
 * Respuesta de acción sobre IP en la whitelist (agregar/eliminar)
 */
export interface WhitelistActionResponse {
  message: string;
  ip: string;
}
