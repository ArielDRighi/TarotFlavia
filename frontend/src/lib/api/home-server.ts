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
import type { ArticleCategory, ArticleSummary } from '@/types/encyclopedia-article.types';
import type { EditorialHomeData } from '@/types/home.types';

/** Cuántas guías muestra la portada (el backlog pide 4–6). */
export const LATEST_GUIDES_LIMIT = 6;

/**
 * Intercala las listas por categoría: primera de cada una, después la segunda
 * de cada una, y así. Con una guía por categoría (el caso de hoy) es el orden
 * editorial tal cual; si una categoría crece a seis artículos, la portada no
 * se llena sólo con ella.
 */
export function interleaveByCategory(
  byCategory: Partial<Record<ArticleCategory, ArticleSummary[]>>,
  categories: ArticleCategory[]
): ArticleSummary[] {
  const lists = categories.map((category) => byCategory[category] ?? []);
  const longest = Math.max(0, ...lists.map((list) => list.length));

  const result: ArticleSummary[] = [];
  for (let position = 0; position < longest; position += 1) {
    for (const list of lists) {
      if (list[position]) {
        result.push(list[position]);
      }
    }
  }
  return result;
}

/**
 * Las guías de la portada, intercaladas por categoría en el orden editorial
 * de `GUIDE_CATEGORIES`.
 *
 * Las guías no tienen fecha de publicación expuesta por la API (la fecha real
 * y el byline llegan con T-SEO-017), así que "últimas" es el orden editorial
 * del listado, no un orden cronológico. `undefined` si no resolvió ninguna
 * categoría, para que la sección muestre su estado vacío y no una grilla sin
 * tarjetas.
 */
async function getLatestGuides(): Promise<ArticleSummary[] | undefined> {
  const byCategory = await getArticlesByCategories(GUIDE_CATEGORIES);
  const guides = interleaveByCategory(byCategory, GUIDE_CATEGORIES).slice(0, LATEST_GUIDES_LIMIT);

  return guides.length > 0 ? guides : undefined;
}

/**
 * Convierte un rechazo en `undefined` con aviso. Los tres fetchers ya degradan
 * por su cuenta hoy, pero la promesa del módulo —una API caída vacía su
 * sección, no la portada— no puede depender de que eso siga siendo cierto.
 */
async function settle<T>(label: string, promise: Promise<T | undefined>): Promise<T | undefined> {
  try {
    return await promise;
  } catch (error) {
    console.warn(`[T-SEO-014] bloque "${label}" de la portada no resuelto:`, error);
    return undefined;
  }
}

export async function getEditorialHomeData(): Promise<EditorialHomeData> {
  const [dailyHoroscopes, dailyCard, latestGuides] = await Promise.all([
    settle('horóscopo', getCanonicalDailyHoroscopes()),
    settle('carta del día', getCanonicalDailyCard()),
    settle('guías', getLatestGuides()),
  ]);

  return { dailyHoroscopes, dailyCard, latestGuides };
}
