/**
 * Datos de `/carta-del-dia`, resueltos en el servidor (T-SEO-015).
 *
 * **Sólo para Server Components.** La ruta lo invoca y le pasa el resultado a
 * `DailyCardPage`. Los dos bloques se piden en paralelo y degradan por
 * separado (`settle`): si la ficha de hoy falla, el archivo se sirve igual, y
 * la guía de uso (`daily-card-guide.data.ts`) y la herramienta se sirven
 * siempre. Mismo criterio que `getEditorialHomeData`.
 */

import { getCanonicalDailyCard, getDailyCardArchive } from './daily-card-server';
import type { DailyCardPageData } from '@/types/home.types';

/**
 * Doble red a propósito: los dos fetchers ya degradan a `undefined` vía
 * `resolveListingData`, así que hoy este `catch` es inalcanzable salvo bug.
 * Igual que en `home-server.ts`, la promesa del módulo —un bloque caído no
 * tumba la página— no puede depender de que eso siga siendo cierto.
 */
async function settle<T>(label: string, promise: Promise<T | undefined>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error) {
    console.warn(`[T-SEO-015] bloque "${label}" de /carta-del-dia no resuelto:`, error);
    return undefined;
  }
}

export async function getDailyCardPageData(): Promise<DailyCardPageData> {
  const [today, archive] = await Promise.all([
    settle('carta de hoy', getCanonicalDailyCard()),
    settle('archivo', getDailyCardArchive()),
  ]);

  return { today, archive };
}
