'use client';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Suit, SUIT_INFO } from '@/types/encyclopedia.types';

/**
 * SuitSelector Component Props
 */
export interface SuitSelectorProps {
  /** Currently selected suit */
  selected?: Suit;
  /** Callback when a suit is selected */
  onSelect: (suit: Suit | undefined) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * SuitSelector Component
 *
 * Horizontal scrollable selector for tarot card suits.
 *
 * Features:
 * - "Todos" button to clear suit filter
 * - One button per suit (Bastos, Copas, Espadas, Oros)
 * - Active state highlighting for selected suit
 * - Suit symbols with colored labels
 * - Horizontal scrolling on mobile
 *
 * @example
 * ```tsx
 * <SuitSelector
 *   selected={selectedSuit}
 *   onSelect={setSelectedSuit}
 * />
 * ```
 */
export function SuitSelector({ selected, onSelect, className }: SuitSelectorProps) {
  const allSuits = Object.values(Suit);

  return (
    <div data-testid="suit-selector" className={cn('flex gap-2 overflow-x-auto pb-2', className)}>
      <Button
        variant={selected === undefined ? 'default' : 'outline'}
        size="sm"
        onClick={() => onSelect(undefined)}
      >
        Todos
      </Button>
      {allSuits.map((suit) => {
        const info = SUIT_INFO[suit];

        return (
          <Button
            key={suit}
            variant={selected === suit ? 'default' : 'outline'}
            size="sm"
            onClick={() => onSelect(suit)}
            className="gap-1 whitespace-nowrap"
          >
            <span>{info.symbol}</span>
            <span>{info.nameEs}</span>
          </Button>
        );
      })}
    </div>
  );
}
