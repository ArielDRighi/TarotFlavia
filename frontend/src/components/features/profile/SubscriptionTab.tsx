'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlanBadge } from '@/components/ui/plan-badge';
import type { UserProfile } from '@/types';

export interface SubscriptionTabProps {
  profile: UserProfile;
}

/**
 * SubscriptionTab component
 *
 * Displays subscription information and usage statistics
 */
export function SubscriptionTab({ profile }: SubscriptionTabProps) {
  // Defensive guards against undefined/null/NaN values
  const dailyReadingsCount = useMemo(() => {
    const count = profile.dailyReadingsCount;
    return typeof count === 'number' && !isNaN(count) ? count : 0;
  }, [profile.dailyReadingsCount]);

  const dailyReadingsLimit = useMemo(() => {
    const limit = profile.dailyReadingsLimit;
    return typeof limit === 'number' && !isNaN(limit) ? limit : 0;
  }, [profile.dailyReadingsLimit]);

  const lecturesRemaining = useMemo(() => {
    const remaining = dailyReadingsLimit - dailyReadingsCount;
    return remaining >= 0 ? remaining : 0;
  }, [dailyReadingsLimit, dailyReadingsCount]);

  const progressPercentage = useMemo(() => {
    if (dailyReadingsLimit <= 0) return 0;
    return Math.min((dailyReadingsCount / dailyReadingsLimit) * 100, 100);
  }, [dailyReadingsCount, dailyReadingsLimit]);

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
                Plan {profile.plan === 'anonymous' ? 'ANÓNIMO' : profile.plan === 'free' ? 'GRATUITO' : 'PREMIUM'}
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
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-medium">Lecturas realizadas hoy</span>
              <span className="text-sm font-bold">
                {dailyReadingsCount} / {dailyReadingsLimit}
              </span>
            </div>
            {/* Progress bar with defensive guard against division by zero */}
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{
                  width: `${progressPercentage}%`,
                }}
              />
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>
              Lecturas restantes hoy: <span className="font-semibold">{lecturesRemaining}</span>
            </p>
          </div>
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
                  <span className="text-green-600">✓</span>
                  Lecturas ilimitadas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Acceso a todos los tipos de tiradas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Historial completo de lecturas
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  Soporte prioritario
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
