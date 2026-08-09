import axios from 'axios';
import { notFound } from 'next/navigation';

/**
 * Helpers de datos para rutas dinámicas públicas.
 *
 * Existen para que las 5 rutas dinámicas no diverjan en el criterio de
 * degradación. La distinción que hacen es la que importa para SEO:
 *
 * - **404 de la API** → el recurso no existe → `notFound()`, que corta el render
 *   y sirve la página de no-encontrado en vez del recurso. Sin esto,
 *   `/enciclopedia/tarot/inventado` servía el título genérico heredado y sumaba
 *   otra URL al grupo de duplicadas que T-PROD-020 vino a deshacer.
 *
 *   ⚠️ Medido: hoy esas URLs responden **200** con la página de no-encontrado, no
 *   un 404 HTTP (soft-404). Es preexistente y afecta también a las rutas que ya
 *   están en producción; queda anotado como pendiente en T-PROD-024.
 * - **Cualquier otro error** (API caída, timeout, 5xx) → se propaga. Es
 *   deliberado: tragarlo dejaría prerenderizada —y cacheada por todo el ISR— una
 *   página con metadata heredada y el esqueleto vacío, exactamente el estado que
 *   Google marcó como duplicado. Es preferible fallar fuerte y visible.
 */

/** `true` solo si la API dijo explícitamente que el recurso no existe. */
export function isNotFoundError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 404;
}

/**
 * Resuelve el recurso de una ruta dinámica.
 *
 * @throws el error original si el fallo es transitorio (no un 404).
 */
export async function resolveRouteResource<T>(fetcher: () => Promise<T>): Promise<T> {
  try {
    return await fetcher();
  } catch (error) {
    if (isNotFoundError(error)) {
      notFound();
    }
    throw error;
  }
}

/**
 * Params de prerender que degradan a `[]` si la API no responde.
 *
 * Acá sí se traga el error: sin params la ruta pasa a renderizarse on-demand,
 * que es una degradación aceptable. Fallar el build entero porque la API estaba
 * caída un segundo no lo es.
 */
export async function safeStaticParams<T, P>(
  fetcher: () => Promise<T[]>,
  toParams: (item: T) => P
): Promise<P[]> {
  try {
    const items = await fetcher();
    return items.map(toParams);
  } catch {
    return [];
  }
}
