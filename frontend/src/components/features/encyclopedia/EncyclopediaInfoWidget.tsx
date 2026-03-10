'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { useArticleSnippet } from '@/hooks/api/useEncyclopediaArticles';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * EncyclopediaInfoWidget Component Props
 */
export interface EncyclopediaInfoWidgetProps {
  /** Slug del artículo de enciclopedia a mostrar (ej: 'guia-numerologia', 'guia-pendulo') */
  slug: string;
  /** Sobreescribe el nameEs del artículo como título (opcional) */
  title?: string;
  /**
   * URL destino del botón "Ver más en la Enciclopedia".
   * Si no se provee, usa `/enciclopedia/guias/${slug}` como fallback.
   * Útil cuando el route slug del frontend difiere del API slug
   * (ej: slug="guia-numerologia" pero href="/enciclopedia/guias/numerologia").
   */
  href?: string;
  /** Clases CSS adicionales */
  className?: string;
}

/**
 * EncyclopediaInfoWidget Component
 *
 * Widget informativo que muestra un snippet de un artículo de la Enciclopedia Mística.
 * Diseñado para ser embebido en otras páginas como widget secundario, no crítico.
 *
 * Comportamiento:
 * - Loading: muestra Skeleton dentro de un Card con gradiente púrpura
 * - Error o sin datos: retorna null (no rompe la página)
 * - Con datos: muestra título, snippet y botón "Ver más en la Enciclopedia"
 *
 * @example
 * ```tsx
 * // API slug y route slug coinciden
 * <EncyclopediaInfoWidget slug="guia-numerologia" />
 *
 * // API slug y route slug difieren — usar href explícito
 * <EncyclopediaInfoWidget
 *   slug="guia-pendulo"
 *   href="/enciclopedia/guias/pendulo"
 *   title="Aprende sobre el Péndulo"
 * />
 * ```
 */
export function EncyclopediaInfoWidget({
  slug,
  title,
  href,
  className,
}: EncyclopediaInfoWidgetProps) {
  const { data: article, isLoading, error } = useArticleSnippet(slug);

  if (isLoading) {
    return (
      <Card
        data-testid="encyclopedia-info-widget-skeleton"
        className={cn('border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50', className)}
      >
        <CardContent className="space-y-3 p-6">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-9 w-48" />
        </CardContent>
      </Card>
    );
  }

  if (error || !article) {
    return null;
  }

  const displayTitle = title ?? article.nameEs;
  const linkHref = href ?? `/enciclopedia/guias/${slug}`;

  return (
    <Card
      data-testid="encyclopedia-info-widget"
      className={cn('border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50', className)}
    >
      <CardContent className="space-y-4 p-6">
        <h2 className="text-xl font-bold text-purple-900">{displayTitle}</h2>
        <p className="text-sm text-gray-700">{article.snippet}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={linkHref}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver más en la Enciclopedia
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
