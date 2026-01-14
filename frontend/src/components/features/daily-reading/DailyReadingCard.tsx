'use client';

import * as React from 'react';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import ReactMarkdown from 'react-markdown';

import { cn } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DailyReadingHistoryItem } from '@/types';

/**
 * DailyReadingCard Component Props
 */
export interface DailyReadingCardProps {
  /** Daily reading history item data */
  reading: DailyReadingHistoryItem;
  /** Callback when card is clicked (optional, card is self-contained) */
  onView?: (id: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Format date to Spanish full format (e.g., "Lunes 2 de Diciembre")
 * Capitalizes the first letter
 *
 * IMPORTANT: dateString comes as 'YYYY-MM-DD' from the backend.
 * Using new Date('YYYY-MM-DD') interprets it as UTC midnight, which causes
 * the date to shift to the previous day in negative UTC offset timezones
 * (e.g., Argentina UTC-3). We append 'T12:00:00' to treat it as noon local
 * time, avoiding any date shift issues across all timezones.
 */
function formatReadingDate(dateString: string): string {
  // Append noon time to avoid timezone date shift issues
  const date = new Date(`${dateString}T12:00:00`);
  const formatted = format(date, "EEEE d 'de' MMMM", { locale: es });
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}

/**
 * DailyReadingCard Component
 *
 * Displays a daily reading card for the history view.
 * Self-contained design - shows all relevant info without needing navigation.
 *
 * Layout (vertical with header):
 * - Header: Thumbnail + Date + Card name + Badges
 * - Body: Full interpretation text (rendered as markdown)
 *
 * Features:
 * - Card thumbnail with image
 * - Date in Spanish format (e.g., "Lunes 2 de Diciembre")
 * - Reversed indicator badge
 * - Regenerated badge when applicable
 * - Full interpretation (rendered as markdown)
 * - Subtle hover effect
 *
 * @example
 * ```tsx
 * <DailyReadingCard reading={dailyReading} />
 * ```
 */
export function DailyReadingCard({ reading, className }: DailyReadingCardProps) {
  const formattedDate = formatReadingDate(reading.readingDate);

  return (
    <Card
      data-testid="daily-reading-card"
      className={cn(
        'flex flex-col gap-4',
        'bg-card',
        'shadow-sm',
        'p-4',
        'transition-all duration-200',
        'hover:shadow-md',
        className
      )}
    >
      {/* Header: Thumbnail + Info */}
      <div className="flex flex-row items-center gap-3">
        {/* Thumbnail */}
        <div className="bg-muted flex h-16 w-12 shrink-0 items-center justify-center overflow-hidden rounded-md">
          {reading.cardImageUrl ? (
            <Image
              src={reading.cardImageUrl}
              alt={`Carta ${reading.cardName}`}
              width={48}
              height={64}
              className={cn('h-full w-full object-cover', reading.isReversed && 'rotate-180')}
            />
          ) : (
            <span className="text-muted-foreground text-xs">?</span>
          )}
        </div>

        {/* Info */}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          {/* Date + Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-primary font-serif text-base font-semibold">{formattedDate}</h3>
            {reading.isReversed && (
              <Badge variant="outline" className="px-1.5 py-0 text-xs">
                Invertida
              </Badge>
            )}
            {reading.wasRegenerated && (
              <Badge variant="secondary" className="flex items-center gap-1 px-1.5 py-0 text-xs">
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
              </Badge>
            )}
          </div>

          {/* Card Name */}
          <span className="text-text-primary text-sm font-medium">{reading.cardName}</span>
        </div>
      </div>

      {/* Full Interpretation */}
      {reading.interpretationSummary && (
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{reading.interpretationSummary}</ReactMarkdown>
        </div>
      )}
    </Card>
  );
}
