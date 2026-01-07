'use client';

import { useRouter } from 'next/navigation';
import { Calendar, History, Sparkles, Crown } from 'lucide-react';

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
 * - Clear message about daily limit (1 card per day)
 * - Premium upgrade CTA with benefits
 * - Secondary CTAs: View history and create new reading
 * - Accessible with role="alert"
 */
export function DailyCardLimitReached() {
  const router = useRouter();

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
          Puedes obtener una nueva carta mañana. Mientras tanto, explora otras opciones o{' '}
          <span className="text-primary font-semibold">
            descubre todo lo que PREMIUM tiene para ti
          </span>
          .
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Premium Benefits CTA */}
        <div className="via-primary/10 border-primary/30 rounded-lg border bg-gradient-to-br from-purple-500/10 to-amber-500/10 p-4">
          <div className="mb-3 flex items-center gap-2">
            <Crown className="h-5 w-5 text-amber-500" />
            <p className="text-lg font-semibold">Actualiza a Premium</p>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-start gap-2">
              <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Carta del día TODOS los días con IA</strong> incluida
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
                <strong>Interpretaciones con IA personalizada</strong> en todas tus lecturas
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
              <span className="text-primary">✓</span> Ver todas tus cartas pasadas en el historial
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Crear una nueva lectura de tarot ahora
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Volver mañana para tu nueva carta del día
            </li>
          </ul>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col gap-3">
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
      </CardFooter>
    </Card>
  );
}
