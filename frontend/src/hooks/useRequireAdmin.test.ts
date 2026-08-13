import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useRequireAdmin } from './useRequireAdmin';
import { useAuth } from './useAuth';
import { useRouter } from 'next/navigation';
import type { AuthUser } from '@/types';

// Mock useAuth hook (también es la fuente de useRequireAuth, que lo importa del mismo módulo)
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
}));

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  roles: ['consumer'],
  plan: 'free',
  profilePicture: null,
  ...overrides,
});

type MockAuthState = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
};

const mockAuth = ({ user, isAuthenticated, isLoading }: MockAuthState) => {
  vi.mocked(useAuth).mockReturnValue({
    user,
    isAuthenticated,
    isLoading,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    checkAuth: vi.fn(),
  });
};

describe('useRequireAdmin', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useRouter).mockReturnValue({
      push: mockPush,
      back: vi.fn(),
      forward: vi.fn(),
      refresh: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    });
  });

  describe('Sesión sin resolver (regresión T-SEO-007)', () => {
    it('NO debe redirigir mientras isLoading es true y user es null', () => {
      mockAuth({ user: null, isAuthenticated: false, isLoading: true });

      const { result } = renderHook(() => useRequireAdmin());

      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it('NO debe redirigir mientras isLoading es true aunque el usuario ya esté cargado', () => {
      mockAuth({
        user: createMockUser({ roles: ['consumer', 'admin'] }),
        isAuthenticated: true,
        isLoading: true,
      });

      renderHook(() => useRequireAdmin());

      expect(mockPush).not.toHaveBeenCalled();
    });

    it('debe redirigir recién cuando la sesión resuelve sin admin', () => {
      mockAuth({ user: null, isAuthenticated: false, isLoading: true });

      const { rerender } = renderHook(() => useRequireAdmin());
      expect(mockPush).not.toHaveBeenCalled();

      // La sesión resuelve: el usuario existe pero no es admin
      mockAuth({ user: createMockUser(), isAuthenticated: true, isLoading: false });
      rerender();

      expect(mockPush).toHaveBeenCalledWith('/perfil');
    });
  });

  describe('Sesión resuelta', () => {
    it('NO debe redirigir a un usuario con rol admin', () => {
      mockAuth({
        user: createMockUser({ roles: ['consumer', 'admin'] }),
        isAuthenticated: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useRequireAdmin());

      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it('debe redirigir a /perfil a un usuario autenticado sin rol admin', () => {
      mockAuth({ user: createMockUser(), isAuthenticated: true, isLoading: false });

      const { result } = renderHook(() => useRequireAdmin());

      expect(mockPush).toHaveBeenCalledWith('/perfil');
      expect(result.current.isAdmin).toBe(false);
    });

    it('debe redirigir a /login a un usuario no autenticado (delegado en useRequireAuth)', () => {
      mockAuth({ user: null, isAuthenticated: false, isLoading: false });

      renderHook(() => useRequireAdmin());

      expect(mockPush).toHaveBeenCalledWith('/login');
      expect(mockPush).not.toHaveBeenCalledWith('/perfil');
    });

    it('debe aceptar el booleano legacy isAdmin cuando el array roles no lo trae', () => {
      mockAuth({
        user: createMockUser({ roles: ['consumer'], isAdmin: true }),
        isAuthenticated: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useRequireAdmin());

      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.isAdmin).toBe(true);
    });

    it('no debe romperse si el usuario llega sin array roles', () => {
      const userWithoutRoles = { ...createMockUser() };
      delete (userWithoutRoles as Partial<AuthUser>).roles;
      mockAuth({
        user: userWithoutRoles as AuthUser,
        isAuthenticated: true,
        isLoading: false,
      });

      const { result } = renderHook(() => useRequireAdmin());

      expect(result.current.isAdmin).toBe(false);
      expect(mockPush).toHaveBeenCalledWith('/perfil');
    });
  });
});
