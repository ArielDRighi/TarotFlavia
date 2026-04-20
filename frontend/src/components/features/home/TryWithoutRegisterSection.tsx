'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Clock, Star, Sun, Moon } from 'lucide-react';
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
        className="relative container mx-auto overflow-hidden border-0 shadow-lg"
        style={{
          background: 'linear-gradient(135deg, #f2eef9 0%, #fdf6e7 100%)',
        }}
      >
        {/* Background image — incense fills entire card, cropped naturally by container */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <Image
            src="/images/incense-bg.webp"
            alt=""
            fill
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-cover object-bottom"
            style={{ mixBlendMode: 'multiply', opacity: 0.3 }}
            aria-hidden="true"
          />
        </div>

        {/* Decorative elements */}
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <Star
            className="absolute right-10 bottom-8 h-4 w-4 opacity-10"
            style={{ color: '#d69e2e' }}
          />
          <Sun
            className="absolute bottom-10 left-12 h-5 w-5 opacity-10"
            style={{ color: '#d69e2e' }}
          />
          <Sparkles
            className="absolute top-1/2 left-6 h-4 w-4 -translate-y-1/2 opacity-10"
            style={{ color: '#805ad5' }}
          />
          <Sparkles
            className="absolute top-1/2 right-6 h-4 w-4 -translate-y-1/2 opacity-10"
            style={{ color: '#d69e2e' }}
          />
        </div>

        <CardContent className="relative flex flex-col items-center p-10 text-center md:p-16">
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
          <p className="text-text-muted mb-6 max-w-2xl font-sans text-lg">
            {limitReached
              ? 'Ya has visto tu carta del día. El límite se restablecerá en 24 horas. Regístrate gratis para obtener más lecturas diarias.'
              : '1 carta aleatoria sin necesidad de registrarte. Experimenta la magia del tarot de forma inmediata.'}
          </p>

          {/* Feature highlights */}
          {!limitReached && (
            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 text-sm">
              <span className="text-text-muted flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5">
                <Star className="h-3.5 w-3.5" style={{ color: '#d69e2e' }} />
                Sin registro
              </span>
              <span className="text-text-muted flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5">
                <Sparkles className="h-3.5 w-3.5" style={{ color: '#805ad5' }} />
                Resultado inmediato
              </span>
              <span className="text-text-muted flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1.5">
                <Moon className="h-3.5 w-3.5" style={{ color: '#805ad5' }} />
                <span>1 vez al día</span>
              </span>
            </div>
          )}

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
