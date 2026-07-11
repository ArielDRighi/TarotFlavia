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
   * `true` when the card lives in the carousel (fixed 112px width up to `lg:`).
   * Changes only the breakpoint at which the full-size look is restored — see
   * DENSITY_CLASSES.
   */
  compact?: boolean;
  /** Callback when card is clicked */
  onClick?: (sign: ZodiacSign) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PROD-008: el nombre se recortaba en toda tarjeta angosta. La tarjeta arranca
 * chica (`text-sm`, con wrap) y recupera el tamaño original en cuanto hay ancho.
 * Lo único que cambia entre densidades es DÓNDE está ese punto:
 *
 * - `grid` (listados): a partir de `md:` hay 4 columnas anchas → look original.
 * - `carousel` (detalle móvil): las tarjetas miden 112px fijos hasta `lg:`, así que
 *   el look original recién vuelve ahí, donde el selector pasa a ser grid otra vez.
 *
 * Clases literales a propósito: Tailwind no puede escanear strings construidos.
 */
const DENSITY_CLASSES = {
  grid: {
    padding: 'p-3 md:p-4',
    symbol: 'text-3xl md:text-4xl',
    name: 'text-sm leading-tight break-words hyphens-auto md:text-lg md:leading-normal md:break-normal md:hyphens-none',
  },
  carousel: {
    padding: 'p-3 lg:p-4',
    symbol: 'text-3xl lg:text-4xl',
    name: 'text-sm leading-tight break-words hyphens-auto lg:text-lg lg:leading-normal lg:break-normal lg:hyphens-none',
  },
} as const;

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
  const density = DENSITY_CLASSES[compact ? 'carousel' : 'grid'];

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
        density.padding,
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
      <ZodiacSymbol symbol={signInfo.symbol} label={signInfo.nameEs} className={density.symbol} />
      <p className={cn('mt-2 font-serif', density.name)}>{signInfo.nameEs}</p>
    </Card>
  );
}
