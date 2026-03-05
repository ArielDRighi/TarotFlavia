'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * EncyclopediaSkeleton Component Props
 */
export interface EncyclopediaSkeletonProps {
  /** Skeleton variant to display */
  variant?: 'grid' | 'detail';
  /** Number of skeleton cards to show (grid variant only) */
  count?: number;
}

/**
 * EncyclopediaSkeleton Component
 *
 * Loading skeleton for encyclopedia content.
 *
 * Features:
 * - Grid variant: Multiple skeleton cards in responsive grid
 * - Detail variant: Single card detail page skeleton
 * - Configurable count for grid variant
 *
 * @example
 * ```tsx
 * <EncyclopediaSkeleton variant="grid" count={12} />
 * <EncyclopediaSkeleton variant="detail" />
 * ```
 */
export function EncyclopediaSkeleton({ variant = 'grid', count = 12 }: EncyclopediaSkeletonProps) {
  if (variant === 'detail') {
    return (
      <div className="space-y-6" data-testid="encyclopedia-skeleton" data-variant="detail">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
      data-testid="encyclopedia-skeleton"
      data-variant="grid"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden" data-testid="skeleton-card">
          <Skeleton className="aspect-[2/3] w-full" />
          <div className="space-y-2 p-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </Card>
      ))}
    </div>
  );
}
