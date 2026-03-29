'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanBadge } from '@/components/ui/plan-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { useCancelSubscription } from '@/hooks/api/useSubscription';
import { formatTimestampLocalized } from '@/lib/utils/date';
import { ROUTES } from '@/lib/constants/routes';
import type { UserProfile } from '@/types';

export interface SubscriptionTabProps {
  profile: UserProfile;
}

/**
 * SubscriptionTab component
 *
 * Displays subscription information and usage statistics.
 * Uses useUserCapabilities() as single source of truth for limits/usage.
 *
 * Handles three subscription states:
 * - free: shows upgrade CTA linking to /premium
 * - premium + subscriptionStatus=active: shows next billing date + cancel button
 * - premium + subscriptionStatus=cancelled: shows expiry date + reactivate link
 */
export function SubscriptionTab({ profile }: SubscriptionTabProps) {
  // State
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Hooks — capabilities as single source of truth
  const { data: capabilities, isLoading: capabilitiesLoading } = useUserCapabilities();
  const { mutate: cancelSubscription, isPending: isCancelling } = useCancelSubscription();

  // Derived state — usage stats
  const tarotReadingsUsed = capabilities?.tarotReadings.used ?? 0;
  const tarotReadingsLimit = capabilities?.tarotReadings.limit ?? 0;
  const dailyCardUsed = capabilities?.dailyCard.used ?? 0;
  const dailyCardLimit = capabilities?.dailyCard.limit ?? 0;

  // Derived state — subscription
  const subscriptionStatus = capabilities?.subscriptionStatus ?? null;
  const planExpiresAt = capabilities?.planExpiresAt ?? null;

  // Use capabilities.plan as primary source of truth; fall back to profile.plan while loading
  const effectivePlan = capabilities?.plan ?? profile.plan;

  const isPremiumActive = effectivePlan === 'premium' && subscriptionStatus === 'active';
  const isPremiumCancelled = effectivePlan === 'premium' && subscriptionStatus === 'cancelled';

  const tarotReadingsRemaining = useMemo(() => {
    const remaining = tarotReadingsLimit - tarotReadingsUsed;
    return remaining >= 0 ? remaining : 0;
  }, [tarotReadingsLimit, tarotReadingsUsed]);

  const tarotProgressPercentage = useMemo(() => {
    if (tarotReadingsLimit <= 0) return 0;
    return Math.min((tarotReadingsUsed / tarotReadingsLimit) * 100, 100);
  }, [tarotReadingsUsed, tarotReadingsLimit]);

  const dailyCardProgressPercentage = useMemo(() => {
    if (dailyCardLimit <= 0) return 0;
    return Math.min((dailyCardUsed / dailyCardLimit) * 100, 100);
  }, [dailyCardUsed, dailyCardLimit]);

  // Handlers
  const handleCancelConfirm = () => {
    cancelSubscription(undefined, {
      onSuccess: () => {
        setShowCancelDialog(false);
      },
      onError: () => {
        toast.error('No se pudo cancelar la suscripción. Intentá de nuevo.');
      },
    });
  };

  // Format expiry date for display
  const formattedExpiryDate = planExpiresAt
    ? formatTimestampLocalized(planExpiresAt, 'es-AR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="space-y-6">
      {/* Current Plan */}
      <Card>
        <CardHeader>
          <CardTitle>Plan Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-semibold">
                Plan{' '}
                {profile.plan === 'anonymous'
                  ? 'ANÓNIMO'
                  : profile.plan === 'free'
                    ? 'GRATUITO'
                    : 'PREMIUM'}
              </p>
              <p className="text-muted-foreground text-sm">
                {profile.plan === 'free'
                  ? 'Plan gratuito con funcionalidades básicas'
                  : profile.plan === 'premium'
                    ? 'Plan premium con funcionalidades avanzadas'
                    : 'Plan anónimo con funcionalidades limitadas'}
              </p>
            </div>
            <PlanBadge plan={profile.plan} />
          </div>
        </CardContent>
      </Card>

      {/* Usage Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Estadísticas de Uso</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {capabilitiesLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : (
            <>
              {/* Tarot Readings */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Tiradas de Tarot hoy</span>
                  <span className="text-sm font-bold">
                    {tarotReadingsUsed} / {tarotReadingsLimit}
                  </span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      width: `${tarotProgressPercentage}%`,
                    }}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  Restantes: <span className="font-semibold">{tarotReadingsRemaining}</span>
                </p>
              </div>

              {/* Daily Card */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium">Carta del Día</span>
                  <span className="text-sm font-bold">
                    {dailyCardUsed} / {dailyCardLimit}
                  </span>
                </div>
                <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
                  <div
                    className="bg-primary h-full transition-all"
                    style={{
                      width: `${dailyCardProgressPercentage}%`,
                    }}
                  />
                </div>
                <p className="text-muted-foreground mt-1 text-xs">
                  {dailyCardUsed >= dailyCardLimit
                    ? 'Ya recibiste tu carta del día'
                    : 'Disponible para hoy'}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Mi Plan — Premium Active */}
      {isPremiumActive && (
        <Card>
          <CardHeader>
            <CardTitle>Mi Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-green-600">Plan Premium — Activo</p>
              </div>

              {formattedExpiryDate && (
                <p className="text-muted-foreground text-sm">
                  Próximo cobro:{' '}
                  <span className="text-foreground font-medium">{formattedExpiryDate}</span>
                </p>
              )}

              <Button
                variant="outline"
                className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => setShowCancelDialog(true)}
                disabled={isCancelling}
              >
                Cancelar suscripción
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mi Plan — Premium Cancelled */}
      {isPremiumCancelled && (
        <Card>
          <CardHeader>
            <CardTitle>Mi Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground font-semibold">Plan Premium — Cancelado</p>

              {formattedExpiryDate && (
                <p className="text-muted-foreground text-sm">
                  Tu plan Premium sigue activo hasta{' '}
                  <span className="text-foreground font-medium">{formattedExpiryDate}</span>.
                  Después volverás al plan gratuito.
                </p>
              )}

              <Button asChild variant="default">
                <Link href={ROUTES.PREMIUM}>Reactivar</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Comparison — Free users only */}
      {effectivePlan === 'free' && (
        <Card>
          <CardHeader>
            <CardTitle>Mejora tu Plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Actualiza a Premium para desbloquear más funcionalidades:
              </p>

              <ul className="text-muted-foreground space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>3 tiradas de tarot por día (vs 1
                  gratuita)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Interpretaciones personalizadas con IA
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Acceso a todas las tiradas (Cruz Céltica, 5 cartas)
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Preguntas personalizadas
                </li>
              </ul>

              <Button asChild>
                <Link href={ROUTES.PREMIUM}>Mejorar mi plan</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancellation Confirmation Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Seguro que querés cancelar?</AlertDialogTitle>
            <AlertDialogDescription>
              Tu plan Premium seguirá activo
              {formattedExpiryDate ? ` hasta ${formattedExpiryDate}` : ''}. Después volverás al plan
              gratuito.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isCancelling}>No, mantener Premium</AlertDialogCancel>
            <Button variant="destructive" onClick={handleCancelConfirm} disabled={isCancelling}>
              Sí, cancelar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
