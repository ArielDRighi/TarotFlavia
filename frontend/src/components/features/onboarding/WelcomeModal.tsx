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
import { Alert, AlertDescription } from '@/components/ui/alert';
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
 */
export function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]" aria-label="Modal de bienvenida">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl text-purple-700 dark:text-purple-400">
            ¡Bienvenido al Oráculo de Tarot! ✨
          </DialogTitle>
          <DialogDescription className="text-base">
            Tu cuenta ha sido creada exitosamente. Aquí está lo que puedes hacer:
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* FREE Plan Features */}
          <div className="space-y-3">
            <h3 className="font-semibold text-purple-600 dark:text-purple-400">
              Con tu plan FREE puedes:
            </h3>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Calendar className="mt-0.5 h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">Carta del Día</p>
                  <p className="text-muted-foreground text-sm">
                    Recibe 1 carta del día con significado básico
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Wand2 className="mt-0.5 h-5 w-5 text-purple-500" />
                <div>
                  <p className="font-medium">1 Lectura por Día</p>
                  <p className="text-muted-foreground text-sm">
                    Crea 1 lectura personalizada con múltiples cartas (sin interpretación de IA)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* PREMIUM Differences */}
          <Alert variant="info">
            <Sparkles className="h-5 w-5" />
            <AlertDescription>
              <p className="font-semibold">¿Quieres más? Prueba PREMIUM</p>
              <p className="mt-1 text-sm">
                Lecturas ilimitadas con interpretación de IA personalizada para profundizar en cada
                tirada
              </p>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button onClick={onClose} className="w-full" size="lg">
            Comenzar a Explorar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
