/**
 * BirthDateSelectorModal Component
 *
 * Modal para solicitar la fecha de nacimiento completa cuando el usuario
 * quiere ver el horóscopo de otro animal que no es el suyo.
 * Requiere día, mes y año para calcular correctamente el animal y elemento
 * considerando que el año nuevo chino varía cada año.
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
  /** Callback when birth date is confirmed (format: YYYY-MM-DD) */
  onConfirm: (birthDate: string) => void;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * BirthDateSelectorModal Component
 *
 * Displays a modal dialog to request the full birth date when a user
 * wants to view the horoscope for an animal other than their own.
 *
 * Features:
 * - Date input for full birth date (day, month, year)
 * - Validation for date range (1900 - current date)
 * - Confirm/Cancel buttons
 * - Resets input when modal is reopened
 *
 * Note: Full birth date is required because the Chinese New Year
 * varies each year (can be between January and February), so
 * someone born in January might belong to the previous Chinese year.
 *
 * @example
 * ```tsx
 * <YearSelectorModal
 *   open={isOpen}
 *   animalNameEs="Dragón"
 *   animalEmoji="🐉"
 *   onConfirm={(birthDate) => handleBirthDateConfirm(birthDate)}
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
  const [birthDate, setBirthDate] = useState<string>('');
  const [error, setError] = useState<string>('');

  const today = new Date().toISOString().split('T')[0];
  const minDate = '1900-01-01';

  // Wrap onOpenChange to reset form when modal closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        // Reset form state when closing
        setBirthDate('');
        setError('');
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
  );

  const validateDate = (dateValue: string): boolean => {
    if (!dateValue) {
      setError('');
      return false;
    }

    const date = new Date(dateValue);
    const minDateObj = new Date(minDate);
    const todayObj = new Date(today);

    if (isNaN(date.getTime())) {
      setError('Fecha inválida');
      return false;
    }

    if (date < minDateObj || date > todayObj) {
      setError('La fecha debe ser entre 1900 y hoy');
      return false;
    }

    setError('');
    return true;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setBirthDate(value);
    validateDate(value);
  };

  const handleConfirm = () => {
    if (validateDate(birthDate)) {
      onConfirm(birthDate);
      handleOpenChange(false);
    }
  };

  const handleCancel = () => {
    handleOpenChange(false);
  };

  const isDateValid = birthDate !== '' && !error;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="year-selector-modal">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {animalEmoji && <span className="text-2xl">{animalEmoji}</span>}
            <span>¿Cuándo nació esta persona?</span>
          </DialogTitle>
          <DialogDescription>
            Para ver el horóscopo personalizado de {animalNameEs}, necesitamos la fecha de
            nacimiento completa para calcular correctamente el animal y elemento (el año nuevo chino
            varía cada año).
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="birth-date">Fecha de nacimiento</Label>
            <Input
              id="birth-date"
              type="date"
              min={minDate}
              max={today}
              value={birthDate}
              onChange={handleDateChange}
              aria-invalid={!!error}
              aria-describedby={error ? 'date-error' : undefined}
            />
            {error && (
              <p id="date-error" className="text-destructive text-sm">
                {error}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} disabled={!isDateValid}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
