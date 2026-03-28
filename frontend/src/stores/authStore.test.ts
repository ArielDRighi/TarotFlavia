import { describe, it, expect, beforeEach, vi, type Mock, afterEach } from 'vitest';
import { useAuthStore } from './authStore';
import type { AuthUser } from '@/types';

// Mock the apiClient
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

// Mock custom toast wrapper
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock getGlobalQueryClient
const mockQueryClient = {
  clear: vi.fn(),
  invalidateQueries: vi.fn(),
};

vi.mock('@/lib/providers/react-query-provider', () => ({
  getGlobalQueryClient: vi.fn(() => mockQueryClient),
}));

// Import mocked modules
import { apiClient } from '@/lib/api/axios-config';
import { toast } from '@/hooks/utils/useToast';

// Mock user with all required fields from AuthUser type
const createMockUser = (overrides?: Partial<AuthUser>): AuthUser => ({
  id: 1,
  name: 'Test User',
  email: 'test@test.com',
  roles: ['USER'],
  plan: 'free',
  profilePicture: null,
  ...overrides,
});

// Helper to reset store completely
const resetStore = () => {
  useAuthStore.setState({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });
};

// Get localStorage mock for assertions
const getLocalStorageMock = () =>
  window.localStorage as unknown as {
    getItem: Mock;
    setItem: Mock;
    removeItem: Mock;
    clear: Mock;
  };

