'use client';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * ChineseHoroscopeSkeleton Component
 *
 * Loading skeleton for Chinese horoscope content.
 * Displays placeholder elements while data is loading.
 */
export function ChineseHoroscopeSkeleton() {
  return (
    <div className="space-y-6" data-testid="chinese-horoscope-skeleton">
      {/* Header Skeleton */}
      <div className="space-y-2 text-center">
        <Skeleton className="mx-auto h-16 w-16 rounded-full" />
        <Skeleton className="mx-auto h-8 w-32" />
        <Skeleton className="mx-auto h-6 w-24" />
      </div>

      {/* Overview Skeleton */}
      <Card className="p-6">
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </Card>

      {/* Areas Skeleton */}
      <div className="grid gap-4 md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="mb-2 h-6 w-24" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="mb-2 h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </Card>
        ))}
      </div>

      {/* Lucky Elements Skeleton */}
      <Card className="p-4">
        <Skeleton className="mb-4 h-6 w-48" />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          ))}
        </div>
      </Card>

      {/* Compatibility Skeleton */}
      <Card className="p-4">
        <Skeleton className="mb-4 h-6 w-32" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <Skeleton className="mb-2 h-4 w-40" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
