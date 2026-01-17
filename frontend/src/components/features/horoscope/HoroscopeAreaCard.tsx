'use client';

import * as React from 'react';
import { Heart, Sparkles, Wallet } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { HoroscopeArea } from '@/types/horoscope.types';

/**
 * HoroscopeAreaCard Component Props
 */
export interface HoroscopeAreaCardProps {
  /** Area type (love, wellness, money) */
  area: 'love' | 'wellness' | 'money';
  /** Area data with content and score */
  data: HoroscopeArea;
  /** Additional CSS classes */
  className?: string;
}

// Bienestar: En lugar de diagnósticos físicos, la IA habla de niveles de energía,
// descanso, estrés, meditación y autocuidado.
const AREA_CONFIG = {
  love: {
    title: 'Amor',
    icon: Heart,
    color: 'text-rose-500',
    bgColor: 'bg-rose-50 dark:bg-rose-950/20',
    dotColor: 'bg-rose-500',
  },
  wellness: {
    title: 'Bienestar',
    icon: Sparkles,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-50 dark:bg-emerald-950/20',
    dotColor: 'bg-emerald-500',
  },
  money: {
    title: 'Dinero',
    icon: Wallet,
    color: 'text-amber-500',
    bgColor: 'bg-amber-50 dark:bg-amber-950/20',
    dotColor: 'bg-amber-500',
  },
};

/**
 * HoroscopeAreaCard Component
 *
 * Displays a horoscope area (love, wellness, money) with content and score.
 * Used in the detailed horoscope view.
 *
 * Features:
 * - Icon and title for each area
 * - Text content with area-specific predictions
 * - Visual score display with colored dots (1-10)
 * - Area-specific color theming
 * - Responsive layout
 *
 * @example
 * ```tsx
 * <HoroscopeAreaCard
 *   area="love"
 *   data={{
 *     content: "Hoy es un buen día para el amor...",
 *     score: 8
 *   }}
 * />
 * ```
 */
export function HoroscopeAreaCard({ area, data, className }: HoroscopeAreaCardProps) {
  const config = AREA_CONFIG[area];
  const Icon = config.icon;

  // Renderizar score como puntos
  const renderScore = (score: number) => {
    return (
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className={cn('h-2 w-2 rounded-full', i < score ? config.dotColor : 'bg-gray-200')}
          />
        ))}
      </div>
    );
  };

  return (
    <Card data-testid={`horoscope-area-${area}`} className={cn('p-4', config.bgColor, className)}>
      <div className="mb-3 flex items-center gap-2">
        <Icon className={cn('h-5 w-5', config.color)} />
        <h3 className="font-serif text-lg">{config.title}</h3>
      </div>

      <p className="text-muted-foreground mb-3 text-sm">{data.content}</p>

      <div className="flex items-center justify-between">
        {renderScore(data.score)}
        <span className="text-sm font-medium">{data.score}/10</span>
      </div>
    </Card>
  );
}
