'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { ShieldAlert } from 'lucide-react';

interface PendulumBlockedContentProps {
  open: boolean;
  category: string;
  onClose: () => void;
}

const CATEGORY_MESSAGES: Record<string, { title: string; recommendation: string }> = {
  salud: {
    title: 'Tema de Salud Detectado',
    recommendation: 'Te recomendamos consultar con un profesional de la salud.',
  },
  legal: {
    title: 'Tema Legal Detectado',
    recommendation: 'Te recomendamos consultar con un abogado o profesional legal.',
  },
  financiero: {
    title: 'Tema Financiero Detectado',
    recommendation: 'Te recomendamos consultar con un asesor financiero profesional.',
  },
  default: {
    title: 'Contenido Sensible Detectado',
    recommendation: 'Te recomendamos consultar con un profesional apropiado.',
  },
};

export function PendulumBlockedContent({ open, category, onClose }: PendulumBlockedContentProps) {
  const message = CATEGORY_MESSAGES[category] || CATEGORY_MESSAGES.default;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          onClose();
        }
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-amber-500" />
            <AlertDialogTitle>{message.title}</AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="text-muted-foreground space-y-3 text-sm">
              <p>Tu pregunta toca temas sensibles que no podemos abordar a través del péndulo.</p>
              <p className="font-medium">{message.recommendation}</p>
              <p>
                No se ha consumido tu consulta. Puedes modificar tu pregunta o continuar con una
                pregunta mental.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction>Entendido</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
