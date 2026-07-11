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
   * `true` when the card lives in the carousel (fixed 112px width up to `lg:`).
   * Changes only the breakpoint at which the full-size look is restored — see
   * DENSITY_CLASSES.
   */
  compact?: boolean;
  /** Callback when card is clicked */
  onClick?: (animal: ChineseZodiacAnimal) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * PROD-008: el nombre se recortaba en toda tarjeta angosta. La tarjeta arranca
 * chica (`text-sm`, con wrap) y recupera el tamaño original en cuanto hay ancho.
 * Lo único que cambia entre densidades es DÓNDE está ese punto:
 *
 * - `grid` (listado): a partir de `md:` hay 4 columnas anchas → look original.
 * - `carousel` (detalle móvil): las tarjetas miden 112px fijos hasta `lg:`, así que
 *   el look original recién vuelve ahí, donde el selector pasa a ser grid otra vez.
 *
 * Clases literales a propósito: Tailwind no puede escanear strings construidos.
 */
const DENSITY_CLASSES = {
  grid: {
    padding: 'p-3 md:p-4',
    symbol: 'mx-auto block text-3xl md:text-4xl',
    name: 'text-sm leading-tight break-words hyphens-auto md:text-lg md:leading-normal md:break-normal md:hyphens-none',
  },
  carousel: {
    padding: 'p-3 lg:p-4',
    symbol: 'mx-auto block text-3xl lg:text-4xl',
    name: 'text-sm leading-tight break-words hyphens-auto lg:text-lg lg:leading-normal lg:break-normal lg:hyphens-none',
  },
} as const;

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
  const density = DENSITY_CLASSES[compact ? 'carousel' : 'grid'];

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
        density.padding,
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
        className={density.symbol}
      />
      <p className={cn('mt-2 font-serif', density.name)}>{animalInfo.nameEs}</p>
    </Card>
  );
}
