'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ZodiacSign, ZodiacSignInfo } from '@/types/horoscope.types';

import { ZodiacSymbol } from './ZodiacSymbol';

/**
 * ZodiacSignCard Component Props
 */
export interface ZodiacSignCardProps {
  /** Sign information */
  signInfo: ZodiacSignInfo;
  /** Whether this sign is currently selected */
  isSelected?: boolean;
  /** Whether this is the user's zodiac sign */
  isUserSign?: boolean;
  /**
   * Compact look for narrow containers (carousel variant of the selector).
   * Smaller padding, symbol and name so long names ("Capricornio") fit whole.
   */
  compact?: boolean;
  /** Callback when card is clicked */
  onClick?: (sign: ZodiacSign) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ZodiacSignCard Component
 *
 * Displays a single zodiac sign card with symbol and name.
 * Used in the zodiac sign selector for horoscope pages.
 *
 * Features:
 * - Symbol and name display
 * - Selected state with ring styling
 * - User's sign indicator
 * - Hover effects with scale
 * - Clickable with keyboard support
 * - Accessible with aria-label
 *
 * @example
 * ```tsx
 * <ZodiacSignCard
 *   signInfo={ZODIAC_SIGNS_INFO[ZodiacSign.ARIES]}
 *   isSelected={selectedSign === ZodiacSign.ARIES}
 *   isUserSign={userSign === ZodiacSign.ARIES}
 *   onClick={(sign) => handleSignSelect(sign)}
 * />
 * ```
 */
export function ZodiacSignCard({
  signInfo,
  isSelected = false,
  isUserSign = false,
  compact = false,
  onClick,
  className,
}: ZodiacSignCardProps) {
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(signInfo.sign);
    }
  }, [onClick, signInfo.sign]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onClick) {
          onClick(signInfo.sign);
        }
      }
    },
    [onClick, signInfo.sign]
  );

  return (
    <Card
      data-testid={`zodiac-card-${signInfo.sign}`}
      className={cn(
        'cursor-pointer text-center transition-all',
        compact ? 'p-3' : 'p-4',
        'hover:scale-105 hover:shadow-md',
        isSelected && 'ring-primary ring-2',
        isUserSign && 'border-accent border-2',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isUserSign ? `${signInfo.nameEs} (tu signo)` : undefined}
    >
      <ZodiacSymbol
        symbol={signInfo.symbol}
        label={signInfo.nameEs}
        className={compact ? 'text-3xl' : 'text-4xl'}
      />
      <p
        className={cn(
          'mt-2 font-serif',
          // El nombre debe entrar completo aunque la tarjeta sea angosta:
          // wrap a dos líneas antes que desbordar y recortarse.
          compact ? 'text-sm leading-tight break-words' : 'text-lg'
        )}
      >
        {signInfo.nameEs}
      </p>
    </Card>
  );
}
