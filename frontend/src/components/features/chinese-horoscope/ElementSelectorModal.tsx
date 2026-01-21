/**
 * ElementSelectorModal Component
 *
 * Modal para seleccionar el elemento Wu Xing (Metal, Agua, Madera, Fuego, Tierra)
 * cuando el usuario hace clic en un animal del zodiaco chino.
 * Reemplaza el YearSelectorModal para evitar confusión entre animal clickeado
 * y animal calculado por fecha de nacimiento.
 */

'use client';

import { useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';
import {
  ChineseElementCode,
  getExampleYearsForAnimalElement,
  getElementNameEs,
  getElementIcon,
} from '@/lib/utils/chinese-zodiac';

export interface ElementSelectorModalProps {
  /** Controls modal visibility */
  open: boolean;
  /** Chinese zodiac animal enum value */
  animal: ChineseZodiacAnimal;
  /** Animal name in Spanish */
  animalNameEs: string;
  /** Animal emoji (optional) */
  animalEmoji?: string;
  /** Callback when element is selected */
  onSelectElement: (element: ChineseElementCode) => void;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

const WU_XING_ELEMENTS: ChineseElementCode[] = ['metal', 'water', 'wood', 'fire', 'earth'];

/**
 * ElementSelectorModal Component
 *
 * Displays a modal dialog to select one of the 5 Wu Xing elements
 * for a specific Chinese zodiac animal.
 *
 * Features:
 * - Shows 5 element options with icons and names
 * - Displays 3 example years for each element (spanning 60-year cycles)
 * - Auto-confirms and closes after selection
 * - Help text pointing to calculator for exact birth element
 *
 * UX Benefits:
 * - User explores any animal+element combination without confusion
 * - No mismatch between clicked animal and calculated result
 * - Clear separation between "explore" and "calculate my sign" flows
 *
 * @example
 * ```tsx
 * <ElementSelectorModal
 *   open={isOpen}
 *   animal={ChineseZodiacAnimal.MONKEY}
 *   animalNameEs="Mono"
 *   animalEmoji="🐒"
 *   onSelectElement={(element) => handleElementSelect(element)}
 *   onOpenChange={setIsOpen}
 * />
 * ```
 */
export function ElementSelectorModal({
  open,
  animal,
  animalNameEs,
  animalEmoji,
  onSelectElement,
  onOpenChange,
}: ElementSelectorModalProps) {
  const handleElementChange = useCallback(
    (value: string) => {
      const element = value as ChineseElementCode;
      onSelectElement(element);
      onOpenChange(false); // Auto-close after selection
    },
    [onSelectElement, onOpenChange]
  );

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent data-testid="element-selector-modal" className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {animalEmoji && <span className="text-2xl">{animalEmoji}</span>}
            <span>{animalNameEs}</span>
          </DialogTitle>
          <DialogDescription>Selecciona tu elemento Wu Xing</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <RadioGroup
            onValueChange={handleElementChange}
            aria-label="Selecciona un elemento Wu Xing"
          >
            {WU_XING_ELEMENTS.map((element) => {
              const elementNameEs = getElementNameEs(element);
              const elementIcon = getElementIcon(element);
              const exampleYears = getExampleYearsForAnimalElement(animal, element);

              return (
                <div key={element} className="flex items-center space-x-3 py-2">
                  <RadioGroupItem value={element} id={`element-${element}`} />
                  <Label
                    htmlFor={`element-${element}`}
                    className="flex flex-1 cursor-pointer items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <span className="text-xl">{elementIcon}</span>
                      <span className="font-medium">{elementNameEs}</span>
                    </span>
                    <span className="text-muted-foreground text-sm">{exampleYears.join(', ')}</span>
                  </Label>
                </div>
              );
            })}
          </RadioGroup>
        </div>

        <div className="bg-muted rounded-lg p-3 text-sm">
          <p className="text-muted-foreground">
            💡 <strong>¿No sabes tu elemento?</strong>
          </p>
          <p className="text-muted-foreground mt-1">
            Usa el calculador en la página principal con tu fecha de nacimiento para calcular tu
            animal y elemento exactos.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
