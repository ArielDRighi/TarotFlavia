import { ROUTES } from './routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * A qué ruta pertenece cada categoría de artículo de la enciclopedia.
 *
 * Vive acá (y no dentro del sitemap) porque lo consumen dos lados: el
 * `sitemap.ts` y las tarjetas que enlazan artículos. Un artículo NO vive en
 * `/enciclopedia/[slug]` — esa ruta es la ficha de carta, así que enlazarlo ahí
 * lleva a "Carta no encontrada".
 */
const ARTICLE_ROUTE_BY_CATEGORY: Record<ArticleCategory, (slug: string) => string> = {
  [ArticleCategory.ZODIAC_SIGN]: ROUTES.ENCICLOPEDIA_SIGNO,
  [ArticleCategory.PLANET]: ROUTES.ENCICLOPEDIA_PLANETA,
  [ArticleCategory.ASTROLOGICAL_HOUSE]: ROUTES.ENCICLOPEDIA_CASA,
  [ArticleCategory.ELEMENT]: ROUTES.ENCICLOPEDIA_ELEMENTO,
  [ArticleCategory.MODALITY]: ROUTES.ENCICLOPEDIA_ELEMENTO,
  [ArticleCategory.GUIDE_TAROT]: ROUTES.ENCICLOPEDIA_GUIA,
  [ArticleCategory.GUIDE_NUMEROLOGY]: ROUTES.ENCICLOPEDIA_GUIA,
  [ArticleCategory.GUIDE_PENDULUM]: ROUTES.ENCICLOPEDIA_GUIA,
  [ArticleCategory.GUIDE_BIRTH_CHART]: ROUTES.ENCICLOPEDIA_GUIA,
  [ArticleCategory.GUIDE_RITUAL]: ROUTES.ENCICLOPEDIA_GUIA,
  [ArticleCategory.GUIDE_HOROSCOPE]: ROUTES.ENCICLOPEDIA_GUIA,
  [ArticleCategory.GUIDE_CHINESE]: ROUTES.ENCICLOPEDIA_GUIA,
};

export function getArticlePath(category: ArticleCategory, slug: string): string {
  return ARTICLE_ROUTE_BY_CATEGORY[category](slug);
}

export const ARTICLE_CATEGORIES = Object.keys(ARTICLE_ROUTE_BY_CATEGORY) as ArticleCategory[];
