'use client';

import { useAuthStore } from '@/stores/authStore';
import type { AuthUser, RegisterCredentials } from '@/types';

/**
 * Return type for useAuth hook
 */
export interface UseAuthReturn {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

/**
 * Custom hook that facilitates the use of auth store in components
 *
 * Provides a simplified interface to access authentication state and actions
 * from the Zustand auth store.
 *
 * @example
 * ```tsx
 * function ProfilePage() {
 *   const { user, isAuthenticated, logout } = useAuth();
 *
 *   if (!isAuthenticated) {
 *     return <p>Please log in</p>;
 *   }
 *
 *   return (
 *     <div>
 *       <p>Welcome, {user?.name}</p>
 *       <button onClick={logout}>Logout</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAuth(): UseAuthReturn {
  const { user, isAuthenticated, isLoading, login, register, logout, checkAuth } = useAuthStore();

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    checkAuth,
  };
}
