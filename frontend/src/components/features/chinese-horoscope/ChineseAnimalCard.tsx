'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ChineseZodiacAnimal, ChineseZodiacInfo } from '@/types/chinese-horoscope.types';

/**
 * ChineseAnimalCard Component Props
 */
export interface ChineseAnimalCardProps {
  /** Animal information */
  animalInfo: ChineseZodiacInfo;
  /** Whether this animal is currently selected */
  isSelected?: boolean;
  /** Whether this is the user's Chinese zodiac animal */
  isUserAnimal?: boolean;
  /** Callback when card is clicked */
  onClick?: (animal: ChineseZodiacAnimal) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * ChineseAnimalCard Component
 *
 * Displays a single Chinese zodiac animal card with emoji and name.
 * Used in the Chinese zodiac animal selector.
 *
 * Features:
 * - Emoji and name display
 * - Selected state with ring styling
 * - User's animal indicator
 * - Hover effects with scale
 * - Clickable with keyboard support
 * - Accessible with role="button"
 *
 * @example
 * ```tsx
 * <ChineseAnimalCard
 *   animalInfo={CHINESE_ZODIAC_INFO[ChineseZodiacAnimal.DRAGON]}
 *   isSelected={selectedAnimal === ChineseZodiacAnimal.DRAGON}
 *   isUserAnimal={userAnimal === ChineseZodiacAnimal.DRAGON}
 *   onClick={(animal) => handleAnimalSelect(animal)}
 * />
 * ```
 */
export function ChineseAnimalCard({
  animalInfo,
  isSelected = false,
  isUserAnimal = false,
  onClick,
  className,
}: ChineseAnimalCardProps) {
  const handleClick = React.useCallback(() => {
    if (onClick) {
      onClick(animalInfo.animal);
    }
  }, [onClick, animalInfo.animal]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (onClick) {
          onClick(animalInfo.animal);
        }
      }
    },
    [onClick, animalInfo.animal]
  );

  return (
    <Card
      data-testid={`chinese-animal-${animalInfo.animal}`}
      className={cn(
        'cursor-pointer p-4 text-center transition-all',
        'hover:scale-105 hover:shadow-md',
        isSelected && 'ring-primary ring-2',
        isUserAnimal && 'border-2 border-red-500',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
    >
      <span className="text-4xl">{animalInfo.emoji}</span>
      <p className="mt-2 font-serif text-lg">{animalInfo.nameEs}</p>
      {isUserAnimal && <span className="text-xs font-medium text-red-500">Tu animal</span>}
    </Card>
  );
}
