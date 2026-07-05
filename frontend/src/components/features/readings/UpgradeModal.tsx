'use client';

import type { ComponentType } from 'react';
import { Check, Sparkles, Star, MessageCircle, TrendingUp, type LucideProps } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useCreatePreapproval } from '@/hooks/api/useSubscription';
import { usePublicPlans } from '@/hooks/api/usePublicPlans';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';
import { CTA_PREMIUM } from '@/lib/constants/cta-copy';
import { PREMIUM_MODAL_BENEFITS } from '@/lib/constants/premium-benefits';
import { formatPriceArs } from '@/lib/utils/format';
import type { CreatePreapprovalResponse } from '@/types';

/**
 * Props for UpgradeModal component
 */
export interface UpgradeModalProps {
  /** Is modal open? */
  open: boolean;
  /** Callback when modal is closed */
  onClose: () => void;
  /** Reason for showing the modal (e.g., 'limit-reached') */
  reason?: 'limit-reached' | 'feature-locked';
}

/**
 * Mapa de nombre de icono (fuente única `PREMIUM_MODAL_BENEFITS`) → componente Lucide.
 * Los beneficios se leen de la fuente única para no duplicar copy.
 */
const ICON_MAP: Record<string, ComponentType<LucideProps>> = {
  Sparkles,
  TrendingUp,
  MessageCircle,
  Star,
};

/**
 * UpgradeModal Component
 *
 * Modal persuasivo que muestra los beneficios de Premium
 * con pricing y CTA claro. Usado cuando usuarios FREE/ANONYMOUS
 * intentan acceder a features premium o alcanzan su límite diario.
 *
 * ⚠️ IMPORTANTE: Este modal es SOLO para usuarios FREE/ANONYMOUS
 * Para usuarios PREMIUM que alcanzaron límite, usar DailyLimitReachedModal
 *
 * @example
 * ```tsx
 * const [showModal, setShowModal] = useState(false);
 *
 * <button onClick={() => setShowModal(true)}>
 *   Ver Premium
 * </button>
 *
 * <UpgradeModal
 *   open={showModal}
 *   onClose={() => setShowModal(false)}
 *   reason="limit-reached"
 * />
 * ```
 */
export default function UpgradeModal({ open, onClose, reason }: UpgradeModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const { mutate: createPreapproval, isPending } = useCreatePreapproval();
  const { data: plans } = usePublicPlans();
  const premiumPrice = plans?.find((p) => p.planType === 'premium')?.price;

  // Custom title and description based on reason
  const getContent = () => {
    if (reason === 'limit-reached') {
      return {
        title: '¡Has alcanzado tu límite diario!',
        description:
          'Pasa a Premium para obtener más lecturas cada día y funcionalidades avanzadas',
      };
    }
    return {
      title: 'Desbloquea todo el potencial del Tarot',
      description: 'Accede a interpretaciones personalizadas y todas las funcionalidades avanzadas',
    };
  };

  const content = getContent();

  const handleUpgradeClick = () => {
    if (!user) {
      router.push(`${ROUTES.REGISTER}?redirect=${ROUTES.PREMIUM}`);
      return;
    }
    createPreapproval(undefined, {
      onSuccess: (data: CreatePreapprovalResponse) => {
        window.location.href = data.initPoint;
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="mb-2 text-center font-serif text-3xl">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-center text-base">
            {content.description}
          </DialogDescription>
        </DialogHeader>

        {/* Benefits List */}
        <div className="my-6 space-y-4">
          <ul role="list" className="space-y-3">
            {PREMIUM_MODAL_BENEFITS.map((benefit, index) => {
              const Icon = ICON_MAP[benefit.icon] ?? Sparkles;
              return (
                <li key={index} className="flex items-start gap-3">
                  <div className="bg-primary/10 text-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
                    <Check data-testid="check-icon" className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-purple-600" aria-hidden="true" />
                      <p className="text-text-primary font-semibold">{benefit.text}</p>
                    </div>
                    <p className="text-muted-foreground mt-1 text-sm">{benefit.description}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Pricing */}
        <div className="rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 p-6 text-center">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold text-purple-900">
              {premiumPrice != null ? formatPriceArs(premiumPrice) : '---'}
            </span>
            <span className="text-muted-foreground">/ mes</span>
          </div>
          <p className="text-muted-foreground mt-2 text-sm">
            Cancela cuando quieras. Sin compromisos.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="mt-6 flex flex-col gap-3">
          <Button
            onClick={handleUpgradeClick}
            disabled={isPending}
            size="lg"
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          >
            <Sparkles className="mr-2 h-5 w-5" aria-hidden="true" />
            {isPending
              ? 'Cargando...'
              : reason === 'limit-reached'
                ? CTA_PREMIUM.LIMIT_REACHED
                : CTA_PREMIUM.PURCHASE}
          </Button>

          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-text-primary text-sm transition-colors"
          >
            Más información sobre Premium
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
