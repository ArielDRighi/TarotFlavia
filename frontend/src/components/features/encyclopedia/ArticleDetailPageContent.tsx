'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';

import { ArticleDetailView } from '@/components/features/encyclopedia';
import { useArticle } from '@/hooks/api/useEncyclopediaArticles';
import { ROUTES } from '@/lib/constants/routes';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ArticleDetailPageContent
 *
 * Shared client component for article detail pages (signos, planetas, casas,
 * guías, elementos). Reads the `slug` param from the URL and fetches + renders
 * the corresponding article via ArticleDetailView.
 */
export function ArticleDetailPageContent() {
  const params = useParams();
  const slug = params.slug as string;

  const { data: article, isLoading, error } = useArticle(slug);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-muted h-8 w-48 animate-pulse rounded" />
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl">Artículo no encontrado</h1>
        <p className="text-muted-foreground mb-6">
          El artículo que buscas no existe o fue eliminado.
        </p>
        <Link
          href={ROUTES.ENCICLOPEDIA}
          className="text-primary hover:text-primary/80 font-medium transition-colors"
        >
          Volver a la Enciclopedia
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <ArticleDetailView article={article} />
    </div>
  );
}
