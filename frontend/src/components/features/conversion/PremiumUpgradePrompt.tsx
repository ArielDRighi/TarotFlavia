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
import { CTA_PREMIUM } from '@/lib/constants/cta-copy';
import { PREMIUM_UPGRADE_HIGHLIGHTS } from '@/lib/constants/premium-benefits';

// ============================================================================
// Types
// ============================================================================

export type PremiumUpgradeVariant = 'modal' | 'inline' | 'banner';
export type PremiumUpgradeTrigger = 'discovery' | 'limit-reached';

type BasePremiumUpgradePromptProps = {
  /** Nombre del feature bloqueado (ej: "preguntas personalizadas") */
  feature: string;
  /** Contexto del prompt */
  trigger?: PremiumUpgradeTrigger;
};

type ModalPremiumUpgradePromptProps = BasePremiumUpgradePromptProps & {
  /** Tipo de visualización */
  variant: 'modal';
  /** Controla visibilidad del prompt (requerido para modal) */
  open: boolean;
  /** Callback al cerrar (requerido para modal) */
  onClose: () => void;
};

type InlinePremiumUpgradePromptProps = BasePremiumUpgradePromptProps & {
  /** Tipo de visualización */
  variant: 'inline';
  /** No se usa en modo inline */
  open?: never;
  /** No se usa en modo inline */
  onClose?: never;
};

type BannerPremiumUpgradePromptProps = BasePremiumUpgradePromptProps & {
  /** Tipo de visualización */
  variant: 'banner';
  /** No se usa en modo banner */
  open?: never;
  /** No se usa en modo banner */
  onClose?: never;
};

export type PremiumUpgradePromptProps =
  | ModalPremiumUpgradePromptProps
  | InlinePremiumUpgradePromptProps
  | BannerPremiumUpgradePromptProps;

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
      className="focus-visible:ring-secondary/50 w-full"
      size="lg"
    >
      {isPending ? (
        'Cargando...'
      ) : (
        <>
          <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
          {CTA_PREMIUM.PURCHASE}
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
  open,
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
      <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
        <DialogContent className="max-w-lg" data-testid="premium-upgrade-prompt-modal">
          <DialogHeader>
            <div className="bg-secondary/15 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <Lock className="text-secondary h-8 w-8" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center font-serif text-2xl">{title}</DialogTitle>
            <DialogDescription className="text-center text-base">
              Accede a interpretaciones personalizadas y todas las funcionalidades avanzadas con
              Premium
            </DialogDescription>
          </DialogHeader>

          {/* Premium benefits — callout dorado de marca */}
          <div className="border-secondary/40 bg-secondary/10 space-y-2 rounded-lg border p-4">
            {PREMIUM_UPGRADE_HIGHLIGHTS.map((benefit) => (
              <div key={benefit} className="flex items-center gap-2">
                <Sparkles className="text-secondary h-4 w-4 flex-shrink-0" aria-hidden="true" />
                <span className="text-foreground text-sm">{benefit}</span>
              </div>
            ))}
          </div>

          <DialogFooter className="flex-col gap-3 sm:flex-col">
            <CtaButton isPending={isPending} onClick={handleUpgradeClick} />
            <Button variant="outline" onClick={onClose} className="w-full" size="lg">
              Ahora no
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // ── Variant: inline ────────────────────────────────────────────────────────
  if (variant === 'inline') {
    return (
      <div
        className="border-secondary/40 bg-secondary/10 relative overflow-hidden rounded-lg border p-6 text-center"
        data-testid="premium-upgrade-prompt-inline"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="bg-secondary/15 flex h-14 w-14 items-center justify-center rounded-full">
            <Lock className="text-secondary h-7 w-7" aria-hidden="true" />
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

  // ── Variant: banner — banda dorada de marca ─────────────────────────────────
  return (
    <div
      className="bg-secondary text-bg-hero rounded-lg p-6 shadow-lg"
      data-testid="premium-upgrade-prompt-banner"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Gem className="mt-1 h-6 w-6 flex-shrink-0" aria-hidden="true" />
          <div>
            <h3 className="mb-1 font-semibold">Desbloquea {feature}</h3>
            <p className="text-bg-hero/80 text-sm">
              Con Premium obtienes acceso a todas las funcionalidades avanzadas y análisis
              personalizados.
            </p>
          </div>
        </div>
        <Button
          onClick={handleUpgradeClick}
          disabled={isPending}
          className="bg-bg-hero text-secondary hover:bg-bg-hero/90 focus-visible:ring-bg-hero/50 flex-shrink-0"
        >
          {isPending ? 'Cargando...' : CTA_PREMIUM.PURCHASE}
        </Button>
      </div>
    </div>
  );
}
