'use client';

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
              <p className="text-lg font-semibold">Plan {profile.plan.toUpperCase()}</p>
              <p className="text-muted-foreground text-sm">
                {profile.plan === 'free'
                  ? 'Plan gratuito con funcionalidades básicas'
                  : profile.plan === 'premium'
                    ? 'Plan premium con funcionalidades avanzadas'
                    : 'Plan profesional con todas las funcionalidades'}
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
                {profile.dailyReadingsCount} / {profile.dailyReadingsLimit}
              </span>
            </div>
            <div className="bg-secondary h-2 w-full overflow-hidden rounded-full">
              <div
                className="bg-primary h-full transition-all"
                style={{
                  width: `${(profile.dailyReadingsCount / profile.dailyReadingsLimit) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="text-muted-foreground text-sm">
            <p>
              Lecturas restantes hoy:{' '}
              <span className="font-semibold">
                {profile.dailyReadingsLimit - profile.dailyReadingsCount}
              </span>
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
                Actualiza a Premium o Professional para desbloquear más funcionalidades:
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
