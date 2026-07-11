'use client';

import * as React from 'react';

import { ChineseAnimalCard } from './ChineseAnimalCard';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import { cn } from '@/lib/utils';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/**
 * ChineseAnimalSelector Component Props
 */
export interface ChineseAnimalSelectorProps {
  /** Currently selected animal */
  selectedAnimal?: ChineseZodiacAnimal | null;
  /** User's Chinese zodiac animal */
  userAnimal?: ChineseZodiacAnimal | null;
  /**
   * Layout of the 12 cards.
   * - `grid` (default): responsive grid that wraps. Used on the listing page.
   * - `carousel`: single row of fixed-width cards with intentional horizontal
   *   scroll. Used as a quick switcher on the detail page.
   */
  variant?: ChineseAnimalSelectorVariant;
  /** Callback when an animal is selected */
  onSelect: (animal: ChineseZodiacAnimal) => void;
  /** Additional CSS classes */
  className?: string;
}

export type ChineseAnimalSelectorVariant = 'grid' | 'carousel';

const LAYOUT_CLASSES: Record<ChineseAnimalSelectorVariant, string> = {
  grid: 'grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6',
  carousel: 'flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2',
};

/**
 * En el carrusel las tarjetas NO pueden encogerse: con columnas fluidas quedaban
 * de ~55px en móvil y los nombres largos ("Serpiente") se cortaban (PROD-008).
 */
const CAROUSEL_CARD_CLASSES = 'w-28 shrink-0 snap-start';

/**
 * ChineseAnimalSelector Component
 *
 * Displays a grid of all 12 Chinese zodiac animals as selectable cards.
 * Used to allow users to select an animal to view its horoscope.
 *
 * Features:
 * - Grid layout with 12 animal cards
 * - Responsive grid (3 cols mobile, 4 tablet, 6 desktop)
 * - Selected state highlighting
 * - User's animal highlighting
 * - Click handler for selection
 *
 * @example
 * ```tsx
 * <ChineseAnimalSelector
 *   selectedAnimal={ChineseZodiacAnimal.DRAGON}
 *   userAnimal={userAnimal}
 *   onSelect={(animal) => handleAnimalSelect(animal)}
 * />
 * ```
 */
export function ChineseAnimalSelector({
  selectedAnimal,
  userAnimal,
  variant = 'grid',
  onSelect,
  className,
}: ChineseAnimalSelectorProps) {
  const animals = Object.values(CHINESE_ZODIAC_INFO);
  const isCarousel = variant === 'carousel';
  const containerRef = React.useRef<HTMLDivElement>(null);

  // En el carrusel (una sola fila) la tarjeta activa puede quedar fuera de pantalla:
  // la traemos al centro para que se vea cuál está seleccionada. En el grid entran
  // todas, así que no hace falta.
  React.useEffect(() => {
    if (!isCarousel || !selectedAnimal) return;

    const card = containerRef.current?.querySelector(
      `[data-testid="chinese-animal-${selectedAnimal}"]`
    );
    card?.scrollIntoView?.({ inline: 'center', block: 'nearest' });
  }, [isCarousel, selectedAnimal]);

  return (
    <div
      ref={containerRef}
      data-testid="chinese-animal-selector"
      className={cn(LAYOUT_CLASSES[variant], className)}
    >
      {animals.map((info) => (
        <ChineseAnimalCard
          key={info.animal}
          animalInfo={info}
          isSelected={selectedAnimal === info.animal}
          isUserAnimal={userAnimal === info.animal}
          compact={isCarousel}
          onClick={onSelect}
          className={isCarousel ? CAROUSEL_CARD_CLASSES : undefined}
        />
      ))}
    </div>
  );
}
