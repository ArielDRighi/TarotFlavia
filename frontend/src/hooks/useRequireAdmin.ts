'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';
import { useRequireAuth } from './useRequireAuth';
import { ROUTES } from '@/lib/constants/routes';
import { isAdminUser } from '@/lib/utils/roles';

/**
 * Return type for useRequireAdmin hook
 */
export interface UseRequireAdminReturn {
  /** True mientras la sesión todavía no se resolvió (rehidratación + /users/profile) */
  isLoading: boolean;
  /** True solo cuando la sesión ya resolvió y el usuario tiene rol admin */
  isAdmin: boolean;
}

/**
 * Custom hook que protege las rutas del panel de administración.
 *
 * Compone `useRequireAuth` (autenticación) y le suma la verificación de rol:
 * - Sin sesión resuelta (`isLoading`), NO redirige. El store arranca en
 *   `user: null, isAuthenticated: false, isLoading: true`, así que decidir antes
 *   de que resuelva expulsa al admin de su propio panel (T-SEO-007).
 * - Sin autenticar → `useRequireAuth` redirige a `/login`.
 * - Autenticado pero sin rol admin → redirige a `/perfil`.
 *
 * @example
 * ```tsx
 * function AdminLayout({ children }: { children: React.ReactNode }) {
 *   const { isLoading, isAdmin } = useRequireAdmin();
 *
 *   if (isLoading) return <Spinner />;
 *   if (!isAdmin) return null;
 *
 *   return <>{children}</>;
 * }
 * ```
 */
export function useRequireAdmin(): UseRequireAdminReturn {
  // Delega autenticación (y la espera a que `isLoading` sea false) en el guard estándar
  const { isLoading } = useRequireAuth({ redirectTo: ROUTES.LOGIN });
  const { user } = useAuth();
  const router = useRouter();

  const isAdmin = isAdminUser(user);

  useEffect(() => {
    // Nunca decidir con la sesión a medio resolver
    if (isLoading) return;

    // Sin usuario, `useRequireAuth` ya se encarga de mandar a /login
    if (!user) return;

    if (!isAdmin) {
      router.push(ROUTES.PERFIL);
    }
  }, [isLoading, user, isAdmin, router]);

  return { isLoading, isAdmin: !isLoading && isAdmin };
}
