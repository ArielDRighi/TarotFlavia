// 5. Components
import { ArticleCard } from '@/components/features/encyclopedia/ArticleCard';
import { HomeSectionHeader } from './HomeSectionHeader';
// 6. Utils & types
import { HOME_EDITORIAL } from '@/lib/constants/home-editorial.data';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

/**
 * Últimas guías de la portada (T-SEO-014).
 *
 * Reutiliza `ArticleCard` de la enciclopedia: título, categoría y extracto con
 * enlace a la guía. Sin fecha ni byline: la API no expone fecha de edición de
 * las guías (T-SEO-017 lo confirmó) y mostrar `new Date()` sería inventarla.
 */
export interface LatestGuidesProps {
  guides: ArticleSummary[] | undefined;
}

export function LatestGuides({ guides }: LatestGuidesProps) {
  const copy = HOME_EDITORIAL.guides;

  return (
    <section data-testid="home-guides" className="bg-bg-main px-4 py-14 md:py-20">
      <div className="container mx-auto max-w-6xl">
        <HomeSectionHeader copy={copy} />

        {guides && guides.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {guides.map((guide) => (
              <ArticleCard key={guide.id} article={guide} />
            ))}
          </div>
        ) : (
          <p
            data-testid="home-guides-empty"
            className="text-text-muted border-border rounded-xl border border-dashed p-6 font-sans leading-relaxed"
          >
            {copy.emptyState}
          </p>
        )}
      </div>
    </section>
  );
}
