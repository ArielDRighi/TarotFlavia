import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Planetas List Page
 *
 * Route: /enciclopedia/astrologia/planetas
 *
 * Servía 18 palabras propias: el listado llegaba por el cliente (T-SEO-003).
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaPlanetas;

/** Los artículos son contenido estático; un día de ISR alcanza. */
export const revalidate = 86400;

export default async function PlanetasPage() {
  const initialArticles = await resolveListingData(() =>
    getArticlesByCategory(ArticleCategory.PLANET)
  );

  return (
    <>
      <ArticleListPageContent
        category={ArticleCategory.PLANET}
        title="Planetas"
        subtitle="Descubre los 10 planetas astrológicos y su influencia."
        detailHrefPrefix="/enciclopedia/astrologia/planetas"
        initialArticles={initialArticles}
      />
      <ListingIntro intro={LISTING_INTROS.enciclopediaPlanetas} />
    </>
  );
}
