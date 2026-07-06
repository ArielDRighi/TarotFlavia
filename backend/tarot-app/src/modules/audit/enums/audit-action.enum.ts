export enum AuditAction {
  USER_CREATED = 'user_created',
  USER_BANNED = 'user_banned',
  USER_UNBANNED = 'user_unbanned',
  ROLE_ADDED = 'role_added',
  ROLE_REMOVED = 'role_removed',
  PLAN_CHANGED = 'plan_changed',
  READING_DELETED = 'reading_deleted',
  READING_RESTORED = 'reading_restored',
  CARD_MODIFIED = 'card_modified',
  SPREAD_MODIFIED = 'spread_modified',
  CONFIG_CHANGED = 'config_changed',
  USER_DELETED = 'user_deleted',
  // T-FBK-009: el escritor de esta acción (admin-limits birth-chart) fue retirado,
  // pero el valor se conserva: es parte del enum de Postgres `audit_logs_action_enum`
  // y hay registros históricos en `audit_logs` con `action = 'update_usage_limits'`.
  // Quitarlo desincronizaría el tipo enum de la DB y rompería la lectura de esos
  // registros (quitar un valor de un enum de Postgres exige recrear el tipo).
  UPDATE_USAGE_LIMITS = 'update_usage_limits',
}
