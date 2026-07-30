import type { Metadata } from 'next';

import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { STATIC_PAGE_METADATA } from '@/lib/metadata/page-metadata';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Signos Zodiacales List Page
 *
 * Route: /enciclopedia/astrologia/signos
 */
export const metadata: Metadata = STATIC_PAGE_METADATA.enciclopediaSignos;

export default function SignosPage() {
  return (
    <ArticleListPageContent
      category={ArticleCategory.ZODIAC_SIGN}
      title="Signos Zodiacales"
      subtitle="Explora los 12 signos del zodiaco y sus características."
      detailHrefPrefix="/enciclopedia/astrologia/signos"
    />
  );
}
