import { cache } from 'react';
import type { Metadata } from 'next';

import { getArticle, getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { getArticleMetadata } from '@/lib/metadata/seo';
import { resolveRouteResource, safeStaticParams } from '@/lib/metadata/route-data';
import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { ArticleDetailPageContent } from '@/components/features/encyclopedia/ArticleDetailPageContent';

/**
 * Signo Zodiacal Detail Page
 *
 * Route: /enciclopedia/astrologia/signos/[slug]
 */

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
const getArticleCached = cache((slug: string) => resolveRouteResource(() => getArticle(slug)));

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;

  return getArticleMetadata(await getArticleCached(slug), ROUTES.ENCICLOPEDIA_SIGNO(slug));
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  return safeStaticParams(
    () => getArticlesByCategory(ArticleCategory.ZODIAC_SIGN),
    (article) => ({ slug: article.slug })
  );
}

export default async function SignoDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return <ArticleDetailPageContent slug={slug} initialArticle={await getArticleCached(slug)} />;
}
