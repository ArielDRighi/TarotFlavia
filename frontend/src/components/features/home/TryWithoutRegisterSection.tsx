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
    <section className="bg-bg-main px-4 py-16 md:py-24">
      <Card
        className="container mx-auto overflow-hidden border-0 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #f2eef9 0%, #fdf6e7 100%)' }}
      >
        <CardContent className="flex flex-col items-center p-10 text-center md:p-16">
          {/* Icon */}
          <div
            data-testid="try-without-register-icon"
            className="mb-6 rounded-full p-4"
            style={{ background: 'rgba(128, 90, 213, 0.1)' }}
          >
            {limitReached ? (
              <Clock className="text-primary h-8 w-8" />
            ) : (
              <Sparkles className="text-primary h-8 w-8" />
            )}
          </div>

          {/* Title */}
          <h2 className="text-text-primary mb-4 font-serif text-3xl font-light md:text-4xl">
            {limitReached ? 'Límite Diario Alcanzado' : 'Prueba sin compromiso'}
          </h2>

          {/* Description */}
          <p className="text-text-muted mb-8 max-w-2xl font-sans text-lg">
            {limitReached
              ? 'Ya has visto tu carta del día. El límite se restablecerá en 24 horas. Regístrate gratis para obtener más lecturas diarias.'
              : '1 carta aleatoria sin necesidad de registrarte. Experimenta la magia del tarot de forma inmediata.'}
          </p>

          {/* CTA Button */}
          {limitReached ? (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                <Link href={ROUTES.REGISTER}>Crear Cuenta Gratis</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href={ROUTES.LOGIN}>Iniciar Sesión</Link>
              </Button>
            </div>
          ) : (
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href={ROUTES.CARTA_DEL_DIA}>Carta del Día Gratis</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
