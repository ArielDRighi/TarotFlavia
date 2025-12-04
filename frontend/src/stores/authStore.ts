import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '@/types';

/**
 * AuthStore state interface
 */
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

/**
 * Zustand store for authentication state
 * Manages user session and authentication token
 *
 * NOTE: Currently using localStorage persistence for development.
 * Production auth strategy (JWT refresh, httpOnly cookies) will be
 * implemented in the authentication phase (FASE 3).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      setAuth: (user, token) => set({ user, token }),
      logout: () => set({ user: null, token: null }),
    }),
    {
      name: 'tarot-auth-storage',
    }
  )
);
