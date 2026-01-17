'use client';

import * as React from 'react';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HoroscopeAreaCard } from './HoroscopeAreaCard';
import { ZODIAC_SIGNS_INFO } from '@/lib/utils/zodiac';
import { cn } from '@/lib/utils';
import type { DailyHoroscope } from '@/types/horoscope.types';

/**
 * HoroscopeDetail Component Props
 */
export interface HoroscopeDetailProps {
  /** Daily horoscope data */
  horoscope: DailyHoroscope;
  /** Additional CSS classes */
  className?: string;
}

/**
 * HoroscopeDetail Component
 *
 * Displays complete daily horoscope information for a zodiac sign.
 * Shows general content, three areas (love, wellness, money), and lucky elements.
 *
 * Features:
 * - Zodiac sign header with symbol and name
 * - Date badge
 * - General horoscope content
 * - Three area cards with scores
 * - Lucky elements (number, color, time)
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <HoroscopeDetail horoscope={dailyHoroscope} />
 * ```
 */
export function HoroscopeDetail({ horoscope, className }: HoroscopeDetailProps) {
  const signInfo = ZODIAC_SIGNS_INFO[horoscope.zodiacSign];

  return (
    <div data-testid="horoscope-detail" className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="text-center">
        <span className="text-6xl">{signInfo.symbol}</span>
        <h1 className="mt-2 font-serif text-3xl">{signInfo.nameEs}</h1>
        <Badge variant="secondary" className="mt-2">
          {horoscope.horoscopeDate}
        </Badge>
      </div>

      {/* General Content */}
      <Card className="p-6">
        <p className="text-lg leading-relaxed">{horoscope.generalContent}</p>
      </Card>

      {/* Areas */}
      <div className="grid gap-4 md:grid-cols-3">
        <HoroscopeAreaCard area="love" data={horoscope.areas.love} />
        <HoroscopeAreaCard area="wellness" data={horoscope.areas.wellness} />
        <HoroscopeAreaCard area="money" data={horoscope.areas.money} />
      </div>

      {/* Lucky Elements */}
      {(horoscope.luckyNumber || horoscope.luckyColor || horoscope.luckyTime) && (
        <Card className="p-4" data-testid="lucky-elements">
          <h3 className="mb-3 font-serif text-lg">Tu Suerte Hoy</h3>
          <div className="flex flex-wrap gap-6">
            {horoscope.luckyNumber && (
              <div className="text-center" data-testid="lucky-number">
                <p className="text-primary text-2xl font-bold">{horoscope.luckyNumber}</p>
                <p className="text-muted-foreground text-xs">Número</p>
              </div>
            )}
            {horoscope.luckyColor && (
              <div className="text-center" data-testid="lucky-color">
                <p className="text-lg font-medium">{horoscope.luckyColor}</p>
                <p className="text-muted-foreground text-xs">Color</p>
              </div>
            )}
            {horoscope.luckyTime && (
              <div className="text-center" data-testid="lucky-time">
                <p className="text-lg font-medium">{horoscope.luckyTime}</p>
                <p className="text-muted-foreground text-xs">Mejor momento</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
