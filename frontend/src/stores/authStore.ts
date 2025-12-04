import { create } from 'zustand';

/**
 * User type for authentication
 */
export interface User {
  id: string;
  name: string;
  email: string;
}

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
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  setAuth: (user, token) => set({ user, token }),
  logout: () => set({ user: null, token: null }),
}));
