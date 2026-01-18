'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/**
 * ChineseCompatibility Component Props
 */
export interface ChineseCompatibilityProps {
  /** Compatibility information */
  compatibility: {
    best: ChineseZodiacAnimal[];
    good: ChineseZodiacAnimal[];
    challenging: ChineseZodiacAnimal[];
  };
}

/**
 * ChineseCompatibility Component
 *
 * Displays compatibility information for a Chinese zodiac animal.
 * Shows best, good, and challenging compatibilities with other animals.
 *
 * @example
 * ```tsx
 * <ChineseCompatibility
 *   compatibility={{
 *     best: [ChineseZodiacAnimal.RAT, ChineseZodiacAnimal.MONKEY],
 *     good: [ChineseZodiacAnimal.ROOSTER],
 *     challenging: [ChineseZodiacAnimal.DOG]
 *   }}
 * />
 * ```
 */
export function ChineseCompatibility({ compatibility }: ChineseCompatibilityProps) {
  const renderAnimals = (animals: ChineseZodiacAnimal[], variantClass: string) => (
    <div className="flex flex-wrap gap-2" data-testid="compatibility-group">
      {animals.map((animal) => {
        const info = CHINESE_ZODIAC_INFO[animal];
        return (
          <Badge
            key={animal}
            className={variantClass}
            data-testid={`compatibility-badge-${animal}`}
          >
            {info.emoji} {info.nameEs}
          </Badge>
        );
      })}
    </div>
  );

  return (
    <Card className="p-4" data-testid="chinese-compatibility">
      <h3 className="mb-4 font-serif text-lg">Compatibilidad</h3>

      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-medium text-green-600">Excelente compatibilidad</p>
          {renderAnimals(compatibility.best, 'bg-green-100 text-green-800 border-green-300')}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-yellow-600">Buena compatibilidad</p>
          {renderAnimals(compatibility.good, 'bg-yellow-100 text-yellow-800 border-yellow-300')}
        </div>

        <div>
          <p className="mb-2 text-sm font-medium text-red-600">Compatibilidad desafiante</p>
          {renderAnimals(compatibility.challenging, 'bg-red-100 text-red-800 border-red-300')}
        </div>
      </div>
    </Card>
  );
}
