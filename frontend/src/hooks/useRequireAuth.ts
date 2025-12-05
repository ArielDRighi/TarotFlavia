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
 * Custom hook that protects pages requiring authentication
 *
 * Redirects to /login if user is not authenticated and not loading.
 * Returns isLoading to allow showing a spinner while verifying auth.
 *
 * @example
 * ```tsx
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
 */
export function useRequireAuth(): UseRequireAuthReturn {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Only redirect when we're sure the user is not authenticated
    // and auth check has completed (not loading)
    if (!isAuthenticated && !isLoading) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return { isLoading };
}
