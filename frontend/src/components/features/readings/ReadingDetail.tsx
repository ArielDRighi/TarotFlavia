'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ArrowLeft, Share2, RefreshCw, ChevronRight, RotateCcw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import {
  useReadingDetail,
  useSpreads,
  useRegenerateInterpretation,
  useShareReading,
} from '@/hooks/api/useReadings';
import { toast } from '@/hooks/utils/useToast';
import { TarotCard } from '@/components/features/readings/TarotCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { cn } from '@/lib/utils';
import type { Interpretation } from '@/types/reading.types';

/**
 * Helper to safely extract interpretation data
 * Handles the case where interpretation can be string, object, or null
 */
function getInterpretationData(interpretation: Interpretation | string | null): {
  generalInterpretation: string;
  cardInterpretations: Array<{ cardId: number; interpretation: string }>;
} {
  if (!interpretation) {
    return { generalInterpretation: '', cardInterpretations: [] };
  }
  if (typeof interpretation === 'string') {
    return { generalInterpretation: interpretation, cardInterpretations: [] };
  }
  return {
    generalInterpretation: interpretation.generalInterpretation || '',
    cardInterpretations: interpretation.cardInterpretations || [],
  };
}

/**
 * Reading Detail Skeleton
 * Shows loading state while fetching reading data
 */
function ReadingDetailSkeleton() {
  return (
    <div data-testid="reading-detail-skeleton" className="space-y-8">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Header skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-10 w-3/4" />
        <div className="flex gap-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-80 w-full rounded-xl" />
        ))}
      </div>

      {/* Interpretation skeleton */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Reading Not Found Component
 */
function ReadingNotFound({ onBack }: { onBack: () => void }) {
  return (
    <div
      data-testid="reading-not-found"
      className="flex min-h-[50vh] flex-col items-center justify-center space-y-6"
    >
      <div className="text-center">
        <h2 className="text-text-primary mb-2 font-serif text-2xl">Lectura no encontrada</h2>
        <p className="text-text-muted">La lectura que buscas no existe o ha sido eliminada.</p>
      </div>
      <Button onClick={onBack} variant="outline">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Volver al historial
      </Button>
    </div>
  );
}

/**
 * Breadcrumb Navigation
 */
function Breadcrumb({ onHistoryClick }: { onHistoryClick: () => void }) {
  return (
    <nav className="text-text-muted flex items-center gap-2 text-sm" aria-label="Breadcrumb">
      <button
        onClick={onHistoryClick}
        className="hover:text-primary transition-colors"
        type="button"
      >
        Historial
      </button>
      <ChevronRight className="h-4 w-4" aria-hidden="true" />
      <span className="text-text-primary">Lectura</span>
    </nav>
  );
}

/**
 * Card Display Component
 * Shows a card with its position and brief interpretation
 */
interface CardDisplayProps {
  card: {
    id: number;
    name: string;
    orientation: 'upright' | 'reversed';
    position: number;
    positionName: string;
    imageUrl?: string;
  };
  interpretation?: string;
}

function CardDisplay({ card, interpretation }: CardDisplayProps) {
  const isReversed = card.orientation === 'reversed';

  return (
    <div className="flex flex-col items-center space-y-3">
      {/* Position name */}
      <span className="text-text-muted text-sm font-medium">{card.positionName}</span>

      {/* Card */}
      <TarotCard
        card={{
          id: card.id,
          name: card.name,
          arcana: 'major',
          number: card.position,
          suit: null,
          orientation: card.orientation,
          position: card.position,
          positionName: card.positionName,
          imageUrl: card.imageUrl,
          isReversed: isReversed,
          meaningUpright: undefined,
          meaningReversed: undefined,
          keywords: undefined,
          description: undefined,
        }}
        isRevealed={true}
        size="md"
      />

      {/* Card name and orientation */}
      <div className="text-center">
        <p className="text-text-primary font-serif text-lg">{card.name}</p>
        {isReversed && (
          <div
            data-testid={`card-reversed-indicator-${card.id}`}
            className="mt-1 flex items-center justify-center gap-1"
          >
            <RotateCcw className="text-secondary h-3 w-3" />
            <span className="text-secondary text-xs">Invertida</span>
          </div>
        )}
      </div>

      {/* Brief interpretation */}
      {interpretation && (
        <p className="text-text-muted line-clamp-3 text-center text-sm">{interpretation}</p>
      )}
    </div>
  );
}

/**
 * Markdown Components for custom styling
 */
const markdownComponents = {
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-text-primary mb-4 font-serif text-2xl font-bold" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-text-primary mt-6 mb-3 font-serif text-xl font-semibold" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-text-primary mt-4 mb-2 font-serif text-lg font-medium" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-text-primary mb-4 leading-relaxed" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="text-text-primary mb-4 list-inside list-disc space-y-2" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="text-text-primary mb-4 list-inside list-decimal space-y-2" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }: React.HTMLAttributes<HTMLLIElement>) => (
    <li className="text-text-primary" {...props}>
      {children}
    </li>
  ),
  strong: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <strong className="text-primary font-semibold" {...props}>
      {children}
    </strong>
  ),
  em: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <em className="text-text-muted italic" {...props}>
      {children}
    </em>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-secondary text-text-muted my-4 border-l-4 pl-4 italic" {...props}>
      {children}
    </blockquote>
  ),
};

