/**
 * Session status lifecycle
 */
export enum SessionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED_BY_USER = 'cancelled_by_user',
  CANCELLED_BY_TAROTIST = 'cancelled_by_tarotist',
}
