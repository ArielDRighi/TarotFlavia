'use client';

import { useEffect, type ReactNode } from 'react';
import { useAuthStore } from '@/stores/authStore';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Authentication Provider
 *
 * Initializes authentication state by calling checkAuth on mount.
 * This ensures the auth state is verified when the app loads.
 * Shows a loading spinner until authentication is validated.
 *
 * Handles Zustand hydration to prevent stale auth state issues.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const checkAuth = useAuthStore((state) => state.checkAuth);
  const isLoading = useAuthStore((state) => state.isLoading);
  const hasHydrated = useAuthStore((state) => state._hasHydrated);

  useEffect(() => {
    // Only check auth after Zustand has hydrated from localStorage
    if (hasHydrated) {
      checkAuth();
    }
  }, [checkAuth, hasHydrated]);

  // Show loading state while:
  // 1. Zustand is hydrating from localStorage
  // 2. checkAuth is validating the session
  if (!hasHydrated || isLoading) {
    return (
      <div className="bg-bg-main flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-4 border-t-transparent" />
          <p className="text-text-muted text-sm">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
