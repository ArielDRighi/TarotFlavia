'use client';

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
  /** Callback when an animal is selected */
  onSelect: (animal: ChineseZodiacAnimal) => void;
  /** Additional CSS classes */
  className?: string;
}

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
  onSelect,
  className,
}: ChineseAnimalSelectorProps) {
  const animals = Object.values(CHINESE_ZODIAC_INFO);

  return (
    <div
      data-testid="chinese-animal-selector"
      className={cn('grid grid-cols-3 gap-4 md:grid-cols-4 lg:grid-cols-6', className)}
    >
      {animals.map((info) => (
        <ChineseAnimalCard
          key={info.animal}
          animalInfo={info}
          isSelected={selectedAnimal === info.animal}
          isUserAnimal={userAnimal === info.animal}
          onClick={onSelect}
        />
      ))}
    </div>
  );
}
