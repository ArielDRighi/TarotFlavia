'use client';

import * as React from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * HoroscopeSkeleton Component Props
 */
export interface HoroscopeSkeletonProps {
  /** Skeleton variant */
  variant?: 'grid' | 'detail';
}

/**
 * HoroscopeSkeleton Component
 *
 * Loading skeleton for horoscope components.
 * Provides visual feedback while data is loading.
 *
 * Variants:
 * - grid: 12 zodiac sign card skeletons
 * - detail: Detailed horoscope view skeleton
 *
 * @example
 * ```tsx
 * {isLoading ? <HoroscopeSkeleton variant="grid" /> : <ZodiacSignSelector />}
 * ```
 */
export function HoroscopeSkeleton({ variant = 'grid' }: HoroscopeSkeletonProps) {
  if (variant === 'detail') {
    return (
      <div data-testid="horoscope-skeleton-detail" className="space-y-6">
        <div className="text-center">
          <Skeleton className="mx-auto h-16 w-16 rounded-full" />
          <Skeleton className="mx-auto mt-2 h-8 w-32" />
        </div>
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    );
  }

  // Grid skeleton (12 cards)
  return (
    <div
      data-testid="horoscope-skeleton-grid"
      className="grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6"
    >
      {Array.from({ length: 12 }).map((_, i) => (
        <Card key={i} className="p-4">
          <Skeleton className="mx-auto h-12 w-12 rounded-full" />
          <Skeleton className="mx-auto mt-2 h-4 w-16" />
        </Card>
      ))}
    </div>
  );
}
