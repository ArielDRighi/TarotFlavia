import { UserPlan } from '../../users/entities/user.entity';

/**
 * Días de retención de lecturas de tarot según el plan del usuario
 * FREE: 30 días de historial
 * PREMIUM: 365 días (1 año) de historial
 * ANONYMOUS: No tienen historial persistente
 */
export const READING_RETENTION_DAYS: Record<UserPlan, number> = {
  [UserPlan.ANONYMOUS]: 0,
  [UserPlan.FREE]: 30,
  [UserPlan.PREMIUM]: 365,
};

/**
 * Días de gracia para lecturas soft-deleted antes de hard-delete permanente
 */
export const SOFT_DELETE_GRACE_PERIOD_DAYS = 30;

/**
 * Días de retención de cartas del día según el plan
 */
export const DAILY_READING_RETENTION_DAYS: Record<UserPlan, number> = {
  [UserPlan.ANONYMOUS]: 1,
  [UserPlan.FREE]: 30,
  [UserPlan.PREMIUM]: 365,
};
