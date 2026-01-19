'use client';

import * as React from 'react';
import { useState } from 'react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCalculateAnimal } from '@/hooks/api/useChineseHoroscope';
import { CHINESE_ZODIAC_INFO } from '@/lib/utils/chinese-zodiac';
import type { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

/**
 * Get icon for Chinese element (Wu Xing)
 */
function getElementIcon(element: string): string {
  const icons: Record<string, string> = {
    metal: '⚪',
    water: '🔵',
    wood: '🟢',
    fire: '🔴',
    earth: '🟤',
  };
  return icons[element.toLowerCase()] || '';
}

/**
 * Props for AnimalCalculator component
 */
export interface AnimalCalculatorProps {
  /** Callback when animal is calculated and user wants to view horoscope */
  onAnimalFound?: (animal: ChineseZodiacAnimal) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * AnimalCalculator Component
 *
 * Allows users to calculate their Chinese zodiac animal by entering
 * their birth date. Useful for anonymous users who haven't registered.
 *
 * Features:
 * - Date input for birth date
 * - Calculates animal considering Chinese New Year
 * - Shows animal info with emoji, name, and year
 * - CTA to view full horoscope
 *
 * @example
 * ```tsx
 * <AnimalCalculator onAnimalFound={(animal) => router.push(`/horoscopo-chino/${animal}`)} />
 * ```
 */
export function AnimalCalculator({ onAnimalFound, className }: AnimalCalculatorProps) {
  const [birthDate, setBirthDate] = useState('');
  const [queryDate, setQueryDate] = useState<string | null>(null);

  const { data, isLoading, error } = useCalculateAnimal(queryDate);

  const handleCalculate = () => {
    if (birthDate) {
      setQueryDate(birthDate);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCalculate();
    }
  };

  return (
    <Card className={`p-6 ${className || ''}`} data-testid="animal-calculator">
      <h3 className="mb-4 font-serif text-lg">Descubre tu Animal del Zodiaco Chino</h3>

      <div className="mb-4 space-y-2">
        <Label htmlFor="birthDate">Tu fecha de nacimiento</Label>
        <div className="flex gap-2">
          <Input
            id="birthDate"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            onKeyDown={handleKeyDown}
            max={new Date().toISOString().split('T')[0]}
            data-testid="animal-calculator-input"
          />
          <Button
            onClick={handleCalculate}
            disabled={!birthDate || isLoading}
            data-testid="animal-calculator-button"
          >
            {isLoading ? 'Calculando...' : 'Calcular'}
          </Button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500" data-testid="animal-calculator-error">
          Error al calcular tu animal
        </p>
      )}

      {data && (
        <div className="bg-muted rounded-lg p-4 text-center" data-testid="animal-calculator-result">
          <span className="text-5xl">{CHINESE_ZODIAC_INFO[data.animal].emoji}</span>
          <p className="mt-2 font-serif text-xl" data-testid="full-zodiac-type">
            Eres {data.fullZodiacType || data.animalInfo.nameEs}
          </p>
          <p className="text-muted-foreground text-sm">Año chino: {data.chineseYear}</p>
          {data.birthElementEs && (
            <p className="text-muted-foreground mt-1 text-sm" data-testid="birth-element">
              Elemento: {getElementIcon(data.birthElement)} {data.birthElementEs}
            </p>
          )}
          <div className="mt-2 flex flex-wrap justify-center gap-1">
            {data.animalInfo.characteristics.map((char) => (
              <span
                key={char}
                className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs"
              >
                {char}
              </span>
            ))}
          </div>
          {onAnimalFound && (
            <Button
              className="mt-4"
              onClick={() => onAnimalFound(data.animal)}
              data-testid="animal-calculator-view-button"
            >
              Ver mi horóscopo
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}
