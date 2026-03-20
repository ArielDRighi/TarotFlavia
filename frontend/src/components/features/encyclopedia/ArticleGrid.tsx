'use client';

import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import { cn } from '@/lib/utils';
import type { ArticleSummary } from '@/types/encyclopedia-article.types';

/**
 * ArticleGrid Component Props
 */
export interface ArticleGridProps {
  /** Array of article summaries to display */
  articles: ArticleSummary[];
  /** Whether the grid is loading */
  isLoading?: boolean;
  /** Message to display when no articles are found */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ArticleGrid Component
 *
 * Displays a responsive grid of article cards with loading and empty states.
 *
 * Features:
 * - Responsive grid layout (2 cols mobile → 4 cols md)
 * - Loading skeleton state using ArticleSkeleton
 * - Empty state with custom message
 * - Works for all article categories (zodiac, planets, houses, guides, etc.)
 *
 * @example
 * ```tsx
 * <ArticleGrid
 *   articles={articles}
 *   isLoading={isLoading}
 *   emptyMessage="No se encontraron artículos para esta categoría"
 * />
 * ```
 */
export function ArticleGrid({
  articles,
  isLoading = false,
  emptyMessage = 'No se encontraron artículos',
  className,
}: ArticleGridProps) {
  if (isLoading) {
    return (
      <div className={className}>
        <ArticleSkeleton />
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className={cn('text-muted-foreground py-12 text-center', className)}>{emptyMessage}</div>
    );
  }

  return (
    <div
      data-testid="article-grid"
      className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4', className)}
    >
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