describe('authStore', () => {
  beforeEach(() => {
    // Clear all mocks
    vi.clearAllMocks();
    // Reset store state
    resetStore();
    // Reset queryClient mock
    mockQueryClient.clear.mockClear();
    mockQueryClient.invalidateQueries.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have null user by default', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should have isAuthenticated false by default', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should have isLoading true by default', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(true);
    });
  });

  describe('setUser', () => {
    it('should set user and isAuthenticated to true when user is provided', () => {
      const user = createMockUser();

      useAuthStore.getState().setUser(user);

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set user to null and isAuthenticated to false when null is provided', () => {
      // First set a user
      const user = createMockUser();
      useAuthStore.getState().setUser(user);

      // Then set to null
      useAuthStore.getState().setUser(null);

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('login', () => {
    it('should call API with email and password', async () => {
      const user = createMockUser();
      (apiClient.post as Mock).mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user,
        },
      });

      await useAuthStore.getState().login('test@test.com', 'password123');

      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@test.com',
        password: 'password123',
      });
    });

    it('should store tokens in localStorage on successful login', async () => {
      const user = createMockUser();
      const localStorageMock = getLocalStorageMock();
      (apiClient.post as Mock).mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user,
        },
      });

      await useAuthStore.getState().login('test@test.com', 'password123');

      expect(localStorageMock.setItem).toHaveBeenCalledWith('access_token', 'test-access-token');
      expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'test-refresh-token');
    });

    it('should set user and isAuthenticated on successful login', async () => {
      const user = createMockUser();
      (apiClient.post as Mock).mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user,
        },
      });

      await useAuthStore.getState().login('test@test.com', 'password123');

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
    });

    it('should show success toast on successful login', async () => {
      const user = createMockUser();
      (apiClient.post as Mock).mockResolvedValueOnce({
        data: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token',
          user,
        },
      });

      await useAuthStore.getState().login('test@test.com', 'password123');

      expect(toast.success).toHaveBeenCalledWith('Bienvenido');
    });

    it('should show error toast on failed login', async () => {
      (apiClient.post as Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      await expect(useAuthStore.getState().login('test@test.com', 'wrongpass')).rejects.toThrow(
        'Invalid credentials'
      );

      expect(toast.error).toHaveBeenCalledWith('Error al iniciar sesión');
    });

    it('should not store tokens on failed login', async () => {
      const localStorageMock = getLocalStorageMock();
      (apiClient.post as Mock).mockRejectedValueOnce(new Error('Invalid credentials'));

      try {
        await useAuthStore.getState().login('test@test.com', 'wrongpass');
      } catch {
        // Expected to throw
      }

      expect(localStorageMock.setItem).not.toHaveBeenCalledWith('access_token', expect.any(String));
      expect(localStorageMock.setItem).not.toHaveBeenCalledWith(
        'refresh_token',
        expect.any(String)
      );
    });
  });

  describe('logout', () => {
    it('should clear user and set isAuthenticated to false', () => {
      // First set a user
      const user = createMockUser();
      useAuthStore.getState().setUser(user);

      // Then logout
      useAuthStore.getState().logout();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear tokens from localStorage', () => {
      const localStorageMock = getLocalStorageMock();

      // Logout
      useAuthStore.getState().logout();

      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should clear React Query cache on logout', () => {
      // Act: logout
      useAuthStore.getState().logout();

      // Assert: queryClient.clear() was called
      expect(mockQueryClient.clear).toHaveBeenCalled();
      expect(mockQueryClient.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('checkAuth', () => {
    it('should set isLoading to false when no access_token exists', async () => {
      const localStorageMock = getLocalStorageMock();
      // Mock getItem to return null (no token)
      localStorageMock.getItem.mockReturnValueOnce(null);

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should call API to get user profile when access_token exists', async () => {
      const localStorageMock = getLocalStorageMock();
      const user = createMockUser();
      // Mock getItem to return a token
      localStorageMock.getItem.mockReturnValueOnce('valid-token');
      (apiClient.get as Mock).mockResolvedValueOnce({ data: user });

      await useAuthStore.getState().checkAuth();

      expect(apiClient.get).toHaveBeenCalledWith('/users/profile');
    });

    it('should set user and isAuthenticated when profile fetch succeeds', async () => {
      const localStorageMock = getLocalStorageMock();
      const user = createMockUser();
      // Mock getItem to return a token
      localStorageMock.getItem.mockReturnValueOnce('valid-token');
      (apiClient.get as Mock).mockResolvedValueOnce({ data: user });

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toEqual(user);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
    });

    it('should clear tokens and user when profile fetch fails', async () => {
      const localStorageMock = getLocalStorageMock();
      // Mock getItem to return a token
      localStorageMock.getItem.mockReturnValueOnce('invalid-token');
      (apiClient.get as Mock).mockRejectedValueOnce(new Error('Unauthorized'));

      await useAuthStore.getState().checkAuth();

      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('access_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });
  });

  describe('Persistence', () => {
    it('should configure persistence with correct storage key', () => {
      const localStorageMock = getLocalStorageMock();
      const user = createMockUser();

      useAuthStore.getState().setUser(user);

      // Check that setItem was called with auth-storage key
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth-storage', expect.any(String));
    });

    it('should only persist user and isAuthenticated, not isLoading', () => {
      const localStorageMock = getLocalStorageMock();
      // Clear any previous calls
      localStorageMock.setItem.mockClear();

      const user = createMockUser();
      useAuthStore.getState().setUser(user);

      // Get the persisted data from setItem call
      const setItemCalls = localStorageMock.setItem.mock.calls as Array<[string, string]>;
      const authStorageCall = setItemCalls.find((call) => call[0] === 'auth-storage');
      expect(authStorageCall).toBeDefined();

      const persistedData = JSON.parse(authStorageCall![1]);
      // Should have user and isAuthenticated
      expect(persistedData.state.user).toEqual(user);
      expect(persistedData.state.isAuthenticated).toBe(true);
      // Should NOT have isLoading
      expect(persistedData.state.isLoading).toBeUndefined();
    });
  });

  describe('AuthUser Type - No Limits Fields', () => {
    it('should not contain dailyCardCount field', () => {
      const user = createMockUser();
      expect('dailyCardCount' in user).toBe(false);
    });

    it('should not contain dailyCardLimit field', () => {
      const user = createMockUser();
      expect('dailyCardLimit' in user).toBe(false);
    });

    it('should not contain tarotReadingsCount field', () => {
      const user = createMockUser();
      expect('tarotReadingsCount' in user).toBe(false);
    });

    it('should not contain tarotReadingsLimit field', () => {
      const user = createMockUser();
      expect('tarotReadingsLimit' in user).toBe(false);
    });

    it('should not contain dailyReadingsCount field (legacy)', () => {
      const user = createMockUser();
      expect('dailyReadingsCount' in user).toBe(false);
    });

    it('should not contain dailyReadingsLimit field (legacy)', () => {
      const user = createMockUser();
      expect('dailyReadingsLimit' in user).toBe(false);
    });

    it('should only contain essential profile fields', () => {
      const user = createMockUser();
      const expectedKeys = ['id', 'email', 'name', 'roles', 'plan', 'profilePicture'];
      const actualKeys = Object.keys(user).sort();
      expect(actualKeys).toEqual(expectedKeys.sort());
    });
  });
});
