import { UserPlan } from '../../users/entities/user.entity';

export interface QuotaConfig {
  maxRequests: number;
  softLimit: number;
  hardLimit: number;
}

/**
 * Cuotas mensuales de IA por plan de usuario
 *
 * Fuente de verdad única (T-FBK-006): debe coincidir con la seed de la DB
 * (plans.seeder.ts) y con la UI (premium-only).
 *
 * ANONYMOUS: Sin IA (usuarios no registrados)
 * FREE: Sin IA. Regla de negocio (decisión de Ariel): Free NO consume IA; sus
 *       interpretaciones se sirven desde contenido ya existente en la DB. La IA
 *       es exclusiva de Premium. Por eso la cuota es 0 (no configurable).
 * PREMIUM: Ilimitado (-1). El uso real de Premium ya está acotado por los
 *          límites diarios por actividad (ver usage-limits), no por esta cuota.
 */
export const AI_MONTHLY_QUOTAS: Record<UserPlan, QuotaConfig> = {
  [UserPlan.ANONYMOUS]: {
    maxRequests: 0, // No AI for non-registered users
    softLimit: 0,
    hardLimit: 0,
  },
  [UserPlan.FREE]: {
    maxRequests: 0, // Free NO consume IA (exclusiva de Premium)
    softLimit: 0,
    hardLimit: 0, // El guard bloquea toda IA para Free
  },
  [UserPlan.PREMIUM]: {
    maxRequests: Number(process.env.AI_QUOTA_PREMIUM_MONTHLY) || -1, // Ilimitado
    softLimit: -1, // No aplica
    hardLimit: Number.MAX_SAFE_INTEGER, // Prácticamente ilimitado
  },
};

export const QUOTA_WARNING_MESSAGE =
  'Has usado el {percentage}% de tu cuota mensual de {maxRequests} interpretaciones de IA. Actualiza a Premium para interpretaciones ilimitadas.';

export const QUOTA_LIMIT_REACHED_MESSAGE =
  'Has alcanzado tu límite mensual de {maxRequests} interpretaciones de IA. Tu cuota se renovará el {resetDate}. Actualiza a Premium para interpretaciones ilimitadas.';
