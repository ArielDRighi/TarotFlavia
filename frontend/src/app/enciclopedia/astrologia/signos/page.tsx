import { ArticleListPageContent } from '@/components/features/encyclopedia/ArticleListPageContent';
import { ROUTES } from '@/lib/constants/routes';
import { ArticleCategory } from '@/types/encyclopedia-article.types';

/**
 * Signos Zodiacales List Page
 *
 * Route: /enciclopedia/astrologia/signos
 */
export default function SignosPage() {
  return (
    <ArticleListPageContent
      category={ArticleCategory.ZODIAC_SIGN}
      title="Signos Zodiacales"
      subtitle="Explora los 12 signos del zodiaco y sus características."
      getDetailHref={(slug) => ROUTES.ENCICLOPEDIA_SIGNO(slug)}
    />
  );
}
