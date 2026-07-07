import { AI_MONTHLY_QUOTAS } from './ai-usage.constants';
import { UserPlan } from '../../users/entities/user.entity';

/**
 * T-FBK-006: Coherencia de la cuota de IA (fuente de verdad única).
 *
 * Regla de negocio (decisión de Ariel): Free NO consume IA (interpretaciones
 * desde contenido existente en la DB); la IA es exclusiva de Premium.
 * Fuente de verdad: FREE aiQuota = 0, PREMIUM ilimitado (-1).
 *
 * Estos tests fijan la coherencia entre el enforcement (esta constante), la
 * seed de la DB (plans.seeder) y la UI (premium-only).
 */
describe('AI_MONTHLY_QUOTAS (coherencia de cuota)', () => {
  describe('ANONYMOUS', () => {
    it('no tiene IA (cuota 0 en todos los límites)', () => {
      const quota = AI_MONTHLY_QUOTAS[UserPlan.ANONYMOUS];
      expect(quota.maxRequests).toBe(0);
      expect(quota.softLimit).toBe(0);
      expect(quota.hardLimit).toBe(0);
    });
  });

  describe('FREE', () => {
    it('no consume IA: cuota de enforcement = 0 (coherente con seed y UI premium-only)', () => {
      const quota = AI_MONTHLY_QUOTAS[UserPlan.FREE];
      expect(quota.maxRequests).toBe(0);
      expect(quota.softLimit).toBe(0);
      expect(quota.hardLimit).toBe(0);
    });
  });

  describe('PREMIUM', () => {
    it('tiene IA ilimitada: cuota mensual de IA = -1 (único criterio, coherente con la seed)', () => {
      const quota = AI_MONTHLY_QUOTAS[UserPlan.PREMIUM];
      expect(quota.maxRequests).toBe(-1);
    });
  });
});
