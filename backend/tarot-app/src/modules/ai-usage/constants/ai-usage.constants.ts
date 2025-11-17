import { UserPlan } from '../../users/entities/user.entity';

export interface QuotaConfig {
  maxRequests: number;
  softLimit: number;
  hardLimit: number;
}

export const AI_MONTHLY_QUOTAS: Record<UserPlan, QuotaConfig> = {
  [UserPlan.FREE]: {
    maxRequests: 100, // ~3 lecturas/día promedio
    softLimit: 80, // Advertencia al 80%
    hardLimit: 100, // Bloqueo al 100%
  },
  [UserPlan.PREMIUM]: {
    maxRequests: -1, // Ilimitado
    softLimit: -1, // No aplica
    hardLimit: -1, // No aplica
  },
};

export const QUOTA_WARNING_MESSAGE =
  'Has usado el {percentage}% de tu cuota mensual de {maxRequests} interpretaciones de IA. Actualiza a Premium para interpretaciones ilimitadas.';

export const QUOTA_LIMIT_REACHED_MESSAGE =
  'Has alcanzado tu límite mensual de {maxRequests} interpretaciones de IA. Tu cuota se renovará el {resetDate}. Actualiza a Premium para interpretaciones ilimitadas.';
