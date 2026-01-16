'use client';

import * as React from 'react';
import Image from 'next/image';
import { RefreshCw, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import { cn, formatDateFull } from '@/lib/utils';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/utils/useToast';
import { shouldUseNativeShare } from '@/lib/utils/device';
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
 * - Header: Thumbnail + Date + Card name + Badges + Share button
 * - Body: Full interpretation text (rendered as markdown)
 *
 * Features:
 * - Card thumbnail with image
 * - Date in Spanish format (e.g., "Lunes 2 de Diciembre")
 * - Reversed indicator badge
 * - Regenerated badge when applicable
 * - Share button (fetches text from backend)
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
  const [isSharing, setIsSharing] = React.useState(false);

  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSharing(true);

    try {
      // For historical readings, fetch share text from backend using reading ID
      // Note: Backend doesn't have endpoint for historical daily readings by ID yet,
      // so we generate the text locally using the data we have
      //
      // NOTE: This duplicates formatting from backend ShareTextGeneratorService intentionally.
      // Historical daily readings should NOT make backend API calls - this is a lightweight
      // local fallback. If format changes, update both places or extract to shared constant.
      const cardName = `${reading.cardName}${reading.isReversed ? ' (Invertida)' : ''}`;
      const content = reading.interpretationSummary;

      const shareText = `🌟 Carta del Día en Auguria

🃏 ${cardName}

${content}

━━━━━━━━━━━━━━━━━━
✨ Descubre tu carta gratis:
auguriatarot.com`;

      // Solo usar Web Share API en móvil, en PC copiar al portapapeles
      if (shouldUseNativeShare()) {
        await navigator.share({ text: shareText });
        toast.success('¡Compartido!');
      } else {
        await navigator.clipboard.writeText(shareText);
        toast.success('Texto copiado al portapapeles');
      }
    } catch (error) {
      // Don't show error if user cancelled share
      if (error instanceof DOMException && error.name === 'AbortError') {
        return;
      }
      toast.error('Error al compartir');
    } finally {
      setIsSharing(false);
    }
  };

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
      {/* Header: Thumbnail + Info + Share Button */}
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

        {/* Share Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleShare}
          disabled={isSharing}
          className="shrink-0"
          aria-label="Compartir carta"
        >
          <Share2 className="h-4 w-4" />
        </Button>
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
