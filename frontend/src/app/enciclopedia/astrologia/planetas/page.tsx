import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { ROUTES } from '@/lib/constants/routes';
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
      getDetailHref={(slug) => ROUTES.ENCICLOPEDIA_PLANETA(slug)}
    />
  );
}
