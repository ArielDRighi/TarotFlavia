'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import type { ChineseZodiacAnimal, ChineseZodiacInfo } from '@/types/chinese-horoscope.types';

import { ChineseAnimalSymbol } from './ChineseAnimalSymbol';

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
  /**
   * Compact look for narrow containers (carousel variant of the selector).
   * Smaller padding, symbol and name so long names ("Serpiente") fit whole.
   */
  compact?: boolean;
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
  compact = false,
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
        'cursor-pointer text-center transition-all',
        compact ? 'p-3' : 'p-4',
        'hover:scale-105 hover:shadow-md',
        isSelected && 'ring-primary ring-2',
        isUserAnimal && 'border-accent border-2',
        className
      )}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={isUserAnimal ? `${animalInfo.nameEs} (tu animal)` : undefined}
    >
      <ChineseAnimalSymbol
        animal={animalInfo.animal}
        label={animalInfo.nameEs}
        className={cn('mx-auto block', compact ? 'text-3xl' : 'text-4xl')}
      />
      <p
        className={cn(
          'mt-2 font-serif',
          // El nombre debe entrar completo aunque la tarjeta sea angosta:
          // wrap a dos líneas antes que desbordar y recortarse.
          compact ? 'text-sm leading-tight break-words' : 'text-lg'
        )}
      >
        {animalInfo.nameEs}
      </p>
    </Card>
  );
}
