/**
 * YearInputBanner Component
 *
 * Banner que solicita el año de nacimiento para calcular el elemento del zodiaco chino
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export interface YearInputBannerProps {
  onYearSubmit: (year: number) => void | Promise<void>;
  animalName?: string;
  className?: string;
}

const MIN_YEAR = 1900;
const MAX_YEAR = 2100;

export function YearInputBanner({ onYearSubmit, animalName, className }: YearInputBannerProps) {
  const [year, setYear] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setError('');

    const yearNum = parseInt(year, 10);

    if (isNaN(yearNum)) {
      setError('Por favor ingresa un año válido');
      return;
    }

    if (yearNum < MIN_YEAR || yearNum > MAX_YEAR) {
      setError(`El año debe estar entre ${MIN_YEAR} y ${MAX_YEAR}`);
      return;
    }

    try {
      setIsLoading(true);
      await onYearSubmit(yearNum);
    } catch {
      setError('Error al calcular. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && year) {
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYear(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Card data-testid="year-input-banner" className={`p-6 ${className || ''}`}>
      <div className="mb-4">
        <h3 className="font-serif text-lg">
          {animalName
            ? `¿En qué año nació la persona del ${animalName}?`
            : '¿En qué año nació esta persona?'}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Ingresa el año de nacimiento para ver el horóscopo personalizado
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={year}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Ej: 1988"
          aria-label="Año de nacimiento"
          className="max-w-[200px]"
        />
        <Button onClick={handleSubmit} disabled={!year || isLoading}>
          {isLoading ? 'Calculando...' : 'Calcular'}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </Card>
  );
}
