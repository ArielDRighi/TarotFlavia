'use client';

import { RitualCard } from './RitualCard';
import { RitualsSkeleton } from './RitualsSkeleton';
import { cn } from '@/lib/utils';
import type { RitualSummary } from '@/types/ritual.types';

/**
 * RitualGrid Component Props
 */
export interface RitualGridProps {
  /** Array of ritual summaries to display */
  rituals: RitualSummary[];
  /** Whether the grid is loading */
  isLoading?: boolean;
  /** Message to display when no rituals are found */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * RitualGrid Component
 *
 * Displays a responsive grid of ritual cards with loading and empty states.
 *
 * Features:
 * - Responsive grid layout (1 col mobile, 2 cols tablet, 3 cols desktop)
 * - Loading skeleton state
 * - Empty state with custom message
 * - Automatic card rendering from ritual data
 *
 * @example
 * ```tsx
 * <RitualGrid
 *   rituals={rituals}
 *   isLoading={isLoading}
 *   emptyMessage="No se encontraron rituales para esta categoría"
 * />
 * ```
 */
export function RitualGrid({
  rituals,
  isLoading = false,
  emptyMessage = 'No se encontraron rituales',
  className,
}: RitualGridProps) {
  if (isLoading) {
    return <RitualsSkeleton variant="grid" />;
  }

  if (rituals.length === 0) {
    return <div className="text-muted-foreground py-12 text-center">{emptyMessage}</div>;
  }

  return (
    <div className={cn('grid gap-6 sm:grid-cols-2 lg:grid-cols-3', className)}>
      {rituals.map((ritual) => (
        <RitualCard key={ritual.id} ritual={ritual} />
      ))}
    </div>
  );
}
