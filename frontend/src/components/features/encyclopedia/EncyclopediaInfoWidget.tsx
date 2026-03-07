'use client';

import Link from 'next/link';
import { BookOpen } from 'lucide-react';

import { useArticleSnippet } from '@/hooks/api/useEncyclopediaArticles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * EncyclopediaInfoWidget Component Props
 */
export interface EncyclopediaInfoWidgetProps {
  /** Slug del artículo de enciclopedia a mostrar (ej: 'guide-numerology', 'guide-pendulum') */
  slug: string;
  /** Sobreescribe el nameEs del artículo como título (opcional) */
  title?: string;
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
 * - Loading: muestra Skeleton dentro de un Card
 * - Error o sin datos: retorna null (no rompe la página)
 * - Con datos: muestra título, snippet y botón "Ver más en la Enciclopedia"
 *
 * @example
 * ```tsx
 * <EncyclopediaInfoWidget slug="guide-numerology" />
 * <EncyclopediaInfoWidget slug="guide-pendulum" title="Aprende sobre el Péndulo" />
 * ```
 */
export function EncyclopediaInfoWidget({ slug, title, className }: EncyclopediaInfoWidgetProps) {
  const { data: article, isLoading, error } = useArticleSnippet(slug);

  if (isLoading) {
    return (
      <Card data-testid="encyclopedia-info-widget-skeleton" className={cn(className)}>
        <CardHeader>
          <Skeleton className="h-5 w-3/4" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="mt-2 h-9 w-40" />
        </CardContent>
      </Card>
    );
  }

  if (error || !article) {
    return null;
  }

  const displayTitle = title ?? article.nameEs;

  return (
    <Card data-testid="encyclopedia-info-widget" className={cn(className)}>
      <CardHeader>
        <CardTitle>{displayTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-sm">{article.snippet}</p>
        <Button asChild variant="outline" size="sm">
          <Link href={`/enciclopedia/guias/${slug}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            Ver más en la Enciclopedia
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
