import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Signos Zodiacales List Page
 *
 * Route: /enciclopedia/astrologia/signos
 *
 * Servía 23 palabras propias: el listado llegaba por el cliente (T-SEO-003).
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaSignos;

/** Los artículos son contenido estático; un día de ISR alcanza. */
export const revalidate = 86400;

export default async function SignosPage() {
  const initialArticles = await resolveListingData(() =>
    getArticlesByCategory(ArticleCategory.ZODIAC_SIGN)
  );

  return (
    <>
      <ArticleListPageContent
        category={ArticleCategory.ZODIAC_SIGN}
        title="Signos Zodiacales"
        subtitle="Explora los 12 signos del zodiaco y sus características."
        detailHrefPrefix="/enciclopedia/astrologia/signos"
        initialArticles={initialArticles}
      />
      <ListingIntro intro={LISTING_INTROS.enciclopediaSignos} />
    </>
  );
}
