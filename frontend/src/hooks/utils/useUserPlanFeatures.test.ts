import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserPlanFeatures } from './useUserPlanFeatures';
import * as authHook from '../useAuth';
import type { AuthUser } from '@/types';

// Mock useAuth
vi.mock('../useAuth');

describe('useUserPlanFeatures', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
      expect(result.current.dailyReadingsLimit).toBe(1);
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
      expect(result.current.dailyReadingsLimit).toBe(2);
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
      expect(result.current.dailyReadingsLimit).toBe(3);
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
      expect(result.current.dailyReadingsLimit).toBe(1);
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
});
