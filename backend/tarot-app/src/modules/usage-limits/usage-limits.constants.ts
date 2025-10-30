import { UserPlan } from '../users/entities/user.entity';
import { UsageFeature } from './entities/usage-limit.entity';

/**
 * Constantes de límites de uso para planes FREE y PREMIUM
 * Estructura: USAGE_LIMITS[plan][feature] = límite
 * -1 significa ilimitado
 */
export const USAGE_LIMITS: Record<UserPlan, Record<UsageFeature, number>> = {
  [UserPlan.FREE]: {
    [UsageFeature.TAROT_READING]: 3,
    [UsageFeature.INTERPRETATION_REGENERATION]: 0,
    [UsageFeature.ORACLE_QUERY]: 5,
  },
  [UserPlan.PREMIUM]: {
    [UsageFeature.TAROT_READING]: -1, // ilimitado
    [UsageFeature.INTERPRETATION_REGENERATION]: -1, // ilimitado
    [UsageFeature.ORACLE_QUERY]: -1, // ilimitado
  },
} as const;

/**
 * Días de retención de registros antiguos
 */
export const USAGE_RETENTION_DAYS = 7;
