import type { AuthUser } from '@/types';

/**
 * Determina si un usuario tiene permisos de administración.
 *
 * Acepta el rol por el array `roles` **o** por el booleano legacy `isAdmin`, igual que
 * `admin.guard.ts` en el backend: hay cuentas que traen los dos y el front no puede ser
 * más estricto que la API que le responde.
 *
 * Fuente única para todas las superficies que miran el rol admin (guard de `/admin`,
 * enlace del menú de cuenta), para que no puedan divergir.
 */
export function isAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;

  return user.roles?.includes('admin') === true || user.isAdmin === true;
}
