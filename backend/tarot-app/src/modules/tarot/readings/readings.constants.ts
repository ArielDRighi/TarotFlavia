import { UserPlan } from '../../users/entities/user.entity';

/**
 * Dias de retencion de lecturas de tarot segun el plan del usuario
 * FREE: 30 dias de historial
 * PREMIUM: 365 dias (1 ano) de historial
 * ANONYMOUS: No tienen historial persistente
 */
export const READING_RETENTION_DAYS: Record<UserPlan, number> = {
  [UserPlan.ANONYMOUS]: 0,
  [UserPlan.FREE]: 30,
  [UserPlan.PREMIUM]: 365,
};

/**
 * Dias de gracia para lecturas soft-deleted antes de hard-delete permanente
 */
export const SOFT_DELETE_GRACE_PERIOD_DAYS = 30;

/**
 * Dias de retencion de cartas del dia segun el plan
 */
export const DAILY_READING_RETENTION_DAYS: Record<UserPlan, number> = {
  [UserPlan.ANONYMOUS]: 1,
  [UserPlan.FREE]: 30,
  [UserPlan.PREMIUM]: 365,
};