/**
 * ReadingDetail Component Props
 */
export interface ReadingDetailProps {
  /** Reading ID to display */
  readingId: number;
}

/**
 * ReadingDetail Component
 *
 * Displays a full reading with cards, interpretation, and actions.
 * Features:
 * - Breadcrumb navigation
 * - Question display with date and spread type
 * - Card grid with positions and brief interpretations
 * - Full interpretation rendered as markdown
 * - Share and regenerate actions
 */
export function ReadingDetail({ readingId }: ReadingDetailProps) {
  const router = useRouter();

  // State
  const [showRegenerateModal, setShowRegenerateModal] = React.useState(false);

  // Data fetching
  const { data: reading, isLoading: isReadingLoading, isError } = useReadingDetail(readingId);
  const { data: spreads } = useSpreads();

  // Mutations
  const { mutate: regenerate, isPending: isRegenerating } = useRegenerateInterpretation();
  const { mutateAsync: shareReadingAsync, isPending: isSharing } = useShareReading();

  // Get spread info
  const spread = spreads?.find((s) => s.id === reading?.spreadId);

  // Handlers
  const handleBackToHistory = () => {
    router.push('/historial');
  };

  const handleShare = async () => {
    if (!reading) return;

    try {
      const result = await shareReadingAsync(reading.id);
      const shareUrl = `${window.location.origin}/lecturas/compartida/${result.shareToken}`;
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copiado al portapapeles');
    } catch {
      toast.error('Error al compartir la lectura');
    }
  };

  const handleRegenerateClick = () => {
    setShowRegenerateModal(true);
  };

  const handleRegenerateConfirm = () => {
    if (!reading) return;
    regenerate(reading.id);
    setShowRegenerateModal(false);
  };

  // Loading state
  if (isReadingLoading) {
    return <ReadingDetailSkeleton />;
  }

  // Error state
  if (isError || !reading) {
    return <ReadingNotFound onBack={handleBackToHistory} />;
  }

  // Get card interpretations map
  const interpretationData = getInterpretationData(reading.interpretation);
  const cardInterpretations = interpretationData.cardInterpretations.reduce(
    (acc: Record<number, string>, ci: { cardId: number; interpretation: string }) => {
      acc[ci.cardId] = ci.interpretation;
      return acc;
    },
    {} as Record<number, string>
  );

  // Format date
  const formattedDate = format(new Date(reading.createdAt), "d 'de' MMMM 'de' yyyy, HH:mm", {
    locale: es,
  });

  return (
    <>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <Breadcrumb onHistoryClick={handleBackToHistory} />

        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-text-primary font-serif text-2xl leading-tight md:text-3xl">
            {reading.question}
          </h1>
          <div className="flex flex-wrap items-center gap-4">
            <time data-testid="reading-date" className="text-text-muted text-sm">
              {formattedDate}
            </time>
            {spread && (
              <Badge data-testid="spread-badge" variant="secondary">
                {spread.name}
              </Badge>
            )}
          </div>
        </header>

        {/* Cards Section */}
        <section aria-labelledby="cards-heading">
          <h2 id="cards-heading" className="text-text-primary mb-6 font-serif text-xl">
            Las Cartas
          </h2>
          <div
            className={cn(
              'grid gap-8',
              reading.cards.length <= 3
                ? 'grid-cols-1 sm:grid-cols-3'
                : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
            )}
          >
            {reading.cards.map((card) => (
              <CardDisplay
                key={card.id}
                card={card}
                interpretation={cardInterpretations[card.id]}
              />
            ))}
          </div>
        </section>

        {/* Interpretation Section */}
        <section aria-labelledby="interpretation-heading">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle id="interpretation-heading" className="font-serif">
                Interpretación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                data-testid="interpretation-content"
                className={cn('prose prose-slate max-w-none', isRegenerating && 'animate-pulse')}
              >
                <ReactMarkdown components={markdownComponents}>
                  {interpretationData.generalInterpretation}
                </ReactMarkdown>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Actions */}
        <footer className="flex flex-col gap-4 pt-4 sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={handleBackToHistory}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al historial
          </Button>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleShare} disabled={isSharing}>
              <Share2 className="mr-2 h-4 w-4" />
              {isSharing ? 'Compartiendo...' : 'Compartir'}
            </Button>

            <Button onClick={handleRegenerateClick} disabled={isRegenerating}>
              <RefreshCw className={cn('mr-2 h-4 w-4', isRegenerating && 'animate-spin')} />
              {isRegenerating ? 'Regenerando...' : 'Regenerar Interpretación'}
            </Button>
          </div>
        </footer>
      </div>

      {/* Regenerate Confirmation Modal */}
      <ConfirmationModal
        open={showRegenerateModal}
        onOpenChange={setShowRegenerateModal}
        title="Regenerar Interpretación"
        description="Esto consumirá una regeneración de tu plan. ¿Deseas continuar?"
        confirmText="Confirmar"
        cancelText="Cancelar"
        onConfirm={handleRegenerateConfirm}
      />
    </>
  );
}
