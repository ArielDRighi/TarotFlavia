import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRequireAuth } from './useRequireAuth';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/types';

// Mock useAuth hook
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock user for testing
const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  roles: ['USER'],
  plan: 'FREE',
  dailyReadingsCount: 0,
  dailyReadingsLimit: 3,
  ...overrides,
});

describe('useRequireAuth', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default router mock
    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });

    // Default useAuth mock - not authenticated, not loading
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: vi.fn(),
      register: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('redirection behavior', () => {
    it('should redirect to /login when not authenticated and not loading', async () => {
      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });

    it('should NOT redirect when authenticated', () => {
      const mockUser = createMockUser();
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      renderHook(() => useRequireAuth());

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should NOT redirect when still loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      renderHook(() => useRequireAuth());

      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  describe('isLoading return value', () => {
    it('should return isLoading true when auth is loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should return isLoading false when authenticated', () => {
      const mockUser = createMockUser();
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return isLoading false when not authenticated and not loading', () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('custom redirect options', () => {
    it('should redirect to custom path with query params when provided', async () => {
      renderHook(() =>
        useRequireAuth({
          redirectTo: '/registro',
          redirectQuery: { message: 'register-for-readings' },
        })
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/registro?message=register-for-readings');
      });
    });

    it('should redirect to custom path without query params', async () => {
      renderHook(() =>
        useRequireAuth({
          redirectTo: '/custom-page',
        })
      );

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/custom-page');
      });
    });

    it('should default to /login when no redirect options provided', async () => {
      renderHook(() => useRequireAuth());

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });

  describe('return type', () => {
    it('should return object with isLoading property', () => {
      const { result } = renderHook(() => useRequireAuth());

      expect(result.current).toHaveProperty('isLoading');
      expect(typeof result.current.isLoading).toBe('boolean');
    });
  });

  describe('state transitions', () => {
    it('should handle transition from loading to authenticated', async () => {
      // Start loading
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();

      // Finish loading - authenticated
      const mockUser = createMockUser();
      vi.mocked(useAuth).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      rerender();

      expect(result.current.isLoading).toBe(false);
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should handle transition from loading to not authenticated', async () => {
      // Start loading
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      const { result, rerender } = renderHook(() => useRequireAuth());

      expect(result.current.isLoading).toBe(true);
      expect(mockPush).not.toHaveBeenCalled();

      // Finish loading - not authenticated
      vi.mocked(useAuth).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        login: vi.fn(),
        register: vi.fn(),
        logout: vi.fn(),
        checkAuth: vi.fn(),
      });

      rerender();

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login');
      });
    });
  });
});
