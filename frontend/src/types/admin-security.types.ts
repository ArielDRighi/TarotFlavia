/**
 * Admin Security Types
 *
 * Tipos para la gestión de seguridad y rate limiting desde el panel admin
 * Refleja el contrato del backend en /admin/rate-limits y /admin/security
 */

/**
 * Violación de rate limiting
 */
export interface RateLimitViolation {
  ipAddress: string;
  count: number;
  firstViolation: string;
  lastViolation: string;
}

/**
 * IP bloqueada
 */
export interface BlockedIP {
  ipAddress: string;
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
 */
export interface SecurityEventsResponse {
  events: SecurityEvent[];
  meta: {
    currentPage: number;
    itemsPerPage: number;
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
 * Backend retorna violations, blockedIPs y stats en una sola respuesta
 */
export interface RateLimitResponse {
  violations: RateLimitViolation[];
  blockedIPs: BlockedIP[];
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
