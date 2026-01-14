'use client';

import * as React from 'react';
import Image from 'next/image';
import { RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { cn, formatDateFull } from '@/lib/utils';
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
  const formattedDate = formatDateFull(reading.readingDate);

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
