import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAuth } from './useAuth';
import { useAuthStore } from '@/stores/authStore';
import type { AuthUser } from '@/types';

// Mock the auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: vi.fn(),
}));

// Mock user for testing
const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  roles: ['USER'],
  plan: 'free',
  profilePicture: null,
  ...overrides,
});

describe('useAuth', () => {
  const mockLogin = vi.fn();
  const mockLogout = vi.fn();
  const mockCheckAuth = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock implementation - not authenticated
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      logout: mockLogout,
      checkAuth: mockCheckAuth,
      setUser: vi.fn(),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('user property', () => {
    it('should return null when user is not authenticated', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toBeNull();
    });

    it('should return user when authenticated', () => {
      const mockUser = createMockUser();
      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        checkAuth: mockCheckAuth,
        setUser: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.user).toEqual(mockUser);
    });
  });

  describe('isAuthenticated property', () => {
    it('should return false when not authenticated', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
    });

    it('should return true when authenticated', () => {
      const mockUser = createMockUser();
      vi.mocked(useAuthStore).mockReturnValue({
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        logout: mockLogout,
        checkAuth: mockCheckAuth,
        setUser: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('isLoading property', () => {
    it('should return false when not loading', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(false);
    });

    it('should return true when loading', () => {
      vi.mocked(useAuthStore).mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: true,
        login: mockLogin,
        logout: mockLogout,
        checkAuth: mockCheckAuth,
        setUser: vi.fn(),
      });

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe('login function', () => {
    it('should call login from store with email and password', async () => {
      mockLogin.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.login('test@test.com', 'password123');
      });

      expect(mockLogin).toHaveBeenCalledWith('test@test.com', 'password123');
      expect(mockLogin).toHaveBeenCalledTimes(1);
    });
  });

  describe('logout function', () => {
    it('should call logout from store', () => {
      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.logout();
      });

      expect(mockLogout).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkAuth function', () => {
    it('should call checkAuth from store', async () => {
      mockCheckAuth.mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.checkAuth();
      });

      expect(mockCheckAuth).toHaveBeenCalledTimes(1);
    });
  });

  describe('return type', () => {
    it('should return all expected properties', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('isAuthenticated');
      expect(result.current).toHaveProperty('isLoading');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('checkAuth');
    });

    it('should have correct types for all properties', () => {
      const { result } = renderHook(() => useAuth());

      expect(typeof result.current.isAuthenticated).toBe('boolean');
      expect(typeof result.current.isLoading).toBe('boolean');
      expect(typeof result.current.login).toBe('function');
      expect(typeof result.current.logout).toBe('function');
      expect(typeof result.current.checkAuth).toBe('function');
    });
  });
});
