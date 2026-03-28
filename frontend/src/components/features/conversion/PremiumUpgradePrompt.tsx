'use client';

import { useRouter } from 'next/navigation';
import { Gem, Lock, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';
import type { CreatePreapprovalResponse } from '@/types';
import { ROUTES } from '@/lib/constants/routes';

// ============================================================================
// Constants
// ============================================================================

const PREMIUM_BENEFITS = [
  'Interpretaciones personalizadas y profundas',
  'Lecturas ilimitadas',
  'Todas las tiradas disponibles',
  'Preguntas personalizadas',
] as const;

// ============================================================================
// Types
// ============================================================================

export type PremiumUpgradeVariant = 'modal' | 'inline' | 'banner';
export type PremiumUpgradeTrigger = 'discovery' | 'limit-reached';

export interface PremiumUpgradePromptProps {
  /** Nombre del feature bloqueado (ej: "preguntas personalizadas") */
  feature: string;
  /** Tipo de visualización */
  variant: PremiumUpgradeVariant;
  /** Contexto del prompt */
  trigger?: PremiumUpgradeTrigger;
  /** Controla visibilidad del prompt (requerido para modal; ignorado en otros variants) */
  open?: boolean;
  /** Callback al cerrar (requerido para modal) */
  onClose?: () => void;
}

// ============================================================================
// Helpers
// ============================================================================

function buildTitleByTrigger(trigger: PremiumUpgradeTrigger | undefined, feature: string): string {
  if (trigger === 'limit-reached') {
    return `Alcanzaste el límite para ${feature}`;
  }
  return `Desbloquea ${feature} con Premium`;
}

// ============================================================================
// Sub-components
// ============================================================================

interface CtaButtonProps {
  isPending: boolean;
  onClick: () => void;
}

function CtaButton({ isPending, onClick }: CtaButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isPending}
      className="bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
      size="lg"
    >
      {isPending ? (
        'Cargando...'
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          Obtener Premium
        </>
      )}
    </Button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * PremiumUpgradePrompt
 *
 * Componente reutilizable que unifica los prompts de upgrade a Premium.
 * Soporta tres variantes visuales y conecta directamente con el flujo
 * de suscripción de MercadoPago.
 *
 * Lógica de usuario:
 * - Premium → no se renderiza (early return)
 * - Anónimo → redirige a /registro?redirect=/premium
 * - Free → llama useCreatePreapproval() y redirige a MP
 *
 * @example
 * ```tsx
 * // Modal variant
 * <PremiumUpgradePrompt
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   feature="preguntas personalizadas"
 *   variant="modal"
 * />
 *
 * // Inline variant (siempre visible cuando se renderiza)
 * <PremiumUpgradePrompt
 *   feature="tiradas avanzadas"
 *   variant="inline"
 * />
 *
 * // Banner variant
 * <PremiumUpgradePrompt
 *   feature="interpretaciones personalizadas"
 *   variant="banner"
 * />
 * ```
 */
export default function PremiumUpgradePrompt({
  feature,
  variant,
  trigger,
  open = true,
  onClose,
}: PremiumUpgradePromptProps) {
  // Hooks
  const router = useRouter();
  const { user } = useAuth();
  const { mutate: createPreapproval, isPending } = useCreatePreapproval();

  // Derived state
  const isPremium = user?.plan === 'premium';
  const isAuthenticated = user !== null;
  const title = buildTitleByTrigger(trigger, feature);

  // Early return: premium users see nothing
  if (isPremium) {
    return null;
  }

  // Handler
  const handleUpgradeClick = () => {
    if (!isAuthenticated) {
      router.push(`${ROUTES.REGISTER}?redirect=${ROUTES.PREMIUM}`);
      return;
    }

    createPreapproval(undefined, {
      onSuccess: (data: CreatePreapprovalResponse) => {
        window.location.href = data.initPoint;
      },
    });
  };

  // ── Variant: modal ─────────────────────────────────────────────────────────
  if (variant === 'modal') {
    return (
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose?.()}>
        <DialogContent className="max-w-lg" data-testid="premium-upgrade-prompt-modal">
          <DialogHeader>
            <div className="bg-accent/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Lock className="text-accent h-8 w-8" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center font-serif text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-center text-base">
              Accede a interpretaciones personalizadas y todas las funcionalidades avanzadas con
              Premium
            </DialogDescription>
          </DialogHeader>

          {/* Premium benefits */}
          <div className="space-y-2 rounded-lg border bg-gradient-to-br from-purple-50/50 to-pink-50/50 p-4 dark:from-purple-950/20 dark:to-pink-950/20">
            {PREMIUM_BENEFITS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <Sparkles className="text-accent h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-foreground text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <CtaButton isPending={isPending} onClick={handleUpgradeClick} />
            {onClose && (
              <Button variant="outline" onClick={onClose} className="w-full" size="lg">
                Ahora no
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Variant: inline ────────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <div
        className="relative overflow-hidden rounded-lg border bg-gradient-to-br from-purple-50/80 to-pink-50/80 p-6 text-center dark:from-purple-950/20 dark:to-pink-950/20"
        data-testid="premium-upgrade-prompt-inline"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
            <Lock className="text-accent h-7 w-7" aria-hidden="true" />
          </div>
          <div className="space-y-1">
            <h3 className="text-foreground font-serif text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground text-sm">
              Desbloquea <span className="font-medium">{feature}</span> y mucho más con Premium
            </p>
          </div>
          <CtaButton isPending={isPending} onClick={handleUpgradeClick} />
        </div>
      </div>
    );
  }

  // ── Variant: banner ────────────────────────────────────────────────────────
  return (
    <div
      className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white shadow-lg"
      data-testid="premium-upgrade-prompt-banner"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gem className="mt-1 h-6 w-6 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="mb-1 font-semibold">Desbloquea {feature}</h3>
            <p className="text-sm text-white/90">
              Con Premium obtienes acceso a todas las funcionalidades avanzadas y análisis
              personalizados.
            </p>
          </div>
        </div>
        <Button
          onClick={handleUpgradeClick}
          disabled={isPending}
          variant="secondary"
          className="flex-shrink-0 bg-white text-purple-600 hover:bg-white/90"
        >
          {isPending ? 'Cargando...' : 'Obtener Premium'}
        </Button>
      </div>
    </div>
  );
}
