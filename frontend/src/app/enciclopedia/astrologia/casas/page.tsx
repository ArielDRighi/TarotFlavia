import type { Metadata } from 'next';

import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Casas Astrales List Page
 *
 * Route: /enciclopedia/astrologia/casas
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaCasas;

export default function CasasPage() {
  return (
    <ArticleListPageContent
      category={ArticleCategory.ASTROLOGICAL_HOUSE}
      title="Casas Astrales"
      subtitle="Conoce las 12 casas astrales y los aspectos de la vida que rigen."
      detailHrefPrefix="/enciclopedia/astrologia/casas"
    />
  );
}
