import * as React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export type SkeletonCardVariant = 'tarotist' | 'reading' | 'session';

export interface SkeletonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The variant determines the skeleton structure:
   * - tarotist: circle (photo) + 3 text lines
   * - reading: rectangle (card) + 2 text lines
   * - session: line + rectangle + line
   */
  variant: SkeletonCardVariant;
}

/**
 * SkeletonCard - A loading placeholder component with different variants
 * for different content types in the application.
 *
 * @example
 * // Tarotist variant (circular photo + 3 text lines)
 * <SkeletonCard variant="tarotist" />
 *
 * @example
 * // Reading variant (rectangular card + 2 text lines)
 * <SkeletonCard variant="reading" />
 *
 * @example
 * // Session variant (line + rectangle + line)
 * <SkeletonCard variant="session" />
 */
export function SkeletonCard({ variant, className, ...props }: SkeletonCardProps) {
  return (
    <div className={cn('bg-card space-y-4 rounded-lg border p-4', className)} {...props}>
      {variant === 'tarotist' && <TarotistSkeleton />}
      {variant === 'reading' && <ReadingSkeleton />}
      {variant === 'session' && <SessionSkeleton />}
    </div>
  );
}

/**
 * Tarotist variant: circular photo + 3 text lines
 */
function TarotistSkeleton() {
  return (
    <>
      {/* Circular photo skeleton */}
      <div className="flex justify-center">
        <Skeleton data-testid="skeleton-tarotist-photo" className="h-20 w-20 rounded-full" />
      </div>
      {/* Text lines */}
      <div className="space-y-2">
        <Skeleton data-testid="skeleton-tarotist-line-1" className="mx-auto h-4 w-3/4" />
        <Skeleton data-testid="skeleton-tarotist-line-2" className="mx-auto h-4 w-1/2" />
        <Skeleton data-testid="skeleton-tarotist-line-3" className="mx-auto h-4 w-2/3" />
      </div>
    </>
  );
}

/**
 * Reading variant: rectangular card + 2 text lines
 */
function ReadingSkeleton() {
  return (
    <>
      {/* Card rectangle skeleton */}
      <Skeleton data-testid="skeleton-reading-card" className="h-32 w-full" />
      {/* Text lines */}
      <div className="space-y-2">
        <Skeleton data-testid="skeleton-reading-line-1" className="h-4 w-full" />
        <Skeleton data-testid="skeleton-reading-line-2" className="h-4 w-3/4" />
      </div>
    </>
  );
}

/**
 * Session variant: line + rectangle + line
 */
function SessionSkeleton() {
  return (
    <>
      {/* Top line */}
      <Skeleton data-testid="skeleton-session-top-line" className="h-4 w-1/2" />
      {/* Middle rectangle */}
      <Skeleton data-testid="skeleton-session-rectangle" className="h-20 w-full" />
      {/* Bottom line */}
      <Skeleton data-testid="skeleton-session-bottom-line" className="h-4 w-1/3" />
    </>
  );
}
