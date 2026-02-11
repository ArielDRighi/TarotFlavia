import { UserPlan } from '../users/entities/user.entity';
import { UsageFeature } from './entities/usage-limit.entity';

/**
 * Constantes de límites de uso para todos los planes
 * Estructura: USAGE_LIMITS[plan][feature] = límite
 * -1 significa ilimitado
 *
 * NOTA: Para TAROT_READING y PENDULUM_QUERY, la fuente de verdad es la base de datos (tabla plans).
 * Estos valores son fallback para características que aún no están en DB.
 */
export const USAGE_LIMITS: Record<UserPlan, Record<UsageFeature, number>> = {
  [UserPlan.ANONYMOUS]: {
    [UsageFeature.DAILY_CARD]: 1, // 1 carta del día
    [UsageFeature.TAROT_READING]: 1, // 1 tirada diaria
    [UsageFeature.INTERPRETATION_REGENERATION]: 0, // Sin regeneración
    [UsageFeature.ORACLE_QUERY]: 0, // Sin consultas al oráculo
    [UsageFeature.PENDULUM_QUERY]: 1, // 1 consulta de por vida
    [UsageFeature.BIRTH_CHART]: 1, // 1 carta astral lifetime
  },
  [UserPlan.FREE]: {
    [UsageFeature.DAILY_CARD]: 1, // 1 carta del día
    [UsageFeature.TAROT_READING]: 2, // Carta del día + 1 tirada de 3 cartas
    [UsageFeature.INTERPRETATION_REGENERATION]: 0, // Sin regeneración
    [UsageFeature.ORACLE_QUERY]: 5, // 5 consultas al oráculo/día
    [UsageFeature.PENDULUM_QUERY]: 1, // 1 consulta al péndulo/día (CAMBIO: antes era 3/mes)
    [UsageFeature.BIRTH_CHART]: 3, // 3 cartas astrales/mes
  },
  [UserPlan.PREMIUM]: {
    [UsageFeature.DAILY_CARD]: 1, // 1 carta del día
    [UsageFeature.TAROT_READING]: 3, // 3 tiradas/día
    [UsageFeature.INTERPRETATION_REGENERATION]: -1, // Regeneración ilimitada
    [UsageFeature.ORACLE_QUERY]: -1, // Consultas ilimitadas
    [UsageFeature.PENDULUM_QUERY]: 3, // 3 consultas al péndulo/día
    [UsageFeature.BIRTH_CHART]: 5, // 5 cartas astrales/mes
  },
} as const;

/**
 * Días de retención de registros antiguos
 */
export const USAGE_RETENTION_DAYS = 7;
