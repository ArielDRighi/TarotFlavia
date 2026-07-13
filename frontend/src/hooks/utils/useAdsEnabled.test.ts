import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAdsEnabled } from './useAdsEnabled';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser, UserPlan } from '@/types';

const mockUsePathname = vi.hoisted(() => vi.fn<() => string>(() => '/'));

vi.mock('next/navigation', () => ({
  usePathname: () => mockUsePathname(),
}));

const ADSENSE_CLIENT = 'ca-pub-1234567890123456';

function buildUser(plan: UserPlan): AuthUser {
  return {
    id: 1,
    email: 'test@example.com',
    name: 'Test User',
    roles: ['user'],
    plan,
    profilePicture: null,
  };
}

function setAuthState(plan: UserPlan | null, hasHydrated: boolean): void {
  useAuthStore.setState({
    user: plan === null ? null : buildUser(plan),
    isAuthenticated: plan !== null,
    isLoading: false,
    _hasHydrated: hasHydrated,
  });
}

describe('useAdsEnabled', () => {
  beforeEach(() => {
    vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', ADSENSE_CLIENT);
    mockUsePathname.mockReturnValue('/');
    setAuthState(null, true);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe('gating por plan', () => {
    it('should enable ads for anonymous visitors', () => {
      setAuthState(null, true);

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(true);
      expect(result.current.clientId).toBe(ADSENSE_CLIENT);
    });

    it('should enable ads for free users', () => {
      setAuthState('free', true);

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(true);
    });

    it('should NEVER enable ads for premium users', () => {
      setAuthState('premium', true);

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('gating por hidratación', () => {
    it('should disable ads until the auth store has hydrated', () => {
      setAuthState('free', false);

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(false);
    });

    it('should disable ads before hydration even for a persisted premium user', () => {
      setAuthState('premium', false);

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('kill-switch por variable de entorno', () => {
    it('should disable ads when NEXT_PUBLIC_ADSENSE_CLIENT is not set', () => {
      vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', '');

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.clientId).toBeNull();
    });

    it('should treat a blank NEXT_PUBLIC_ADSENSE_CLIENT as not set', () => {
      vi.stubEnv('NEXT_PUBLIC_ADSENSE_CLIENT', '   ');

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(false);
      expect(result.current.clientId).toBeNull();
    });
  });

  describe('zonas excluidas', () => {
    it.each([
      ['/admin', 'panel de administración'],
      ['/admin/users', 'subruta de administración'],
      ['/premium', 'landing de compra'],
      ['/premium/activacion', 'activación de la suscripción'],
      ['/servicios/tarot-personalizado/pago', 'checkout de un servicio'],
      ['/servicios/pago-exitoso', 'retorno de pago'],
    ])('should disable ads on %s (%s)', (pathname) => {
      mockUsePathname.mockReturnValue(pathname);
      setAuthState('free', true);

      const { result } = renderHook(() => useAdsEnabled());

      expect(result.current.isEnabled).toBe(false);
    });

    it.each(['/', '/enciclopedia/el-loco', '/horoscopo/aries', '/historial'])(
      'should enable ads on the public route %s',
      (pathname) => {
        mockUsePathname.mockReturnValue(pathname);
        setAuthState('free', true);

        const { result } = renderHook(() => useAdsEnabled());

        expect(result.current.isEnabled).toBe(true);
      }
    );
  });
});
