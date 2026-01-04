'use client';

import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ReactNode } from 'react';

/**
 * Props for PremiumPreview component
 */
export interface PremiumPreviewProps {
  /** Content to blur (premium feature) */
  children: ReactNode;
  /** Callback when user clicks upgrade */
  onUpgrade: () => void;
  /** Optional custom message */
  message?: string;
}

/**
 * PremiumPreview Component
 *
 * Envuelve contenido premium con un efecto blur y overlay
 * que invita a actualizar a Premium.
 *
 * Usado para mostrar previews de:
 * - Interpretaciones personalizadas (blurred)
 * - Estadísticas avanzadas (blurred)
 * - Features premium en general
 *
 * @example
 * ```tsx
 * <PremiumPreview onUpgrade={() => router.push('/registro')}>
 *   <div className="p-4">
 *     <h3>Interpretación personalizada</h3>
 *     <p>Esta es una interpretación profunda...</p>
 *   </div>
 * </PremiumPreview>
 * ```
 */
export default function PremiumPreview({
  children,
  onUpgrade,
  message = 'Desbloquea este contenido con Premium',
}: PremiumPreviewProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border">
      {/* Blurred content - hidden from screen readers */}
      <div className="pointer-events-none blur-sm" aria-hidden="true">
        {children}
      </div>

      {/* Overlay with CTA */}
      <div className="from-background/95 via-background/80 to-background/60 absolute inset-0 flex items-center justify-center bg-gradient-to-t backdrop-blur-sm">
        <div className="flex max-w-sm flex-col items-center gap-4 p-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Lock className="text-accent h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-foreground font-serif text-lg font-semibold">{message}</h3>
            <p className="text-muted-foreground text-sm">
              Accede a interpretaciones personalizadas y todas las funcionalidades avanzadas
            </p>
          </div>
          <Button
            onClick={onUpgrade}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            Actualizar a Premium
          </Button>
        </div>
      </div>
    </div>
  );
}
