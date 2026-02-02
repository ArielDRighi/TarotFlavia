'use client';

import { useState } from 'react';
import { Star, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import type { RitualDetail } from '@/types/ritual.types';

/**
 * RitualCompletedModal Component Props
 */
export interface RitualCompletedModalProps {
  /** Ritual detail information */
  ritual: RitualDetail;
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when ritual is marked as completed */
  onComplete: (notes?: string, rating?: number) => void;
}

/**
 * RitualCompletedModal Component
 *
 * Modal dialog for marking a ritual as completed, allowing users
 * to add an optional rating and personal notes.
 *
 * Features:
 * - 5-star rating system (optional)
 * - Personal notes textarea (optional)
 * - Ritual title in description
 * - Cancel and save actions
 * - Form state reset after completion
 * - Accessible with proper ARIA labels
 *
 * @example
 * ```tsx
 * <RitualCompletedModal
 *   ritual={ritual}
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   onComplete={(notes, rating) => handleComplete(notes, rating)}
 * />
 * ```
 */
export function RitualCompletedModal({
  ritual,
  isOpen,
  onClose,
  onComplete,
}: RitualCompletedModalProps) {
  const [notes, setNotes] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const handleComplete = () => {
    onComplete(notes || undefined, rating || undefined);
    setNotes('');
    setRating(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="ritual-completed-modal">
        <DialogHeader>
          <div className="text-center">
            <Sparkles className="mx-auto mb-2 h-12 w-12 text-yellow-500" />
            <DialogTitle className="font-serif text-2xl">Marcar como Completado</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <p className="text-muted-foreground text-center">
            ¿Completaste &quot;{ritual.title}&quot;? Registra tu experiencia.
          </p>

          {/* Rating */}
          <div className="text-center">
            <Label className="text-muted-foreground mb-2 block text-sm">
              Califica tu experiencia
            </Label>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => setRating(value)}
                  className="p-1 transition-colors"
                  type="button"
                  aria-label={`Calificar ${value} de 5 estrellas`}
                >
                  <Star
                    className={cn(
                      'h-8 w-8',
                      rating && value <= rating
                        ? 'fill-yellow-500 text-yellow-500'
                        : 'text-muted-foreground'
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notas personales (opcional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="¿Cómo te sentiste? ¿Qué insights tuviste?"
              rows={3}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleComplete}>
            Guardar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
