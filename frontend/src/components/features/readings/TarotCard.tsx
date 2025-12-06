'use client';

import Image from 'next/image';

import { cn } from '@/lib/utils';
import type { ReadingCard } from '@/types/reading.types';

/**
 * TarotCard Component Props
 */
export interface TarotCardProps {
  /** Card data - if not provided, card shows as face down */
  card?: ReadingCard;
  /** Whether the card is revealed (face up) */
  isRevealed: boolean;
  /** Click handler for card interaction */
  onClick?: () => void;
  /** Size variant of the card */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}

/** Size configuration mapping */
const sizeClasses = {
  sm: 'w-32 h-48',
  md: 'w-40 h-60',
  lg: 'w-48 h-72',
} as const;

/** Image sizes for Next.js Image optimization */
const imageSizes = {
  sm: '(max-width: 768px) 128px, 128px',
  md: '(max-width: 768px) 160px, 160px',
  lg: '(max-width: 768px) 192px, 192px',
} as const;

/**
 * TarotCard Component
 *
 * Displays a tarot card with two states:
 * - Unrevealed (back): Shows a decorative geometric pattern
 * - Revealed (front): Shows the card image and name
 *
 * Features:
 * - 3D flip animation when revealing
 * - Three size variants (sm, md, lg)
 * - Hover lift effect when unrevealed
 * - Support for reversed card orientation
 * - Fully accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * // Unrevealed card (face down)
 * <TarotCard isRevealed={false} onClick={handleFlip} />
 *
 * // Revealed card
 * <TarotCard card={cardData} isRevealed={true} />
 * ```
 */
export function TarotCard({ card, isRevealed, onClick, size = 'md', className }: TarotCardProps) {
  const ariaLabel =
    isRevealed && card ? `Carta de tarot: ${card.name}` : 'Carta de tarot boca abajo';

  const isReversed = card?.orientation === 'reversed';

  return (
    <div
      data-testid="tarot-card"
      className={cn(
        // Base styles
        'relative rounded-xl shadow-lg',
        // Perspective for 3D effect
        '[perspective:1000px]',
        // Size
        sizeClasses[size],
        // Cursor and hover effects
        onClick && 'cursor-pointer',
        !isRevealed && onClick && 'transition-transform duration-300 hover:-translate-y-1',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      onKeyDown={(e) => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Flip container */}
      <div
        data-testid="flip-container"
        className={cn(
          'relative h-full w-full transition-transform duration-[600ms]',
          isRevealed && 'rotate-y-180'
        )}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Card Back */}
        <div
          data-testid="card-back"
          className={cn(
            'absolute inset-0 rounded-xl',
            'bg-secondary',
            '[backface-visibility:hidden]'
          )}
        >
          {/* Geometric pattern overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-xl">
            {/* Border frame */}
            <div className="border-primary/30 absolute inset-2 rounded-lg border-2">
              {/* Inner decorative border */}
              <div className="border-primary/20 absolute inset-2 rounded-md border">
                {/* Center mandala pattern */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="relative h-16 w-16">
                    {/* Diamond shape */}
                    <div className="bg-primary/20 absolute inset-0 rotate-45 rounded-sm" />
                    {/* Circle */}
                    <div className="bg-primary/30 absolute inset-2 rounded-full" />
                    {/* Inner diamond */}
                    <div className="bg-primary/20 absolute inset-4 rotate-45 rounded-sm" />
                  </div>
                </div>
              </div>
            </div>
            {/* Corner decorations */}
            <div className="border-primary/40 absolute top-3 left-3 h-4 w-4 rounded-tl border-t-2 border-l-2" />
            <div className="border-primary/40 absolute top-3 right-3 h-4 w-4 rounded-tr border-t-2 border-r-2" />
            <div className="border-primary/40 absolute bottom-3 left-3 h-4 w-4 rounded-bl border-b-2 border-l-2" />
            <div className="border-primary/40 absolute right-3 bottom-3 h-4 w-4 rounded-br border-r-2 border-b-2" />
          </div>
        </div>

        {/* Card Front */}
        <div
          data-testid="card-front"
          className={cn(
            'bg-surface absolute inset-0 overflow-hidden rounded-xl',
            'rotate-y-180 [backface-visibility:hidden]',
            'flex flex-col'
          )}
        >
          {/* Card image container */}
          <div className="bg-bg-main relative flex-1">
            {card?.imageUrl ? (
              <Image
                src={card.imageUrl}
                alt={`Carta de tarot: ${card.name}${isReversed ? ' (invertida)' : ''}`}
                fill
                sizes={imageSizes[size]}
                className={cn('object-cover', isReversed && 'rotate-180')}
              />
            ) : (
              /* Placeholder for card image */
              <div
                role="img"
                aria-label={card?.name || 'Carta de tarot'}
                className={cn(
                  'bg-bg-main flex h-full w-full items-center justify-center',
                  isReversed && 'rotate-180'
                )}
              >
                <div className="p-2 text-center">
                  <div className="mb-2 text-4xl">🃏</div>
                  <span className="text-text-muted text-xs">{card?.name || 'Sin imagen'}</span>
                </div>
              </div>
            )}
          </div>

          {/* Card name */}
          {card && (
            <div className="bg-surface border-secondary/30 border-t p-2">
              <p className="text-text-primary truncate text-center font-serif text-sm">
                {card.name}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
