/**
 * Datos de la portada editorial, resueltos en el servidor (T-SEO-014).
 *
 * **Sólo para Server Components.** Es lo único que `app/page.tsx` invoca: la
 * ruta no tiene lógica, se limita a pasar el resultado a `HomePageContent`.
 *
 * Los tres bloques se piden en paralelo y cada uno degrada por separado a
 * `undefined` (ver `resolveListingData`): una API caída durante el ISR vacía
 * su sección, no la portada. El texto propio de `home-editorial.data.ts` se
 * sirve siempre.
 */

import { getCanonicalDailyCard } from './daily-card-server';
import { getArticlesByCategories } from './encyclopedia-articles-api';
import { getCanonicalDailyHoroscopes } from './horoscope-server';
import { GUIDE_CATEGORIES } from '@/types/encyclopedia-article.types';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';
import type { EditorialHomeData } from '@/types/home.types';

/** Cuántas guías muestra la portada (el backlog pide 4–6). */
export const LATEST_GUIDES_LIMIT = 6;

/**
 * Las guías de la portada, en el orden editorial de `GUIDE_CATEGORIES`.
 *
 * Las guías no tienen fecha de publicación expuesta por la API (la fecha real
 * y el byline llegan con T-SEO-017), así que "últimas" es el orden editorial
 * del listado, no un orden cronológico. `undefined` si no resolvió ninguna
 * categoría, para que la sección muestre su estado vacío y no una grilla sin
 * tarjetas.
 */
async function getLatestGuides(): Promise<ArticleSummary[] | undefined> {
  const byCategory = await getArticlesByCategories(GUIDE_CATEGORIES);

  const guides = GUIDE_CATEGORIES.flatMap((category) => byCategory[category] ?? []).slice(
    0,
    LATEST_GUIDES_LIMIT
  );

  return guides.length > 0 ? guides : undefined;
}

export async function getEditorialHomeData(): Promise<EditorialHomeData> {
  const [dailyHoroscopes, dailyCard, latestGuides] = await Promise.all([
    getCanonicalDailyHoroscopes(),
    getCanonicalDailyCard(),
    getLatestGuides(),
  ]);

  return { dailyHoroscopes, dailyCard, latestGuides };
}
