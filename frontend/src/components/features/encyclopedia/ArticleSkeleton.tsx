'use client';

import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

/**
 * ArticleSkeleton Component Props
 */
export interface ArticleSkeletonProps {
  /** Number of skeleton items to render */
  count?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ArticleSkeleton Component
 *
 * Displays animated skeleton placeholders while article content is loading.
 *
 * @example
 * ```tsx
 * <ArticleSkeleton count={6} />
 * ```
 */
export function ArticleSkeleton({ count = 4, className }: ArticleSkeletonProps) {
  return (
    <div
      data-testid="article-skeleton"
      className={cn('grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4', className)}
    >
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} data-testid="article-skeleton-item" className="rounded-lg p-4">
          <Skeleton className="mb-3 h-10 w-10 rounded-full" />
          <Skeleton className="mb-2 h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="mt-1 h-3 w-2/3" />
        </div>
      ))}
    </div>
  );
}
