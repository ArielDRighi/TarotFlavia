'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

/**
 * Return type for useRequireAuth hook
 */
export interface UseRequireAuthReturn {
  isLoading: boolean;
}

/**
 * Options for useRequireAuth hook
 */
export interface UseRequireAuthOptions {
  /**
   * Path to redirect to when user is not authenticated
   * @default '/login'
   */
  redirectTo?: string;

  /**
   * Query parameters to append to redirect URL
   * @example { message: 'register-for-readings' } → '/registro?message=register-for-readings'
   */
  redirectQuery?: Record<string, string>;
}

/**
 * Custom hook that protects pages requiring authentication
 *
 * Redirects to /login (or custom path) if user is not authenticated and not loading.
 * Returns isLoading to allow showing a spinner while verifying auth.
 *
 * @param options - Optional configuration for redirect behavior
 *
 * @example
 * ```tsx
 * // Default behavior (redirect to /login)
 * function ProtectedPage() {
 *   const { isLoading } = useRequireAuth();
 *
 *   if (isLoading) {
 *     return <Spinner />;
 *   }
 *
 *   return <div>Protected content</div>;
 * }
 * ```
 *
 * @example
 * ```tsx
 * // Custom redirect with query params
 * function RitualPage() {
 *   const { isLoading } = useRequireAuth({
 *     redirectTo: '/registro',
 *     redirectQuery: { message: 'register-for-readings' }
 *   });
 *
 *   if (isLoading) return <Spinner />;
 *   return <div>Ritual content</div>;
 * }
 * ```
 */
export function useRequireAuth(options?: UseRequireAuthOptions): UseRequireAuthReturn {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect when we're sure the user is not authenticated
    // and auth check has completed (not loading)
    if (!isAuthenticated && !isLoading) {
      const redirectTo = options?.redirectTo ?? '/login';
      const query = options?.redirectQuery;

      let redirectUrl = redirectTo;

      if (query && Object.keys(query).length > 0) {
        const params = new URLSearchParams(query);
        redirectUrl = `${redirectTo}?${params.toString()}`;
      }

      router.push(redirectUrl);
    }
  }, [isAuthenticated, isLoading, router, options?.redirectTo, options?.redirectQuery]);

  return { isLoading };
}
