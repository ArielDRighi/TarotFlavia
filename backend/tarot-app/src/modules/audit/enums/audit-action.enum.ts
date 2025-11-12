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
}
