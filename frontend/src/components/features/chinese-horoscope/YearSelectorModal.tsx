/**
 * YearSelectorModal Component
 *
 * Modal para solicitar el año de nacimiento cuando el usuario
 * quiere ver el horóscopo de otro animal que no es el suyo.
 */

'use client';

import { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface YearSelectorModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** Animal name in Spanish */
  animalNameEs: string;
  /** Animal emoji (optional) */
  animalEmoji?: string;
  /** Callback when year is confirmed */
  onConfirm: (year: number) => void;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * YearSelectorModal Component
 *
 * Displays a modal dialog to request the birth year when a user
 * wants to view the horoscope for an animal other than their own.
 *
 * Features:
 * - Input field for birth year
 * - Validation for year range (1900 - current year)
 * - Confirm/Cancel buttons
 * - Resets input when modal is reopened
 *
 * @example
 * ```tsx
 * <YearSelectorModal
 *   open={isOpen}
 *   animalNameEs="Dragón"
 *   animalEmoji="🐉"
 *   onConfirm={(year) => handleYearConfirm(year)}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export function YearSelectorModal({
  open,
  animalNameEs,
  animalEmoji,
  onConfirm,
  onOpenChange,
}: YearSelectorModalProps) {
  const [year, setYear] = useState<string>('');
  const [error, setError] = useState<string>('');

  const currentYear = new Date().getFullYear();
  const MIN_YEAR = 1900;

  // Wrap onOpenChange to reset form when modal closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset form state when closing
        setYear('');
        setError('');
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const validateYear = (yearValue: string): boolean => {
    if (!yearValue) {
      setError('');
      return false;
    }

    const yearNum = parseInt(yearValue, 10);

    if (isNaN(yearNum)) {
      setError('Año inválido');
      return false;
    }

    if (yearNum < MIN_YEAR || yearNum > currentYear) {
      setError(`El año debe ser entre ${MIN_YEAR} y ${currentYear}`);
      return false;
    }

    setError('');
    return true;
  };

  const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setYear(value);
    validateYear(value);
  };

  const handleConfirm = () => {
    if (validateYear(year)) {
      const yearNum = parseInt(year, 10);
      onConfirm(yearNum);
      handleOpenChange(false);
    }
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const isYearValid = year !== '' && !error;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="year-selector-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {animalEmoji && <span className="text-2xl">{animalEmoji}</span>}
            <span>¿En qué año nació esta persona?</span>
          </DialogTitle>
          <DialogDescription>
            Para ver el horóscopo personalizado de {animalNameEs}, necesitamos saber el año de
            nacimiento para calcular el elemento correcto.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="birth-year">Año de nacimiento</Label>
            <Input
              id="birth-year"
              type="number"
              min={MIN_YEAR}
              max={currentYear}
              placeholder="Ej: 1988"
              value={year}
              onChange={handleYearChange}
              aria-invalid={!!error}
              aria-describedby={error ? 'year-error' : undefined}
            />
            {error && (
              <p id="year-error" className="text-destructive text-sm">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isYearValid}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
