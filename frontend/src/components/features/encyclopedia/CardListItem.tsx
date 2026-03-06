'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArcanaType, SUIT_INFO } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

/**
 * CardListItem Component Props
 */
export interface CardListItemProps {
  /** Card summary data */
  card: CardSummary;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardListItem Component
 *
 * Displays a tarot card as a horizontal list item with thumbnail, name, and type info.
 *
 * Features:
 * - Links to card detail page at /enciclopedia/{slug}
 * - Thumbnail image on the left
 * - Card name and type badge on the right
 * - Hover effect
 *
 * @example
 * ```tsx
 * <CardListItem card={card} />
 * ```
 */
export function CardListItem({ card, className }: CardListItemProps) {
  const isMajor = card.arcanaType === ArcanaType.MAJOR;
  const typeLabel = isMajor ? 'Arcanos Mayores' : card.suit ? SUIT_INFO[card.suit].nameEs : null;

  return (
    <Link href={`/enciclopedia/${card.slug}`} className="group block">
      <div
        data-testid={`card-list-item-${card.slug}`}
        className={cn(
          'hover:bg-muted flex items-center gap-3 rounded-lg p-2 transition-colors',
          className
        )}
      >
        {/* Thumbnail */}
        <div className="relative h-14 w-10 flex-shrink-0 overflow-hidden rounded">
          <Image
            src={card.thumbnailUrl || '/card-placeholder.svg'}
            alt={card.nameEs}
            fill
            className="object-cover"
            sizes="40px"
            unoptimized
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1">
          <p className="group-hover:text-primary truncate font-medium">{card.nameEs}</p>
          {typeLabel && (
            <Badge variant="secondary" className="mt-1 text-xs">
              {typeLabel}
            </Badge>
          )}
        </div>
      </div>
    </Link>
  );
}
