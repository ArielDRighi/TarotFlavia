'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { AlertTriangle } from 'lucide-react';

interface PendulumDisclaimerProps {
  open: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

/**
 * Modal de disclaimer que se muestra ANTES DE CADA CONSULTA al péndulo.
 * El usuario debe aceptar cada vez que quiera consultar.
 */
export function PendulumDisclaimer({ open, onAccept, onCancel }: PendulumDisclaimerProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onCancel();
        }
      }}
    >
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>Aviso Importante</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground space-y-3 pt-2 text-left text-sm">
              <p>
                El Péndulo Digital es una herramienta de <strong>entretenimiento</strong> basada en
                tradiciones espirituales ancestrales.
              </p>
              <ul className="list-disc space-y-1 pl-4">
                <li>No sustituye el consejo de profesionales de salud, legales o financieros</li>
                <li>Las respuestas son generadas aleatoriamente</li>
                <li>No debe usarse para tomar decisiones importantes</li>
              </ul>
              <p>Al continuar, confirmas que entiendes que esto es solo para entretenimiento.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
          <AlertDialogCancel className="w-full sm:w-auto">Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onAccept} className="w-full sm:w-auto">
            Entiendo y Acepto
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
