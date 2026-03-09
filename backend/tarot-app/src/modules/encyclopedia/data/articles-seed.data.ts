import { ArticleSeedData } from './articles-seed.types';
import { ZODIAC_SIGNS } from './zodiac-signs.data';
import { PLANETS } from './planets.data';
import { ASTROLOGICAL_HOUSES } from './astrological-houses.data';
import { ELEMENTS, MODALITIES } from './elements-modalities.data';
import { ACTIVITY_GUIDES } from './activity-guides.data';
import { getArticleRelations } from './article-relations.data';

/**
 * Todos los artículos de la Enciclopedia Mística combinados.
 *
 * Composición:
 *  - 12 Signos zodiacales     (ZODIAC_SIGN)
 *  - 10 Planetas              (PLANET)
 *  - 12 Casas astrológicas    (ASTROLOGICAL_HOUSE)
 *  -  4 Elementos             (ELEMENT)
 *  -  3 Modalidades           (MODALITY)
 *  -  6 Guías de actividades  (GUIDE_*)
 *  ──────────────────────────
 *    47 artículos en total (ajustable si el backlog cambia)
 */
export type { ArticleSeedData };

/**
 * Todos los artículos con relaciones aplicadas
 */
export const ALL_ARTICLES_DATA: ArticleSeedData[] = [
  ...ZODIAC_SIGNS,
  ...PLANETS,
  ...ASTROLOGICAL_HOUSES,
  ...ELEMENTS,
  ...MODALITIES,
  ...ACTIVITY_GUIDES,
].map((article) => ({
  ...article,
  relatedArticles: article.relatedArticles ?? getArticleRelations(article.slug),
}));

/** Constante de conveniencia usada en el seeder para logging */
export const TOTAL_ARTICLES = ALL_ARTICLES_DATA.length;
