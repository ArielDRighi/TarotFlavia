'use client';

import { Calendar, TrendingUp } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

/**
 * Props for DailyLimitReachedModal component
 */
export interface DailyLimitReachedModalProps {
  /** Is modal open? */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Current readings count */
  usedReadings: number;
  /** Total readings limit */
  totalReadings: number;
  /** Feature type (for customized messaging) */
  featureType?: 'daily-card' | 'tarot-reading';
}

/**
 * DailyLimitReachedModal Component
 *
 * Modal para usuarios PREMIUM que han alcanzado su límite diario.
 * Muestra un mensaje amable indicando que el límite se reinicia mañana.
 *
 * A diferencia de UpgradeModal (que pide upgrade a Premium), este modal
 * es para usuarios que YA SON Premium pero alcanzaron su límite del día.
 *
 * @example
 * ```tsx
 * <DailyLimitReachedModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   usedReadings={3}
 *   totalReadings={3}
 *   featureType="tarot-reading"
 * />
 * ```
 */
export default function DailyLimitReachedModal({
  open,
  onClose,
  usedReadings,
  totalReadings,
  featureType = 'tarot-reading',
}: DailyLimitReachedModalProps) {
  const router = useRouter();

  const isTarotReading = featureType === 'tarot-reading';
  const isDailyCard = featureType === 'daily-card';

  const getContent = () => {
    if (isDailyCard) {
      return {
        title: 'Carta del día completada',
        description: 'Ya has recibido tu carta del día. Vuelve mañana para una nueva lectura.',
        icon: Calendar,
      };
    }

    // Tarot readings
    return {
      title: 'Límite diario alcanzado',
      description: `Has usado tus ${totalReadings} ${totalReadings === 1 ? 'lectura' : 'lecturas'} del día. Tu límite se reinicia mañana.`,
      icon: TrendingUp,
    };
  };

  const content = getContent();
  const Icon = content.icon;

  const handleViewHistory = () => {
    onClose();
    router.push('/historial');
  };

  const handleGoHome = () => {
    onClose();
    router.push('/');
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
            <Icon className="h-8 w-8 text-purple-600" aria-hidden="true" />
          </div>
          <DialogTitle className="text-center font-serif text-2xl">{content.title}</DialogTitle>
          <DialogDescription className="text-center text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* Stats Display */}
        <div className="my-6 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-4xl font-bold text-purple-900">{usedReadings}</span>
            <span className="text-muted-foreground">/ {totalReadings}</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            {isTarotReading ? 'Lecturas usadas hoy' : 'Carta del día usada'}
          </p>
        </div>

        {/* Info Message */}
        <div className="rounded-lg bg-blue-50 p-4">
          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-blue-900">Tu límite se reinicia mañana</p>
              <p className="mt-1 text-sm text-blue-700">
                Vuelve cada día para disfrutar de nuevas lecturas de tarot
              </p>
            </div>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button size="lg" className="w-full" onClick={handleViewHistory} variant="default">
            Ver mis lecturas anteriores
          </Button>

          <button
            onClick={handleGoHome}
            className="text-muted-foreground hover:text-text-primary text-sm transition-colors"
          >
            Volver al inicio
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
