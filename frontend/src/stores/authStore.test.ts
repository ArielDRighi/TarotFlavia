import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { User } from '@/types';

// Mock user with all required fields from User type
const createMockUser = (overrides?: Partial<User>): User => ({
  id: '1',
  name: 'Test User',
  email: 'test@test.com',
  role: 'USER',
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
  ...overrides,
});

describe('authStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useAuthStore.setState({ user: null, token: null });
    // Clear localStorage to reset persist state
    localStorage.removeItem('tarot-auth-storage');
  });

  describe('Initial State', () => {
    it('should have null user by default', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have null token by default', () => {
      const state = useAuthStore.getState();
      expect(state.token).toBeNull();
    });
  });

  describe('setAuth', () => {
    it('should set user and token', () => {
      const user = createMockUser();
      const token = 'test-token';

      useAuthStore.getState().setAuth(user, token);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.token).toBe(token);
    });
  });

  describe('logout', () => {
    it('should clear user and token', () => {
      // First set a user
      const user = createMockUser();
      useAuthStore.getState().setAuth(user, 'token');

      // Then logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
    });
  });
});
