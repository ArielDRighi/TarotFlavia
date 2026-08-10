import type { Metadata } from 'next';

import { ListingIntro } from '@/components/common/ListingIntro';
import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { getArticlesByCategory } from '@/lib/api/encyclopedia-articles-api';
import { LISTING_INTROS } from '@/lib/constants/listing-intros.data';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { resolveListingData } from '@/lib/metadata/route-data';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Casas Astrales List Page
 *
 * Route: /enciclopedia/astrologia/casas
 *
 * Servía 26 palabras propias: el listado llegaba por el cliente (T-SEO-003).
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaCasas;

/** Los artículos son contenido estático; un día de ISR alcanza. */
export const revalidate = 86400;

export default async function CasasPage() {
  const initialArticles = await resolveListingData(() =>
    getArticlesByCategory(ArticleCategory.ASTROLOGICAL_HOUSE)
  );

  return (
    <>
      <ArticleListPageContent
        category={ArticleCategory.ASTROLOGICAL_HOUSE}
        title="Casas Astrales"
        subtitle="Conoce las 12 casas astrales y los aspectos de la vida que rigen."
        detailHrefPrefix="/enciclopedia/astrologia/casas"
        initialArticles={initialArticles}
      />
      <ListingIntro intro={LISTING_INTROS.enciclopediaCasas} />
    </>
  );
}
