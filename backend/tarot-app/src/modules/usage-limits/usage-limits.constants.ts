import { UserPlan } from '../users/entities/user.entity';
import { UsageFeature } from './entities/usage-limit.entity';

/**
 * Constantes de límites de uso para todos los planes
 * Estructura: USAGE_LIMITS[plan][feature] = límite
 * -1 significa ilimitado
 *
 * NOTA: Para TAROT_READING, la fuente de verdad es la base de datos (tabla plans).
 * Estos valores son fallback para otras características que aún no están en DB.
 */
export const USAGE_LIMITS: Record<UserPlan, Record<UsageFeature, number>> = {
  [UserPlan.ANONYMOUS]: {
    [UsageFeature.TAROT_READING]: 1, // 1 tirada diaria
    [UsageFeature.INTERPRETATION_REGENERATION]: 0, // Sin regeneración
    [UsageFeature.ORACLE_QUERY]: 0, // Sin consultas al oráculo
  },
  [UserPlan.FREE]: {
    [UsageFeature.TAROT_READING]: 2, // Carta del día + 1 tirada de 3 cartas
    [UsageFeature.INTERPRETATION_REGENERATION]: 0, // Sin regeneración
    [UsageFeature.ORACLE_QUERY]: 5, // 5 consultas al oráculo/día
  },
  [UserPlan.PREMIUM]: {
    [UsageFeature.TAROT_READING]: 3, // 3 tiradas/día
    [UsageFeature.INTERPRETATION_REGENERATION]: -1, // Regeneración ilimitada
    [UsageFeature.ORACLE_QUERY]: -1, // Consultas ilimitadas
  },
} as const;

/**
 * Días de retención de registros antiguos
 */
export const USAGE_RETENTION_DAYS = 7;
