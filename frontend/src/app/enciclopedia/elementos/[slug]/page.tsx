import { cache } from 'react';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getArticleMetadata } from '@/lib/metadata/seo';
import { resolveRouteResource } from '@/lib/metadata/route-data';
import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Elemento / Modalidad Detail Page
 *
 * Route: /enciclopedia/elementos/[slug]
 */

const ELEMENT_CATEGORIES = [ArticleCategory.ELEMENT, ArticleCategory.MODALITY] as const;

/** La enciclopedia es contenido estático; un día de ISR alcanza. */
export const revalidate = 86400;

interface PageProps {
  params: Promise<{ slug: string }>;
}

/**
 * `generateMetadata` y la página resuelven el MISMO artículo. Next solo dedupea
 * `fetch()` y acá abajo hay axios, así que sin `cache()` serían dos requests por
 * página renderizada.
 */
const ROUTE_CATEGORIES: readonly ArticleCategory[] = ELEMENT_CATEGORIES;

/**
 * Las 5 rutas de artículo consultan el MISMO `getArticle(slug)`, sin filtrar por
 * categoría. Sin este chequeo, `/enciclopedia/elementos/aries` devolvía 200 con el
 * signo Aries: cada artículo quedaba alcanzable como 5 URLs distintas con el mismo
 * contenido — justo el agrupamiento por duplicado que T-PROD-020 vino a deshacer.
 */
const getArticleCached = cache(async (slug: string) => {
  const article = await resolveRouteResource(() => getArticle(slug));

  if (!ROUTE_CATEGORIES.includes(article.category)) {
    notFound();
  }

  return article;
});

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return getArticleMetadata(await getArticleCached(slug), ROUTES.ENCICLOPEDIA_ELEMENTO(slug));
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  try {
    const results = await Promise.all(
      ELEMENT_CATEGORIES.map((category) => getArticlesByCategory(category))
    );
    return results.flat().map((article) => ({ slug: article.slug }));
  } catch {
    return [];
  }
}

export default async function ElementoDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return <ArticleDetailPageContent slug={slug} initialArticle={await getArticleCached(slug)} />;
}
