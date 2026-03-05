'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { ArcanaType, SUIT_INFO } from '@/types/encyclopedia.types';
import type { CardSummary } from '@/types/encyclopedia.types';

/**
 * CardThumbnail Component Props
 */
export interface CardThumbnailProps {
  /** Card summary data */
  card: CardSummary;
  /** Additional CSS classes */
  className?: string;
}

/**
 * CardThumbnail Component
 *
 * Displays a tarot card as a thumbnail with image, name, and type badge.
 *
 * Features:
 * - Links to card detail page at /enciclopedia/{slug}
 * - Badge for Arcanos Mayores or suit name for minor arcana
 * - Hover scale effect on image
 * - Responsive card layout
 *
 * @example
 * ```tsx
 * <CardThumbnail card={card} />
 * ```
 */
export function CardThumbnail({ card, className }: CardThumbnailProps) {
  const isMajor = card.arcanaType === ArcanaType.MAJOR;
  const badgeLabel = isMajor ? 'Arcanos Mayores' : card.suit ? SUIT_INFO[card.suit].nameEs : null;

  return (
    <Link href={`/enciclopedia/${card.slug}`} className="group block">
      <div
        data-testid={`card-thumbnail-${card.slug}`}
        className={cn('overflow-hidden rounded-lg', className)}
      >
        {/* Card image */}
        <div className="bg-muted relative aspect-[2/3] overflow-hidden rounded-md">
          <Image
            src={card.thumbnailUrl || '/card-placeholder.svg'}
            alt={card.nameEs}
            fill
            className="object-cover transition-transform duration-200 group-hover:scale-105"
            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
            unoptimized
          />
          {/* Type badge */}
          {badgeLabel && (
            <Badge className="bg-background/80 absolute right-1 bottom-1 left-1 justify-center text-xs">
              {badgeLabel}
            </Badge>
          )}
        </div>

        {/* Card name */}
        <p className="group-hover:text-primary mt-1 line-clamp-1 text-center text-sm font-medium">
          {card.nameEs}
        </p>
      </div>
    </Link>
  );
}
