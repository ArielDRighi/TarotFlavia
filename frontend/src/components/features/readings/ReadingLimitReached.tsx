'use client';

import { useRouter } from 'next/navigation';
import { Calendar, History, Crown, Sparkles } from 'lucide-react';

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
 * ReadingLimitReached Component
 *
 * Displays a message when a FREE user has reached their daily tarot reading limit.
 * Provides CTAs to view history or upgrade to PREMIUM for more readings.
 *
 * Features:
 * - Clear message about daily limit (1 tarot reading per day for FREE users)
 * - Premium upgrade CTA with benefits
 * - Secondary CTAs: View history and daily card
 * - Accessible with role="alert"
 */
export function ReadingLimitReached() {
  const router = useRouter();

  const handleViewHistory = () => {
    router.push('/historial');
  };

  const handleDailyCard = () => {
    router.push('/carta-del-dia');
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
        <CardTitle className="text-center text-xl">Límite de lecturas alcanzado</CardTitle>
        <CardDescription className="text-center">
          Ya realizaste tu lectura de tarot gratuita del día. Puedes crear una nueva lectura mañana,
          o{' '}
          <span className="text-primary font-semibold">
            actualiza a PREMIUM para más lecturas diarias
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
            <li className="flex items-start gap-2">
              <Sparkles className="text-primary mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <strong>Carta del día con IA todos los días</strong>
              </span>
            </li>
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="bg-primary/5 rounded-lg p-4 text-center text-sm">
          <p className="mb-2 font-medium">Mientras tanto, puedes:</p>
          <ul className="space-y-1 text-left">
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Ver todas tus lecturas pasadas en el historial
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Obtener tu carta del día (si aún no la
              recibiste)
            </li>
            <li className="flex items-center gap-2">
              <span className="text-primary">✓</span> Volver mañana para una nueva lectura gratuita
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
          <Button onClick={handleDailyCard} variant="outline" className="w-full sm:w-1/2" size="lg">
            <Calendar className="h-4 w-4" />
            Carta del día
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
