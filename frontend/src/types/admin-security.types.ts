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
  ip: string;
  count: number;
  firstViolation: string;
  lastViolation: string;
}

/**
 * IP bloqueada
 */
export interface BlockedIP {
  ip: string;
  reason: string;
  blockedAt: string;
  expiresAt: string;
}

/**
 * Severidad de evento de seguridad
 */
export type SecurityEventSeverity = 'low' | 'medium' | 'high' | 'critical';

/**
 * Tipo de evento de seguridad
 */
export type SecurityEventType =
  | 'login_failed'
  | 'suspicious_activity'
  | 'rate_limit_violation'
  | 'unauthorized_access'
  | 'brute_force_attempt'
  | 'account_locked'
  | 'ip_blocked';

/**
 * Evento de seguridad
 */
export interface SecurityEvent {
  id: number;
  eventType: SecurityEventType;
  severity: SecurityEventSeverity;
  userId?: number;
  ip: string;
  description: string;
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
  activeViolatingIps: number;
  blockedIps: number;
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
