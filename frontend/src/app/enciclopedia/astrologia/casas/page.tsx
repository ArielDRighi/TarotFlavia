import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Casas Astrales List Page
 *
 * Route: /enciclopedia/astrologia/casas
 */
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
