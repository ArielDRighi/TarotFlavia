'use client';

import { useRouter } from 'next/navigation';
import { Calendar, History, Sparkles, Crown } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * DailyCardLimitReached Component
 *
 * Displays a message when an authenticated user has already received their daily card today.
 * Provides CTAs to view history, create new reading, or upgrade to PREMIUM.
 *
 * Features:
 * - Shows specific daily card usage (X/Y cartas usadas)
 * - Clear message about daily limit (1 card per day)
 * - Premium upgrade CTA with benefits
 * - Secondary CTAs: View history and create new reading
 * - Accessible with role="alert"
 */
export function DailyCardLimitReached() {
  const router = useRouter();
  const { user } = useAuth();

  // Get specific daily card counters
  const dailyCardCount = user?.dailyCardCount ?? 0;
  const dailyCardLimit = user?.dailyCardLimit ?? 1;

  // Detect user plan - PREMIUM users should see different message (no upgrade CTA)
  const isPremium = user?.plan?.toUpperCase() === 'PREMIUM';

  const handleViewHistory = () => {
    router.push('/historial');
  };

  const handleCreateReading = () => {
    router.push('/ritual');
  };

  const handleUpgradePremium = () => {
    router.push('/planes');
  };

  return (
    <Card
      role="alert"
      className="bg-surface shadow-soft animate-fade-in border-primary/20 w-full max-w-lg"
    >
      <CardHeader>
        <CardTitle className="text-center text-xl">Ya recibiste tu carta del día</CardTitle>
        <CardDescription className="text-center">
          Obtuviste{' '}
          <span className="font-semibold">
            {dailyCardCount} de {dailyCardLimit} {dailyCardLimit === 1 ? 'carta' : 'cartas'}
          </span>{' '}
          hoy.{' '}
          {isPremium ? 'Tu límite se reinicia mañana.' : 'Puedes obtener una nueva carta mañana.'}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* PREMIUM: Gentle reminder */}
        {isPremium ? (
          <>
            {/* Today's limit info */}
            <div className="bg-primary/5 rounded-lg p-4 text-center">
              <div className="mb-2 flex items-center justify-center gap-2">
                <Calendar className="text-primary h-5 w-5" />
                <p className="font-semibold">Tu límite se reinicia mañana</p>
              </div>
              <p className="text-text-muted text-sm">
                Vuelve cada día para disfrutar de tu carta diaria con interpretación personalizada
              </p>
            </div>

            {/* Quick Actions */}
            <div className="bg-surface-secondary rounded-lg p-4 text-center text-sm">
              <p className="mb-2 font-medium">Mientras tanto:</p>
              <ul className="space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Ver tu carta de hoy en el historial
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Crear una nueva lectura de tarot (tienes{' '}
                  {(user?.tarotReadingsLimit ?? 3) - (user?.tarotReadingsCount ?? 0)} disponibles)
                </li>
              </ul>
            </div>
          </>
        ) : (
          <>
            {/* FREE: Premium Benefits CTA */}
            <div className="via-primary/10 border-primary/30 rounded-lg border bg-gradient-to-br from-purple-500/10 to-amber-500/10 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <p className="text-lg font-semibold">Actualiza a Premium</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>Carta del día con interpretación completa TODOS los días</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>3 tiradas completas por día</strong> (vs 1 tirada gratis)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>Todas las tiradas disponibles</strong> (1, 3, 5 cartas y Cruz Céltica)
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>Interpretaciones personalizadas y profundas</strong> en todas tus
                    lecturas
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
                  <span>
                    <strong>Preguntas personalizadas</strong> para lecturas más precisas
                  </span>
                </li>
              </ul>
            </div>

            {/* Quick Actions */}
            <div className="bg-primary/5 rounded-lg p-4 text-center text-sm">
              <p className="mb-2 font-medium">O continúa explorando gratis:</p>
              <ul className="space-y-1 text-left">
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Ver todas tus cartas pasadas en el
                  historial
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Crear una nueva lectura de tarot ahora
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary">✓</span> Volver mañana para tu nueva carta del día
                </li>
              </ul>
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
        {/* PREMIUM: Only history and new reading */}
        {isPremium ? (
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button
              onClick={handleViewHistory}
              variant="default"
              className="w-full sm:w-1/2"
              size="lg"
            >
              <History className="h-4 w-4" />
              Ver historial
            </Button>
            <Button
              onClick={handleCreateReading}
              variant="outline"
              className="w-full sm:w-1/2"
              size="lg"
            >
              <Calendar className="h-4 w-4" />
              Nueva lectura
            </Button>
          </div>
        ) : (
          <>
            {/* FREE: Upgrade CTA + secondary actions */}
            <Button
              onClick={handleUpgradePremium}
              className="w-full bg-gradient-to-r from-purple-600 to-amber-600 hover:from-purple-700 hover:to-amber-700"
              size="lg"
            >
              <Crown className="h-4 w-4" />
              Actualizar a Premium
            </Button>
            <div className="flex w-full flex-col gap-2 sm:flex-row">
              <Button
                onClick={handleViewHistory}
                variant="outline"
                className="w-full sm:w-1/2"
                size="lg"
              >
                <History className="h-4 w-4" />
                Ver historial
              </Button>
              <Button
                onClick={handleCreateReading}
                variant="outline"
                className="w-full sm:w-1/2"
                size="lg"
              >
                <Calendar className="h-4 w-4" />
                Nueva lectura
              </Button>
            </div>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
