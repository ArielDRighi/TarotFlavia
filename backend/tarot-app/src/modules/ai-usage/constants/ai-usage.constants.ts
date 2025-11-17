import { UserPlan } from '../../users/entities/user.entity';

export interface QuotaConfig {
  maxRequests: number;
  softLimit: number;
  hardLimit: number;
}

/**
 * Cuotas mensuales de IA por plan de usuario
 * IMPORTANTE: Estos valores por defecto pueden ser sobrescritos por variables de entorno
 * Ver .env.example para configuración (AI_QUOTA_FREE_MONTHLY, AI_QUOTA_PREMIUM_MONTHLY)
 */
export const AI_MONTHLY_QUOTAS: Record<UserPlan, QuotaConfig> = {
  [UserPlan.FREE]: {
    maxRequests: Number(process.env.AI_QUOTA_FREE_MONTHLY) || 100, // ~3 lecturas/día promedio
    softLimit: Math.round(
      (Number(process.env.AI_QUOTA_FREE_MONTHLY) || 100) * 0.8,
    ), // Advertencia al 80%
    hardLimit: Number(process.env.AI_QUOTA_FREE_MONTHLY) || 100, // Bloqueo al 100%
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
