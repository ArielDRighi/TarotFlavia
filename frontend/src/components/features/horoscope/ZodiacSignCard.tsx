'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ZodiacSign, ZodiacSignInfo } from '@/types/horoscope.types';

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
        'cursor-pointer p-4 text-center transition-all',
        'hover:shadow-md hover:scale-105',
        isSelected && 'ring-2 ring-primary',
        isUserSign && 'border-accent border-2',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <span className="text-4xl" role="img" aria-label={signInfo.nameEs}>
        {signInfo.symbol}
      </span>
      <p className="mt-2 font-serif text-lg">{signInfo.nameEs}</p>
      {isUserSign && <span className="text-xs text-muted-foreground">Tu signo</span>}
    </Card>
  );
}
