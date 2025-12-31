'use client';

import { Check, History, CalendarDays, LayoutGrid } from 'lucide-react';
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
 * Props for RegisterCTAModal component
 */
export interface RegisterCTAModalProps {
  /** Is modal open? */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Callback when user clicks register */
  onRegister: () => void;
}

/**
 * Benefits of registering (FREE plan)
 */
const REGISTER_BENEFITS = [
  {
    icon: History,
    text: 'Guarda tu historial',
    description: 'Accede a todas tus lecturas cuando quieras',
  },
  {
    icon: CalendarDays,
    text: '2 lecturas diarias',
    description: 'El doble de lecturas que usuarios anónimos',
  },
  {
    icon: LayoutGrid,
    text: 'Todas las tiradas',
    description: 'Acceso a todos los tipos de tiradas disponibles',
  },
] as const;

/**
 * RegisterCTAModal Component
 *
 * Modal de conversión que aparece después de la primera tirada anónima
 * para convertir usuarios ANONYMOUS a FREE (registro).
 *
 * Muestra beneficios del plan FREE y tiene CTA claro para registrarse.
 *
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 *
 * <RegisterCTAModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   onRegister={() => router.push('/registro')}
 * />
 * ```
 */
export default function RegisterCTAModal({ open, onClose, onRegister }: RegisterCTAModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="mb-2 text-center font-serif text-2xl">
            ¿Te gustó tu lectura?
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            Regístrate gratis y desbloquea más funcionalidades
          </DialogDescription>
        </DialogHeader>

        {/* Benefits list */}
        <div className="space-y-4 py-4">
          {REGISTER_BENEFITS.map((benefit) => (
            <div key={benefit.text} className="flex items-start gap-3">
              <div className="mt-1 flex-shrink-0">
                <div className="bg-accent/20 flex h-10 w-10 items-center justify-center rounded-full">
                  <benefit.icon className="text-accent h-5 w-5" />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <h3 className="text-foreground font-semibold">{benefit.text}</h3>
                </div>
                <p className="text-muted-foreground mt-1 text-sm">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <DialogFooter className="flex-col gap-3 sm:flex-col">
          <Button
            onClick={onRegister}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            Registrarme Gratis
          </Button>
          <Button variant="outline" onClick={onClose} className="w-full" size="lg">
            No, gracias
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
