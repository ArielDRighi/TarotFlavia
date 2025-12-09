'use client';

import * as React from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { DailyReadingHistoryItem } from '@/types';

/**
 * DailyReadingCard Component Props
 */
export interface DailyReadingCardProps {
  /** Daily reading history item data */
  reading: DailyReadingHistoryItem;
  /** Callback when view button is clicked */
  onView: (id: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format date to Spanish full format (e.g., "Lunes 2 de Diciembre")
 * Capitalizes the first letter
 */
function formatReadingDate(dateString: string): string {
  const date = new Date(dateString);
  const formatted = format(date, "EEEE d 'de' MMMM", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * DailyReadingCard Component
 *
 * Displays a daily reading summary card for the history view.
 *
 * Features:
 * - Prominent date display in Spanish format
 * - Card name with reversed indicator
 * - Interpretation preview (2 lines truncated)
 * - "Ver completa" action button
 * - Regenerated badge when applicable
 * - Hover effects and click interaction
 *
 * @example
 * ```tsx
 * <DailyReadingCard
 *   reading={dailyReading}
 *   onView={(id) => router.push(`/carta-del-dia/historial/${id}`)}
 * />
 * ```
 */
export function DailyReadingCard({ reading, onView, className }: DailyReadingCardProps) {
  const handleViewClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onView(reading.id);
    },
    [onView, reading.id]
  );

  const handleCardClick = React.useCallback(() => {
    onView(reading.id);
  }, [onView, reading.id]);

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onView(reading.id);
      }
    },
    [onView, reading.id]
  );

  const formattedDate = formatReadingDate(reading.readingDate);

  return (
    <Card
      data-testid="daily-reading-card"
      className={cn(
        'cursor-pointer',
        'bg-card',
        'shadow-sm',
        'transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-lg',
        className
      )}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
    >
      <CardContent className="flex flex-col gap-3 p-4 md:p-5">
        {/* Date - Prominent Display */}
        <div className="flex items-center justify-between">
          <h3 className="text-primary font-serif text-lg font-semibold md:text-xl">
            {formattedDate}
          </h3>
          {reading.wasRegenerated && (
            <Badge variant="secondary" className="flex items-center gap-1 text-xs">
              <RefreshCw className="h-3 w-3" aria-hidden="true" />
              Regenerada
            </Badge>
          )}
        </div>

        {/* Card Name with Reversed Indicator */}
        <div className="flex items-center gap-2">
          <span className="text-text-primary font-serif text-base font-medium">
            {reading.cardName}
          </span>
          {reading.isReversed && (
            <Badge variant="outline" className="text-xs">
              Invertida
            </Badge>
          )}
        </div>

        {/* Interpretation Preview */}
        <p
          data-testid="interpretation-preview"
          className="text-muted-foreground line-clamp-2 text-sm"
        >
          {reading.interpretationSummary}
        </p>

        {/* Action Button */}
        <div className="flex justify-end pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleViewClick}
            className="text-primary hover:text-primary/80"
          >
            <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
            Ver completa
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
