/**
 * Home Types (T-SEO-014)
 *
 * Datos que la portada editorial recibe ya resueltos desde el servidor. Viven
 * acá y no en `lib/api/home-server.ts` para que `HomePageContent` —un client
 * component— pueda tiparlos sin importar el módulo server.
 */

import type { CardDetail } from './encyclopedia.types';
import type { ArticleSummary } from './encyclopedia-article.types';
import type { CanonicalDailyHoroscopes } from './horoscope.types';

/**
 * La carta del día de la portada, elegida de forma determinista para el día
 * canónico del sitio (Buenos Aires).
 *
 * No es la carta personal que `/carta-del-dia` sortea por visitante: es una
 * sola para todo el sitio, así el HTML servido —cacheado por ISR— muestra la
 * misma carta a todos y el crawler ve contenido fechado y estable.
 */
export interface CanonicalDailyCard {
  /** Día calendario canónico ('YYYY-MM-DD') para el que se eligió la carta. */
  canonicalDate: string;
  card: CardDetail;
}

/**
 * Todo lo que la portada resuelve en el servidor.
 *
 * Cada bloque degrada por separado a `undefined`: si la API del horóscopo falla
 * la portada igual muestra la carta y las guías, y viceversa. El texto
 * editorial propio (`home-editorial.data.ts`) se renderiza siempre.
 */
export interface EditorialHomeData {
  dailyHoroscopes: CanonicalDailyHoroscopes | undefined;
  dailyCard: CanonicalDailyCard | undefined;
  /** Hasta `LATEST_GUIDES_LIMIT` guías, en el orden editorial de `GUIDE_CATEGORIES`. */
  latestGuides: ArticleSummary[] | undefined;
}
