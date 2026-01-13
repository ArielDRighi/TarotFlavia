'use client';

import { useMemo } from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

import type { CardPreview } from '@/types/reading.types';
import { cn } from '@/lib/utils/cn';

interface CardThumbnailsProps {
  /** Array of card previews to display */
  cards?: CardPreview[];
  /** Maximum number of cards to display (default: 3) */
  max?: number;
  /** Size variant of thumbnails (default: 'sm') */
  size?: 'sm' | 'md';
  /** Whether cards should be stacked/overlapped (default: true) */
  stacked?: boolean;
}

/**
 * CardThumbnails component
 *
 * Displays a compact preview of tarot cards, either stacked or in a row.
 * Used in reading history lists to show visual preview of readings.
 *
 * @example
 * ```tsx
 * <CardThumbnails cards={reading.cardPreviews} max={3} size="sm" stacked />
 * ```
 */
export function CardThumbnails({
  cards,
  max = 3,
  size = 'sm',
  stacked = true,
}: CardThumbnailsProps) {
  // Validate max prop - if 0 or negative, use default of 3
  const effectiveMax = max > 0 ? max : 3;

  // Show placeholder if no cards or if max is explicitly 0
  const shouldShowPlaceholder = !cards || cards.length === 0 || max === 0;

  // Memoize displayed cards to avoid re-slicing on every render
  const displayCards = useMemo(() => {
    if (shouldShowPlaceholder) return [];
    return cards.slice(0, effectiveMax);
  }, [cards, effectiveMax, shouldShowPlaceholder]);

  // Size classes mapping
  const sizeClasses = useMemo(
    () => ({
      sm: 'h-12 w-9',
      md: 'h-16 w-12',
    }),
    []
  );

  const iconSizeClasses = useMemo(
    () => ({
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
    }),
    []
  );

  if (shouldShowPlaceholder) {
    return (
      <div
        data-testid="card-thumbnails-placeholder"
        className={cn(
          'flex items-center justify-center rounded-md border-2 border-dashed border-gray-300 bg-gray-50',
          sizeClasses[size]
        )}
        aria-label="No hay cartas disponibles"
      >
        <Sparkles className={cn('text-gray-400', iconSizeClasses[size])} />
      </div>
    );
  }

  return (
    <div
      data-testid="card-thumbnails-wrapper"
      className={cn('flex items-center', {
        'gap-1': !stacked,
      })}
    >
      {displayCards.map((card, index) => (
        <div
          key={card.id}
          className={cn(
            'relative overflow-hidden rounded-md border-2 border-white shadow-md',
            sizeClasses[size],
            {
              '-ml-2': stacked && index > 0,
            }
          )}
          style={{
            zIndex: displayCards.length - index, // Stack from front to back
          }}
        >
          <Image src={card.imageUrl} alt={card.name} fill className="object-cover" sizes="60px" />

          {/* Reversed indicator */}
          {card.isReversed && (
            <div
              data-testid="card-reversed-indicator"
              className="bg-secondary/90 absolute right-0 bottom-0 rounded-tl-md px-1 py-0.5"
              title="Carta invertida"
            >
              <div className="h-2 w-2 rotate-180 text-white">↓</div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
