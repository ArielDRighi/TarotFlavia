import type { Metadata } from 'next';

import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Planetas List Page
 *
 * Route: /enciclopedia/astrologia/planetas
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaPlanetas;

export default function PlanetasPage() {
  return (
    <ArticleListPageContent
      category={ArticleCategory.PLANET}
      title="Planetas"
      subtitle="Descubre los 10 planetas astrológicos y su influencia."
      detailHrefPrefix="/enciclopedia/astrologia/planetas"
    />
  );
}
