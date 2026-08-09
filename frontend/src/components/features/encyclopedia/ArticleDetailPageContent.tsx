'use client';

import Link from 'next/link';

import { ArticleDetailView } from '@/components/features/encyclopedia/ArticleDetailView';
import { useArticle } from '@/hooks/api/useEncyclopediaArticles';
import { Skeleton } from '@/components/ui/skeleton';
import { ROUTES } from '@/lib/constants/routes';
import type { ArticleDetail } from '@/types/encyclopedia-article.types';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * ArticleDetailPageContent
 *
 * Shared client component for article detail pages (signos, planetas, casas,
 * guías, elementos). Renderiza el artículo vía ArticleDetailView.
 *
 * La ruta lo resuelve en el servidor y lo entrega por `initialArticle`: son las
 * 53 fichas de contenido editorial de la enciclopedia y servían 5 palabras al
 * crawler porque el artículo se traía por el cliente (T-PROD-024). Mismo patrón
 * que `CardDetailPageContent`.
 */
interface ArticleDetailPageContentProps {
  slug: string;
  /** Artículo resuelto en el servidor. La ruta 404ea si el slug no existe. */
  initialArticle: ArticleDetail;
}

export function ArticleDetailPageContent({ slug, initialArticle }: ArticleDetailPageContentProps) {
  const { data: article, isLoading } = useArticle(slug, initialArticle);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-8 w-48" />
      </div>
    );
  }

  // Sin `error`: un refetch fallido en background puebla `error` conservando el
  // `data` bueno, y tirar abajo un artículo ya cargado sería peor.
  if (!article) {
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
