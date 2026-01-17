'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Settings } from 'lucide-react';

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
 * States:
 * - No birthDate: Shows CTA to configure profile
 * - Loading: Shows skeleton
 * - Error/No data: Shows error message
 * - Success: Shows horoscope summary with link to full view
 *
 * Features:
 * - Automatic sign detection from birthDate
 * - Compact view with 3-line clamped content
 * - Area scores display
 * - Link to full horoscope page
 *
 * @example
 * ```tsx
 * <HoroscopeWidget />
 * ```
 */
export function HoroscopeWidget() {
  const { data: horoscope, isLoading, error } = useMySignHoroscope();

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

  // Error or no data (includes no birthDate case from API)
  if (error || !horoscope) {
    return (
      <Card className="p-6" data-testid="horoscope-widget-no-data">
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
