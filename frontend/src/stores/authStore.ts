import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from '@/hooks/utils/useToast';
import { apiClient } from '@/lib/api/axios-config';
import type { AuthUser, AuthStore, LoginResponse } from '@/types';

/**
 * Zustand store for authentication state
 * Manages user session, authentication status, and auth actions
 *
 * Features:
 * - Login/logout with API integration
 * - Token management in localStorage
 * - Session verification with checkAuth
 * - Persistence of user and isAuthenticated state
 */
export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: true,

      // Actions
      setUser: (user: AuthUser | null) => {
        set({
          user,
          isAuthenticated: user !== null,
        });
      },

      login: async (email: string, password: string) => {
        try {
          const response = await apiClient.post<LoginResponse>('/auth/login', {
            email,
            password,
          });

          const { access_token, refresh_token, user } = response.data;

          // Store tokens in localStorage (SSR safety check)
          if (typeof window !== 'undefined') {
            localStorage.setItem('access_token', access_token);
            localStorage.setItem('refresh_token', refresh_token);
          }

          // Update store state
          get().setUser(user);

          toast.success('Bienvenido');
        } catch (error) {
          toast.error('Error al iniciar sesión');
          throw error;
        }
      },

      logout: () => {
        // Clear tokens from localStorage (SSR safety check)
        if (typeof window !== 'undefined') {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }

        // Clear user state
        set({
          user: null,
          isAuthenticated: false,
        });
      },

      checkAuth: async () => {
        try {
          // SSR safety check
          const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

          if (!token) {
            set({ isLoading: false });
            return;
          }

          const response = await apiClient.get<AuthUser>('/users/profile');
          get().setUser(response.data);
        } catch {
          // Clear invalid tokens (SSR safety check)
          if (typeof window !== 'undefined') {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
          }
          get().setUser(null);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
