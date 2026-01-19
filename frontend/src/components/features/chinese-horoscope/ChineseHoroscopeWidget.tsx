'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Settings } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useMyAnimalHoroscope } from '@/hooks/api/useChineseHoroscope';
import { CHINESE_ZODIAC_INFO, getCurrentYear } from '@/lib/utils/chinese-zodiac';

/**
 * Helper function to get element icon based on Wu Xing element code
 */
function getElementIcon(element: string): string {
  switch (element) {
    case 'metal':
      return '⚪';
    case 'water':
      return '🔵';
    case 'wood':
      return '🟢';
    case 'fire':
      return '🔴';
    case 'earth':
      return '🟤';
    default:
      return '⭐';
  }
}

/**
 * ChineseHoroscopeWidget Component
 *
 * Dashboard widget showing user's annual Chinese horoscope.
 * Displays personalized content based on user's birth date.
 *
 * States:
 * - No birthDate: Shows CTA to configure profile
 * - Loading: Shows skeleton
 * - Error/No data: Shows error message
 * - Success: Shows horoscope summary with link to full view
 *
 * Features:
 * - Automatic animal detection from birthDate
 * - Compact view with 3-line clamped content
 * - Area scores display (4 areas: love, career, wellness, finance)
 * - Link to full horoscope page
 *
 * @example
 * ```tsx
 * <ChineseHoroscopeWidget />
 * ```
 */
export function ChineseHoroscopeWidget() {
  const currentYear = getCurrentYear();
  const { data: horoscope, isLoading, error } = useMyAnimalHoroscope(currentYear);

  // Loading state
  if (isLoading) {
    return (
      <Card className="p-6" data-testid="chinese-horoscope-widget-loading">
        <Skeleton className="mb-4 h-8 w-32" />
        <Skeleton className="mb-2 h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
      </Card>
    );
  }

  // Error or no data (includes no birthDate case from API)
  if (error || !horoscope) {
    return (
      <Card className="p-6" data-testid="chinese-horoscope-widget-no-data">
        <h2 className="mb-2 font-serif text-xl">Horóscopo Chino {currentYear}</h2>
        <p className="text-muted-foreground mb-4 text-sm">
          Configura tu fecha de nacimiento para ver tu horóscopo chino personalizado
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

  const animalInfo = CHINESE_ZODIAC_INFO[horoscope.animal];
  const displayName = horoscope.fullZodiacType || animalInfo.nameEs;

  return (
    <Card data-testid="chinese-horoscope-widget" className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{animalInfo.emoji}</span>
          <div>
            <h2 className="font-serif text-xl">{displayName}</h2>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-xs">Horóscopo Chino {currentYear}</p>
              {horoscope.birthElementEs && (
                <span className="text-xs" data-testid="chinese-horoscope-widget-element">
                  {getElementIcon(horoscope.birthElement || '')} {horoscope.birthElementEs}
                </span>
              )}
            </div>
          </div>
        </div>
        <Button asChild variant="ghost" size="sm">
          <Link href={`/horoscopo-chino/${horoscope.animal}`}>
            Ver más
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>

      <p className="text-muted-foreground line-clamp-3 text-sm">{horoscope.generalOverview}</p>

      <div className="mt-4 flex gap-4 text-xs">
        <span className="flex items-center gap-1">
          <span className="text-rose-500">❤️</span>
          {horoscope.areas.love.rating}/10
        </span>
        <span className="flex items-center gap-1">
          <span className="text-blue-500">💼</span>
          {horoscope.areas.career.rating}/10
        </span>
        <span className="flex items-center gap-1">
          <span className="text-emerald-500">✨</span>
          {horoscope.areas.wellness.rating}/10
        </span>
        <span className="flex items-center gap-1">
          <span className="text-amber-500">💰</span>
          {horoscope.areas.finance.rating}/10
        </span>
      </div>
    </Card>
  );
}
