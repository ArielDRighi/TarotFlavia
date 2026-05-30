'use client';

import * as React from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, Clock, RefreshCw, Settings } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMySignHoroscope } from '@/hooks/api/useHoroscope';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';

/**
 * HoroscopeWidget Component
 *
 * Dashboard widget showing user's daily horoscope.
 * Displays personalized content based on user's birth date.
 *
 * Estados (diferenciados según la respuesta del backend):
 * - **Loading**: skeleton.
 * - **Success**: muestra el horóscopo del día.
 * - **400 / `no-birthdate`**: el usuario no tiene fecha de nacimiento → CTA a `/perfil`.
 * - **404 / `not-generated`**: el horóscopo del día aún no se generó → mensaje "se está preparando".
 * - **5xx / `error`**: error transitorio → mensaje genérico + botón "Reintentar".
 *
 * @example
 * ```tsx
 * <HoroscopeWidget />
 * ```
 */
export function HoroscopeWidget() {
  const { data: horoscope, isLoading, errorState, refetch, isRefetching } = useMySignHoroscope();

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6" data-testid="horoscope-widget-loading">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </Card>
    );
  }

  // 400: el usuario no tiene fecha de nacimiento cargada
  if (errorState === 'no-birthdate') {
    return (
      <Card className="p-6" data-testid="horoscope-widget-no-birthdate">
        <h2 className="mb-2 font-serif text-xl">Tu Horóscopo</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Configura tu fecha de nacimiento para ver tu horóscopo personalizado
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/perfil">
            <Settings className="mr-2 h-4 w-4" />
            Configurar
          </Link>
        </Button>
      </Card>
    );
  }

  // 404: el horóscopo del día todavía no fue generado para el signo del usuario
  if (errorState === 'not-generated') {
    return (
      <Card className="p-6" data-testid="horoscope-widget-not-generated">
        <h2 className="mb-2 font-serif text-xl">Tu Horóscopo</h2>
        <p className="text-muted-foreground mb-4 flex items-start gap-2 text-sm">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>Tu horóscopo de hoy se está preparando, volvé en un rato.</span>
        </p>
      </Card>
    );
  }

  // 5xx / error genérico / sin datos por razones inesperadas
  if (errorState === 'error' || !horoscope) {
    return (
      <Card className="p-6" data-testid="horoscope-widget-error">
        <h2 className="mb-2 font-serif text-xl">Tu Horóscopo</h2>
        <p className="text-muted-foreground mb-4 flex items-start gap-2 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>No pudimos cargar tu horóscopo. Intentá nuevamente en unos segundos.</span>
        </p>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
          Reintentar
        </Button>
      </Card>
    );
  }

  const signInfo = ZODIAC_SIGNS_INFO[horoscope.zodiacSign];

  return (
    <Card data-testid="horoscope-widget" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{signInfo.symbol}</span>
          <h2 className="font-serif text-xl">{signInfo.nameEs}</h2>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/horoscopo/${horoscope.zodiacSign}`}>
            Ver más
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground line-clamp-3 text-sm">{horoscope.generalContent}</p>

      <div className="mt-4 flex gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="text-rose-500">❤️</span>
          {horoscope.areas.love.score}/10
        </span>
        <span className="flex items-center gap-1">
          <span className="text-emerald-500">✨</span>
          {horoscope.areas.wellness.score}/10
        </span>
        <span className="flex items-center gap-1">
          <span className="text-amber-500">💰</span>
          {horoscope.areas.money.score}/10
        </span>
      </div>
    </Card>
  );
}
