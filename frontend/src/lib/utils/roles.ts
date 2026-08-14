import type { AuthUser } from '@/types';

/**
 * Determina si un usuario tiene permisos de administración.
 *
 * Fuente única para todas las superficies que miran el rol admin (guard de `/admin`,
 * enlace del menú de cuenta), para que no puedan divergir.
 *
 * Acepta el rol por el array `roles` **o** por el booleano legacy `isAdmin`, igual que
 * `admin.guard.ts`. Es a propósito la lectura más permisiva de las dos que hay en el
 * backend: el punto de T-SEO-007 es que el front no deje afuera a un admin que la API
 * sí acepta.
 *
 * ⚠️ Matiz: `roles.guard.ts` —el que protege la mayoría de los endpoints del panel
 * (`admin/dashboard`, `admin/users`)— mira **solo** el array `roles` e ignora el
 * booleano. Una cuenta con `isAdmin: true` y sin el rol vería el panel y comería 403 en
 * cada request. Hoy no es alcanzable: `manage-user-roles.use-case.ts` sincroniza los dos
 * campos en ambos sentidos y los seeders escriben los dos. Si esa sincronización alguna
 * vez se rompe, esta función es el lugar donde sacar el fallback.
 */
export function isAdminUser(user: AuthUser | null | undefined): boolean {
  if (!user) return false;

  // Optional chaining defensivo: el `user` puede venir rehidratado del `localStorage`
  // de una versión anterior, sin el array `roles` que la API sí devuelve siempre.
  return user.roles?.includes('admin') === true || user.isAdmin === true;
}
