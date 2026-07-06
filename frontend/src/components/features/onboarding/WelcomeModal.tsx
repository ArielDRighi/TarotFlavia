'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles, Calendar, Wand2 } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * WelcomeModal component
 *
 * Displayed after successful registration to explain FREE plan features,
 * limitations, and differences with PREMIUM plan.
 *
 * Estilo al canon místico (T-PREM-007): título Cormorant con token de marca,
 * íconos dorados (`text-secondary`), y la invitación a PREMIUM como callout
 * dorado de marca. Sin paleta púrpura cruda ni variantes `dark:`.
 */
export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-label="Modal de bienvenida">
        <DialogHeader>
          <DialogTitle className="text-primary font-serif text-2xl">
            ¡Bienvenido al Oráculo de Tarot! ✨
          </DialogTitle>
          <DialogDescription className="text-base">
            Tu cuenta ha sido creada exitosamente. Aquí está lo que puedes hacer:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* FREE Plan Features */}
          <div className="space-y-3">
            <h3 className="text-foreground font-semibold">Con tu plan FREE puedes:</h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Calendar className="text-secondary mt-0.5 h-5 w-5" aria-hidden="true" />
                <div>
                  <p className="font-medium">Carta del Día</p>
                  <p className="text-muted-foreground text-sm">
                    Recibe 1 carta del día con significado básico
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wand2 className="text-secondary mt-0.5 h-5 w-5" aria-hidden="true" />
                <div>
                  <p className="font-medium">1 Lectura por Día</p>
                  <p className="text-muted-foreground text-sm">
                    Crea 1 lectura personalizada con múltiples cartas (sin interpretación profunda)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PREMIUM Differences — callout dorado de marca */}
          <div className="border-secondary/40 bg-secondary/10 rounded-lg border p-4">
            <div className="flex items-start gap-3">
              <Sparkles
                className="text-secondary mt-0.5 h-5 w-5 flex-shrink-0"
                aria-hidden="true"
              />
              <div>
                <p className="text-foreground font-semibold">¿Quieres más? Prueba PREMIUM</p>
                <p className="text-muted-foreground mt-1 text-sm">
                  3 lecturas por día con interpretación personalizada para profundizar en cada
                  tirada
                </p>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="focus-visible:ring-secondary/50 w-full" size="lg">
            Comenzar a Explorar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
