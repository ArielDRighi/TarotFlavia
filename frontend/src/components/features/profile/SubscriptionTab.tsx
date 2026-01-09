'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanBadge } from '@/components/ui/plan-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import type { UserProfile } from '@/types';

export interface SubscriptionTabProps {
  profile: UserProfile;
}

/**
 * SubscriptionTab component
 *
 * Displays subscription information and usage statistics.
 * Uses useUserCapabilities() as single source of truth for limits/usage.
 */
export function SubscriptionTab({ profile }: SubscriptionTabProps) {
  // Use capabilities as single source of truth for usage stats
  const { data: capabilities, isLoading: capabilitiesLoading } = useUserCapabilities();

  // Get tarot readings usage from capabilities (single source of truth)
  const tarotReadingsUsed = capabilities?.tarotReadings.used ?? 0;
  const tarotReadingsLimit = capabilities?.tarotReadings.limit ?? 0;
  const dailyCardUsed = capabilities?.dailyCard.used ?? 0;
  const dailyCardLimit = capabilities?.dailyCard.limit ?? 0;

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

      {/* Plan Comparison */}
      {profile.plan === 'free' && (
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

              <p className="text-muted-foreground text-xs italic">
                Próximamente: Mejora de planes disponible
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
