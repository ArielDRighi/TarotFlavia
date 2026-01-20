/**
 * BirthDateInputBanner Component
 *
 * Banner que solicita la fecha de nacimiento completa para calcular
 * correctamente el animal y elemento del zodiaco chino.
 * Requiere día, mes y año porque el año nuevo chino varía cada año.
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils/cn';

export interface YearInputBannerProps {
  onBirthDateSubmit: (birthDate: string) => void | Promise<void>;
  animalName?: string;
  className?: string;
}

export function YearInputBanner({
  onBirthDateSubmit,
  animalName,
  className,
}: YearInputBannerProps) {
  const [birthDate, setBirthDate] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const minDate = '1900-01-01';

  const handleSubmit = async () => {
    setError('');

    if (!birthDate) {
      setError('Por favor ingresa una fecha válida');
      return;
    }

    const date = new Date(birthDate);
    const minDateObj = new Date(minDate);
    const todayObj = new Date(today);

    if (isNaN(date.getTime()) || date < minDateObj || date > todayObj) {
      setError('La fecha debe ser entre 1900 y hoy');
      return;
    }

    try {
      setIsLoading(true);
      await onBirthDateSubmit(birthDate);
    } catch {
      setError('Error al calcular. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && birthDate) {
      handleSubmit();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthDate(e.target.value);
    if (error) {
      setError('');
    }
  };

  return (
    <Card data-testid="year-input-banner" className={cn('p-6', className)}>
      <div className="mb-4">
        <h3 className="font-serif text-lg">
          {animalName
            ? `¿Cuándo nació la persona del ${animalName}?`
            : '¿Cuándo nació esta persona?'}
        </h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Ingresa la fecha de nacimiento para ver el horóscopo personalizado
        </p>
      </div>

      <div className="flex gap-2">
        <Input
          type="date"
          min={minDate}
          max={today}
          value={birthDate}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          aria-label="Fecha de nacimiento"
          className="max-w-[200px]"
        />
        <Button onClick={handleSubmit} disabled={!birthDate || isLoading}>
          {isLoading ? 'Calculando...' : 'Calcular'}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </Card>
  );
}
