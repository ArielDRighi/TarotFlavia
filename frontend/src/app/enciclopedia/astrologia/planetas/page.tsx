import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Planetas List Page
 *
 * Route: /enciclopedia/astrologia/planetas
 */
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
