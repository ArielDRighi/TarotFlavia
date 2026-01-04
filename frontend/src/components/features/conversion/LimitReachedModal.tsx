'use client';

import { Clock, TrendingUp, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

/**
 * Props for LimitReachedModal component
 */
export interface LimitReachedModalProps {
  /** Is modal open? */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when user clicks upgrade */
  onUpgrade: () => void;
  /** Current daily reading limit (1 for ANONYMOUS, 2 for FREE) */
  currentLimit: number;
}

/**
 * Premium benefits when limit is reached
 */
const PREMIUM_BENEFITS_LIMIT = [
  {
    icon: TrendingUp,
    text: '3 lecturas diarias',
  },
  {
    icon: Sparkles,
    text: 'Interpretaciones personalizadas',
  },
] as const;

/**
 * LimitReachedModal Component
 *
 * Modal que aparece cuando un usuario FREE o ANONYMOUS alcanza
 * su límite diario de lecturas.
 *
 * Ofrece dos opciones:
 * 1. Volver mañana (free)
 * 2. Actualizar a Premium (paid)
 *
 * @example
 * ```tsx
 * const [showLimit, setShowLimit] = useState(false);
 *
 * <LimitReachedModal
 *   open={showLimit}
 *   onClose={() => setShowLimit(false)}
 *   onUpgrade={() => router.push('/registro')}
 *   currentLimit={2}
 * />
 * ```
 */
export default function LimitReachedModal({
  open,
  onClose,
  onUpgrade,
  currentLimit,
}: LimitReachedModalProps) {
  const limitText = currentLimit === 1 ? '1 lectura' : `${currentLimit} lecturas`;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="bg-accent/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
            <Clock className="text-accent h-8 w-8" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">
            Has alcanzado tu límite diario
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Has usado tus {limitText} disponibles por hoy
          </DialogDescription>
        </DialogHeader>

        {/* Premium benefits */}
        <div className="space-y-3 rounded-lg border bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4 dark:from-purple-950/20 dark:to-pink-950/20">
          <p className="text-foreground text-center text-sm font-semibold">Con Premium tendrías:</p>
          {PREMIUM_BENEFITS_LIMIT.map((benefit) => (
            <div key={benefit.text} className="flex items-center gap-2">
              <benefit.icon className="text-accent h-5 w-5 flex-shrink-0" />
              <span className="text-foreground text-sm">{benefit.text}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button
            onClick={onUpgrade}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            Actualizar a Premium
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full" size="lg">
            Volver mañana
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
