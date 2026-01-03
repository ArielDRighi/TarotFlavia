'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

// Key for tracking if anonymous user consumed their daily card
const DAILY_CARD_CONSUMED_KEY = 'tarot_daily_card_consumed';

/**
 * Check if anonymous user already consumed their daily card today
 * Uses sessionStorage to track consumption without making API calls
 */
function checkDailyCardConsumed(): boolean {
  try {
    const consumed = sessionStorage.getItem(DAILY_CARD_CONSUMED_KEY);
    if (!consumed) return false;

    // Check if consumption was today
    const consumedDate = new Date(consumed);
    const today = new Date();
    return (
      consumedDate.getDate() === today.getDate() &&
      consumedDate.getMonth() === today.getMonth() &&
      consumedDate.getFullYear() === today.getFullYear()
    );
  } catch {
    return false;
  }
}

export function TryWithoutRegisterSection() {
  // Initialize state with quota check (avoids setState in useEffect)
  const [limitReached] = useState(() => checkDailyCardConsumed());

  return (
    <section className="container mx-auto px-4 py-12 md:py-16">
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-800 dark:from-purple-950/20 dark:to-pink-950/20">
        <CardContent className="flex flex-col items-center p-8 text-center md:p-12">
          {/* Icon */}
          <div
            data-testid="try-without-register-icon"
            className="mb-6 rounded-full bg-purple-100 p-4 dark:bg-purple-900/30"
          >
            {limitReached ? (
              <Clock className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            ) : (
              <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            )}
          </div>

          {/* Title */}
          <h2 className="mb-4 font-serif text-3xl font-bold text-gray-900 md:text-4xl dark:text-white">
            {limitReached ? 'Límite Diario Alcanzado' : 'Prueba sin compromiso'}
          </h2>

          {/* Description */}
          <p className="mb-6 max-w-2xl text-lg text-gray-600 dark:text-gray-300">
            {limitReached
              ? 'Ya has visto tu carta del día. El límite se restablecerá en 24 horas. Regístrate gratis para obtener más lecturas diarias.'
              : '1 carta aleatoria sin necesidad de registrarte. Experimenta la magia del tarot de forma inmediata.'}
          </p>

          {/* CTA Button */}
          {limitReached ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
                <Link href={ROUTES.REGISTER}>Crear Cuenta Gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={ROUTES.LOGIN}>Iniciar Sesión</Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="bg-purple-600 hover:bg-purple-700">
              <Link href={ROUTES.CARTA_DEL_DIA}>Carta del Día Gratis</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
