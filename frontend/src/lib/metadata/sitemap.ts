import type { MetadataRoute } from 'next';
import { getCards } from '@/lib/api/encyclopedia-api';
import { getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getHolisticServices } from '@/lib/api/holistic-services-api';
import { getRituals } from '@/lib/api/rituals-api';
import { ROUTES } from '@/lib/constants/routes';
import { getAllChineseZodiacAnimals } from '@/lib/utils/chinese-zodiac';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ZodiacSign } from '@/types/horoscope.types';
import { getBaseUrl } from './base-url';

type Priority = 1 | 0.9 | 0.8 | 0.7 | 0.6 | 0.5 | 0.3;
type ChangeFrequency = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/** Rutas públicas fijas. Las privadas quedan fuera a propósito: ver `robots.ts`. */
const STATIC_ROUTES: ReadonlyArray<{
  path: string;
  priority: Priority;
  changeFrequency: ChangeFrequency;
}> = [
  { path: ROUTES.HOME, priority: 1, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA, priority: 0.9, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA_TAROT, priority: 0.9, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA_ASTROLOGIA, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA_ASTROLOGIA_SIGNOS, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA_ASTROLOGIA_PLANETAS, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA_ASTROLOGIA_CASAS, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.ENCICLOPEDIA_GUIAS, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.HOROSCOPO, priority: 0.9, changeFrequency: 'daily' },
  { path: ROUTES.HOROSCOPO_CHINO, priority: 0.8, changeFrequency: 'daily' },
  { path: ROUTES.CARTA_DEL_DIA, priority: 0.8, changeFrequency: 'daily' },
  { path: ROUTES.CARTA_ASTRAL, priority: 0.7, changeFrequency: 'monthly' },
  { path: ROUTES.NUMEROLOGIA, priority: 0.7, changeFrequency: 'monthly' },
  { path: ROUTES.PENDULO, priority: 0.7, changeFrequency: 'monthly' },
  { path: ROUTES.RITUALES, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.SERVICIOS, priority: 0.8, changeFrequency: 'weekly' },
  { path: ROUTES.EXPLORAR, priority: 0.7, changeFrequency: 'weekly' },
  { path: ROUTES.PREMIUM, priority: 0.7, changeFrequency: 'monthly' },
  { path: ROUTES.CONTACTO, priority: 0.5, changeFrequency: 'yearly' },
  { path: ROUTES.PRIVACIDAD, priority: 0.3, changeFrequency: 'yearly' },
  { path: ROUTES.TERMINOS, priority: 0.3, changeFrequency: 'yearly' },
];

/**
 * A qué ruta pertenece cada categoría de artículo de la enciclopedia.
 * Elementos y modalidades comparten `/enciclopedia/elementos`; las 7 guías,
 * `/enciclopedia/guias`.
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

/**
 * El sitemap se genera en el servidor (build o request). Si la API no responde,
 * la sección cae vacía en vez de tirar abajo el build: es preferible un sitemap
 * incompleto a un deploy fallido.
 */
async function safeSlugs<T extends { slug: string }>(
  fetcher: () => Promise<T[]>
): Promise<string[]> {
  try {
    const items = await fetcher();
    return items.map((item) => item.slug);
  } catch {
    return [];
  }
}

export async function buildSitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getBaseUrl();
  const lastModified = new Date();

  const entry = (
    path: string,
    priority: Priority,
    changeFrequency: ChangeFrequency
  ): MetadataRoute.Sitemap[number] => ({
    url: `${baseUrl}${path}`,
    lastModified,
    changeFrequency,
    priority,
  });

  const [cardSlugs, articleEntries, ritualSlugs, serviceSlugs] = await Promise.all([
    safeSlugs(getCards),
    Promise.all(
      Object.entries(ARTICLE_ROUTE_BY_CATEGORY).map(async ([category, toPath]) => {
        const slugs = await safeSlugs(() => getArticlesByCategory(category as ArticleCategory));
        return slugs.map(toPath);
      })
    ),
    safeSlugs(getRituals),
    safeSlugs(getHolisticServices),
  ]);

  const entries: MetadataRoute.Sitemap = [
    ...STATIC_ROUTES.map(({ path, priority, changeFrequency }) =>
      entry(path, priority, changeFrequency)
    ),

    // Horóscopos: 12 signos + 12 animales, desde constantes locales (sin API)
    ...Object.values(ZodiacSign).map((sign) => entry(ROUTES.HOROSCOPO_SIGN(sign), 0.8, 'daily')),
    ...getAllChineseZodiacAnimals().map((animal) =>
      entry(ROUTES.HOROSCOPO_CHINO_ANIMAL(animal), 0.7, 'daily')
    ),

    // Enciclopedia: las cartas van en su URL canónica (/enciclopedia/tarot/[slug])
    ...cardSlugs.map((slug) => entry(ROUTES.ENCICLOPEDIA_TAROT_CARD(slug), 0.7, 'monthly')),
    ...articleEntries.flat().map((path) => entry(path, 0.7, 'monthly')),

    ...ritualSlugs.map((slug) => entry(ROUTES.RITUAL_DETAIL(slug), 0.6, 'monthly')),
    ...serviceSlugs.map((slug) => entry(ROUTES.SERVICIO_DETAIL(slug), 0.7, 'weekly')),
  ];

  // Un slug repetido entre categorías no debe emitir la misma URL dos veces
  return [...new Map(entries.map((item) => [item.url, item])).values()];
}
