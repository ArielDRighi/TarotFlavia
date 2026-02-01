'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * RitualsSkeleton Component Props
 */
export interface RitualsSkeletonProps {
  /** Skeleton variant to display */
  variant?: 'grid' | 'detail';
  /** Number of skeleton cards to show (grid variant only) */
  count?: number;
}

/**
 * RitualsSkeleton Component
 *
 * Loading skeleton for rituals content.
 *
 * Features:
 * - Grid variant: Multiple skeleton cards in responsive grid
 * - Detail variant: Single ritual detail page skeleton
 * - Configurable count for grid variant
 *
 * @example
 * ```tsx
 * <RitualsSkeleton variant="grid" count={6} />
 * <RitualsSkeleton variant="detail" />
 * ```
 */
export function RitualsSkeleton({ variant = 'grid', count = 6 }: RitualsSkeletonProps) {
  if (variant === 'detail') {
    return (
      <div className="space-y-6" data-testid="rituals-skeleton" data-variant="detail">
        <Skeleton className="h-64 w-full rounded-lg" />
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
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
      data-testid="rituals-skeleton"
      data-variant="grid"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden">
          <Skeleton className="aspect-video" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-16" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
