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
 * Resuelve los datos de una ruta de **listado**, degradando a `undefined` si la
 * API falla (T-SEO-003).
 *
 * El criterio es el opuesto al de `resolveRouteResource`, y la diferencia es
 * deliberada: una ficha sin su recurso no tiene nada que mostrar, así que
 * conviene fallar fuerte antes que cachear un esqueleto. Un listado, en cambio,
 * tiene contenido propio —su introducción editorial— que sirve igual, y el
 * cliente reintenta el fetch al montar. Tirar abajo el render (y con él el
 * prerender de la ruta) por un blip de la API sería peor que servir el listado
 * vacío con su texto.
 */
export async function resolveListingData<T>(fetcher: () => Promise<T>): Promise<T | undefined> {
  try {
    return await fetcher();
  } catch (error) {
    // Degradar en silencio sería un modo de falla invisible: con el ISR, una
    // caída de un segundo deja la ruta cacheada sin listado hasta 24 h y nadie
    // se entera hasta correr `check:indexable` a mano. T-SEO-001 cerró esta
    // clase de agujero; el log queda en el build y en los logs del servidor.
    console.warn('[T-SEO-003] listado no resuelto en el servidor:', error);
    return undefined;
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
