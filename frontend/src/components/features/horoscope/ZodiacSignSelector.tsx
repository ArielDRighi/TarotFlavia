'use client';

import * as React from 'react';

import { ZodiacSignCard } from './ZodiacSignCard';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { cn } from '@/lib/utils';
import type { ZodiacSign } from '@/types/horoscope.types';

/**
 * ZodiacSignSelector Component Props
 */
export interface ZodiacSignSelectorProps {
  /** Currently selected zodiac sign */
  selectedSign?: ZodiacSign | null;
  /** User's zodiac sign (to highlight) */
  userSign?: ZodiacSign | null;
  /**
   * Layout of the 12 cards.
   * - `grid` (default): responsive grid that wraps. Used on the listing pages.
   * - `carousel`: single row of fixed-width cards with intentional horizontal
   *   scroll. Used as a quick switcher on the detail pages.
   */
  variant?: ZodiacSignSelectorVariant;
  /** Callback when a sign is selected */
  onSelect: (sign: ZodiacSign) => void;
  /** Additional CSS classes */
  className?: string;
}

export type ZodiacSignSelectorVariant = 'grid' | 'carousel';

const LAYOUT_CLASSES: Record<ZodiacSignSelectorVariant, string> = {
  grid: 'grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6',
  carousel: 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2',
};

/**
 * En el carrusel las tarjetas NO pueden encogerse: con columnas fluidas quedaban
 * de ~55px en móvil y los nombres largos ("Capricornio") se cortaban (PROD-008).
 */
const CAROUSEL_CARD_CLASSES = 'w-28 shrink-0 snap-start';

/**
 * ZodiacSignSelector Component
 *
 * Grid selector displaying all 12 zodiac signs.
 * Used on horoscope pages to allow users to browse different signs.
 *
 * Features:
 * - Displays all 12 zodiac signs in a responsive grid
 * - Highlights selected sign with ring
 * - Highlights user's sign with accent border
 * - Responsive layout (3 cols mobile, 4 cols tablet, 6 cols desktop)
 * - Passes click events to parent component
 *
 * @example
 * ```tsx
 * <ZodiacSignSelector
 *   selectedSign={selectedSign}
 *   userSign={userSign}
 *   onSelect={(sign) => router.push(`/horoscopo/${sign}`)}
 * />
 * ```
 */
export function ZodiacSignSelector({
  selectedSign,
  userSign,
  variant = 'grid',
  onSelect,
  className,
}: ZodiacSignSelectorProps) {
  const signs = React.useMemo(() => Object.values(ZODIAC_SIGNS_INFO), []);
  const isCarousel = variant === 'carousel';
  const containerRef = React.useRef<HTMLDivElement>(null);

  // En el carrusel (una sola fila) la tarjeta activa puede quedar fuera de pantalla:
  // la traemos al centro para que se vea cuál está seleccionada. En el grid entran
  // todas, así que no hace falta.
  React.useEffect(() => {
    if (!isCarousel || !selectedSign) return;

    const card = containerRef.current?.querySelector(`[data-testid="zodiac-card-${selectedSign}"]`);
    card?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [isCarousel, selectedSign]);

  return (
    <div
      ref={containerRef}
      data-testid="zodiac-selector"
      className={cn(LAYOUT_CLASSES[variant], className)}
    >
      {signs.map((signInfo) => (
        <ZodiacSignCard
          key={signInfo.sign}
          signInfo={signInfo}
          isSelected={selectedSign === signInfo.sign}
          isUserSign={userSign === signInfo.sign}
          compact={isCarousel}
          onClick={onSelect}
          className={isCarousel ? CAROUSEL_CARD_CLASSES : undefined}
        />
      ))}
    </div>
  );
}
