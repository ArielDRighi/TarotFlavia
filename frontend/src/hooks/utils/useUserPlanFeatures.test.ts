import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserPlanFeatures } from './useUserPlanFeatures';
import * as authHook from '../useAuth';
import * as capabilitiesHook from '../api/useUserCapabilities';
import type { AuthUser, UserCapabilities } from '@/types';

// Mock useAuth
vi.mock('../useAuth');

// Mock useUserCapabilities — the primary source of truth for the plan.
vi.mock('../api/useUserCapabilities');

/** Build a capabilities query result stub for a given plan. */
const capabilitiesFor = (plan: UserCapabilities['plan']) =>
  ({ data: { plan } as UserCapabilities }) as ReturnType<
    typeof capabilitiesHook.useUserCapabilities
  >;

describe('useUserPlanFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: capabilities not loaded yet → hook falls back to authStore plan,
    // which keeps the plan-derivation assertions below driven by useAuth.
    vi.mocked(capabilitiesHook.useUserCapabilities).mockReturnValue({
      data: undefined,
    } as ReturnType<typeof capabilitiesHook.useUserCapabilities>);
  });

  describe('ANONYMOUS plan', () => {
    it('should return correct permissions for anonymous user', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan: 'anonymous' } as AuthUser,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.canUseAI).toBe(false);
      expect(result.current.canUseCategories).toBe(false);
      expect(result.current.canUseCustomQuestions).toBe(false);
      expect(result.current.canShare).toBe(false);
      expect(result.current.isPremium).toBe(false);
      expect(result.current.isFree).toBe(false);
      expect(result.current.isAnonymous).toBe(true);
      // Note: dailyReadingsLimit removed - use useUserCapabilities() for limits
    });
  });

  describe('FREE plan', () => {
    it('should return correct permissions for free user', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan: 'free' } as AuthUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.canUseAI).toBe(false);
      expect(result.current.canUseCategories).toBe(false);
      expect(result.current.canUseCustomQuestions).toBe(false);
      expect(result.current.canShare).toBe(true);
      expect(result.current.isPremium).toBe(false);
      expect(result.current.isFree).toBe(true);
      expect(result.current.isAnonymous).toBe(false);
      // Note: dailyReadingsLimit removed - use useUserCapabilities() for limits
    });
  });

  describe('PREMIUM plan', () => {
    it('should return correct permissions for premium user', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan: 'premium' } as AuthUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.canUseAI).toBe(true);
      expect(result.current.canUseCategories).toBe(true);
      expect(result.current.canUseCustomQuestions).toBe(true);
      expect(result.current.canShare).toBe(true);
      expect(result.current.isPremium).toBe(true);
      expect(result.current.isFree).toBe(false);
      expect(result.current.isAnonymous).toBe(false);
      // Note: dailyReadingsLimit removed - use useUserCapabilities() for limits
    });
  });

  describe('No user (null)', () => {
    it('should default to anonymous permissions when user is null', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.canUseAI).toBe(false);
      expect(result.current.canUseCategories).toBe(false);
      expect(result.current.canUseCustomQuestions).toBe(false);
      expect(result.current.canShare).toBe(false);
      expect(result.current.isPremium).toBe(false);
      expect(result.current.isFree).toBe(false);
      expect(result.current.isAnonymous).toBe(true);
      // Note: dailyReadingsLimit removed - use useUserCapabilities() for limits
    });
  });

  describe('Plan labels', () => {
    it('should return correct Spanish label for anonymous', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan: 'anonymous' } as AuthUser,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());
      expect(result.current.planLabel).toBe('ANÓNIMO');
    });

    it('should return correct Spanish label for free', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan: 'free' } as AuthUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());
      expect(result.current.planLabel).toBe('GRATUITO');
    });

    it('should return correct Spanish label for premium', () => {
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan: 'premium' } as AuthUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useUserPlanFeatures());
      expect(result.current.planLabel).toBe('PREMIUM');
    });
  });

  describe('source of truth: capabilities.plan over authStore.plan', () => {
    const asUser = (plan: AuthUser['plan']) =>
      vi.mocked(authHook.useAuth).mockReturnValue({
        user: { plan } as AuthUser,
        isAuthenticated: plan !== 'anonymous',
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

    it('reflects a premium upgrade from capabilities even if authStore still says free', () => {
      // Scenario: webhook upgraded the user to premium but the persisted JWT/user
      // in authStore is still 'free' (no re-login). Gating must follow capabilities.
      asUser('free');
      vi.mocked(capabilitiesHook.useUserCapabilities).mockReturnValue(capabilitiesFor('premium'));

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.isPremium).toBe(true);
      expect(result.current.canUseAI).toBe(true);
      expect(result.current.plan).toBe('premium');
    });

    it('reflects a downgrade to free from capabilities even if authStore still says premium', () => {
      // Scenario: premium expired server-side; authStore is stale premium.
      asUser('premium');
      vi.mocked(capabilitiesHook.useUserCapabilities).mockReturnValue(capabilitiesFor('free'));

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.isPremium).toBe(false);
      expect(result.current.isFree).toBe(true);
      expect(result.current.canUseAI).toBe(false);
    });

    it('falls back to authStore plan while capabilities is loading (no flash of anonymous)', () => {
      asUser('premium');
      vi.mocked(capabilitiesHook.useUserCapabilities).mockReturnValue({
        data: undefined,
      } as ReturnType<typeof capabilitiesHook.useUserCapabilities>);

      const { result } = renderHook(() => useUserPlanFeatures());

      expect(result.current.isPremium).toBe(true);
    });
  });
});
