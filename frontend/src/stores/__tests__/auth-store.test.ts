import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAuthStore } from '../authStore';
import type { AuthUser } from '@/types';

/**
 * SMOKE TESTS - Auth Store
 *
 * Pruebas básicas para verificar que el store de autenticación funciona correctamente.
 * Estos tests son rápidos y simples, enfocados en la funcionalidad crítica del estado.
 */

// Mock apiClient para evitar llamadas reales
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock toast personalizado
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper para crear un usuario mock con todos los campos requeridos
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

// Helper para resetear el store completamente
const resetStore = () => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
};

describe('Auth Store - Smoke Tests', () => {
  beforeEach(() => {
    // Limpiar mocks y resetear el store antes de cada test
    vi.clearAllMocks();
    resetStore();
  });

  describe('Estado Inicial', () => {
    it('should have isAuthenticated false by default', () => {
      const state = useAuthStore.getState();

      // El estado inicial debe ser no autenticado
      expect(state.isAuthenticated).toBe(false);
    });

    it('should have null user by default', () => {
      const state = useAuthStore.getState();

      // El usuario inicial debe ser null
      expect(state.user).toBeNull();
    });
  });

  describe('setUser Action', () => {
    it('should update user state correctly', () => {
      const mockUser = createMockUser();

      // Ejecutar la acción setUser
      useAuthStore.getState().setUser(mockUser);

      // Verificar que el estado se actualizó
      const state = useAuthStore.getState();
      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to true when user is provided', () => {
      const mockUser = createMockUser();

      // Setear un usuario
      useAuthStore.getState().setUser(mockUser);

      // Verificar que isAuthenticated es true
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set isAuthenticated to false when user is null', () => {
      // Primero setear un usuario
      const mockUser = createMockUser();
      useAuthStore.getState().setUser(mockUser);

      // Luego setear null
      useAuthStore.getState().setUser(null);

      // Verificar que isAuthenticated es false
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
    });
  });

  describe('logout Action', () => {
    it('should clear user state', () => {
      // Primero setear un usuario
      const mockUser = createMockUser();
      useAuthStore.getState().setUser(mockUser);

      // Ejecutar logout
      useAuthStore.getState().logout();

      // Verificar que el usuario se limpió
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should set isAuthenticated to false', () => {
      // Primero setear un usuario autenticado
      const mockUser = createMockUser();
      useAuthStore.getState().setUser(mockUser);

      // Ejecutar logout
      useAuthStore.getState().logout();

      // Verificar que isAuthenticated es false
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear tokens from localStorage', () => {
      // Get localStorage mock for assertions
      const localStorageMock = window.localStorage as unknown as {
        removeItem: ReturnType<typeof vi.fn>;
      };

      // Ejecutar logout
      useAuthStore.getState().logout();

      // Verificar que se removieron los tokens
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });
});
