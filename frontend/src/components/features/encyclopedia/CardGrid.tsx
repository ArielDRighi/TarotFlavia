'use client';

import { CardThumbnail } from './CardThumbnail';
import { EncyclopediaSkeleton } from './EncyclopediaSkeleton';
import { cn } from '@/lib/utils';
import type { CardSummary } from '@/types/encyclopedia.types';

/**
 * CardGrid Component Props
 */
export interface CardGridProps {
  /** Array of card summaries to display */
  cards: CardSummary[];
  /** Whether the grid is loading */
  isLoading?: boolean;
  /** Message to display when no cards are found */
  emptyMessage?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardGrid Component
 *
 * Displays a responsive grid of tarot card thumbnails with loading and empty states.
 *
 * Features:
 * - Responsive grid layout (2 cols mobile → 6 cols xl)
 * - Loading skeleton state using EncyclopediaSkeleton
 * - Empty state with custom message
 * - Automatic thumbnail rendering from card data
 *
 * @example
 * ```tsx
 * <CardGrid
 *   cards={cards}
 *   isLoading={isLoading}
 *   emptyMessage="No se encontraron cartas para esta categoría"
 * />
 * ```
 */
export function CardGrid({
  cards,
  isLoading = false,
  emptyMessage = 'No se encontraron cartas',
  className,
}: CardGridProps) {
  if (isLoading) {
    return <EncyclopediaSkeleton variant="grid" />;
  }

  if (cards.length === 0) {
    return <div className="text-muted-foreground py-12 text-center">{emptyMessage}</div>;
  }

  return (
    <div
      data-testid="card-grid"
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6',
        className
      )}
    >
      {cards.map((card) => (
        <CardThumbnail key={card.id} card={card} />
      ))}
    </div>
  );
}
