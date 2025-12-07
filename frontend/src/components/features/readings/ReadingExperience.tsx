'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Share2, Plus, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import {
  useSpreads,
  useCreateReading,
  useRegenerateInterpretation,
  useShareReading,
} from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';
import { TarotCard } from './TarotCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import { cn } from '@/lib/utils';
import type { ReadingDetail, ReadingCard, CreateReadingDto } from '@/types';

// ============================================================================
// Constants
// ============================================================================

const LOADING_MESSAGES = [
  'Consultando con el universo...',
  'Alineando energías...',
  'Descifrando el mensaje cósmico...',
];

const LOADING_MESSAGE_INTERVAL = 2000;

// ============================================================================
// Types
// ============================================================================

type ExperienceState = 'selecting' | 'loading' | 'result' | 'error';

export interface ReadingExperienceProps {
  /** Spread ID from URL params */
  spreadId: number;
  /** Question ID from URL params (for predefined questions) */
  questionId: number | null;
  /** Custom question from URL params (for premium users) */
  customQuestion: string | null;
}

// ============================================================================
// Sub-components
// ============================================================================

/**
 * Loading state component with rotating cosmic messages
 */
interface LoadingStateProps {
  message: string;
}

function LoadingState({ message }: LoadingStateProps) {
  return (
    <div
      data-testid="loading-state"
      className="flex min-h-[60vh] flex-col items-center justify-center"
    >
      <div className="relative mb-8">
        {/* Pulse animation */}
        <div className="bg-primary/20 absolute inset-0 animate-ping rounded-full" />
        <div className="bg-primary/10 relative flex h-24 w-24 items-center justify-center rounded-full">
          <Sparkles className="text-primary h-12 w-12 animate-pulse" />
        </div>
      </div>

      <p className="text-text-primary mb-4 font-serif text-xl">{message}</p>

      {/* Progress bar */}
      <div className="h-2 w-64 overflow-hidden rounded-full bg-gray-200">
        <div className="bg-primary animate-progress h-full rounded-full" />
      </div>
    </div>
  );
}

/**
 * Result card component for displaying a revealed tarot card
 */
interface ResultCardProps {
  card: ReadingCard;
  index: number;
}

function ResultCard({ card, index }: ResultCardProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, index * 300);

    return () => clearTimeout(timer);
  }, [index]);

  return (
    <div
      className={cn(
        'flex flex-col items-center transition-all duration-500',
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
      )}
    >
      <TarotCard card={card} isRevealed={true} size="md" />
      <div className="mt-2 text-center">
        <p className="text-text-primary font-serif text-lg">{card.name}</p>
        <p className="text-text-muted text-sm">{card.positionName}</p>
        {card.orientation === 'reversed' && (
          <span className="text-xs text-amber-600">(Invertida)</span>
        )}
      </div>
    </div>
  );
}

/**
 * Interpretation section component
 */
interface InterpretationSectionProps {
  interpretation: string;
}

function InterpretationSection({ interpretation }: InterpretationSectionProps) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
          <Sparkles className="text-primary h-6 w-6" />
          Tu lectura del Tarot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-purple max-w-none" data-testid="interpretation-content">
          <ReactMarkdown>{interpretation}</ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * ReadingExperience Component
 *
 * Complete reading experience with 3 states:
 * 1. Card Selection - User selects cards from face-down deck
 * 2. Loading - AI generates interpretation
 * 3. Result - Display cards and interpretation
 */
export function ReadingExperience({
  spreadId,
  questionId,
  customQuestion,
}: ReadingExperienceProps) {
  const router = useRouter();
  const { user } = useAuthStore();

  // API Hooks
  const { data: spreads, isLoading: isSpreadsLoading } = useSpreads();
  const { mutateAsync: createReading } = useCreateReading();
  const { mutate: regenerateInterpretation, isPending: isRegenerating } =
    useRegenerateInterpretation();
  const { mutate: shareReading, isPending: isSharing } = useShareReading();

  // State
  const [state, setState] = useState<ExperienceState>('selecting');
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [loadingMessageIndex, setLoadingMessageIndex] = useState(0);
  const [readingResult, setReadingResult] = useState<ReadingDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Derived values
  const spread = useMemo(() => {
    return spreads?.find((s) => s.id === spreadId);
  }, [spreads, spreadId]);

  const cardsCount = spread?.cardsCount ?? 0;
  const isPremium = user?.plan === 'PREMIUM';
  const question = customQuestion || 'Tu pregunta al tarot';

  // Rotate loading messages
  useEffect(() => {
    if (state !== 'loading') return;

    const interval = setInterval(() => {
      setLoadingMessageIndex((prev) => (prev + 1) % LOADING_MESSAGES.length);
    }, LOADING_MESSAGE_INTERVAL);

    return () => clearInterval(interval);
  }, [state]);

  // Card selection handlers
  const handleCardClick = useCallback(
    (cardIndex: number) => {
      if (state !== 'selecting') return;

      setSelectedCards((prev) => {
        const newSelection = new Set(prev);
        if (newSelection.has(cardIndex)) {
          newSelection.delete(cardIndex);
        } else {
          newSelection.add(cardIndex);
        }
        return newSelection;
      });
    },
    [state]
  );

  const handleKeyDown = useCallback(
    (cardIndex: number, event: React.KeyboardEvent) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleCardClick(cardIndex);
      }
    },
    [handleCardClick]
  );

  // Create reading handler
  const handleReveal = useCallback(async () => {
    if (selectedCards.size !== cardsCount) return;

    setState('loading');
    setError(null);

    try {
      const createDto: CreateReadingDto = {
        spreadId,
        ...(questionId ? { predefinedQuestionId: questionId } : {}),
        ...(customQuestion ? { customQuestion } : {}),
      };

      const result = await createReading(createDto);
      setReadingResult(result);
      setState('result');
    } catch {
      setState('error');
      setError('Error al crear la lectura. Por favor, intenta de nuevo.');
    }
  }, [selectedCards, cardsCount, spreadId, questionId, customQuestion, createReading]);

  // Action handlers
  const handleRegenerate = useCallback(() => {
    if (!readingResult) return;
    regenerateInterpretation(readingResult.id);
  }, [readingResult, regenerateInterpretation]);

  const handleShare = useCallback(() => {
    if (!readingResult) return;
    shareReading(readingResult.id);
  }, [readingResult, shareReading]);

  const handleNewReading = useCallback(() => {
    router.push('/ritual');
  }, [router]);

  const handleRetry = useCallback(() => {
    setState('selecting');
    setSelectedCards(new Set());
    setError(null);
  }, []);

  // Render loading/missing spread state
  if (isSpreadsLoading) {
    return (
      <div className="bg-bg-main flex min-h-screen items-center justify-center p-8">
        <div className="animate-pulse">Cargando...</div>
      </div>
    );
  }

  if (!spread) {
    return (
      <div className="bg-bg-main min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <ErrorDisplay
            message="Tirada no encontrada. Selecciona una tirada válida."
            onRetry={() => router.push('/ritual')}
          />
        </div>
      </div>
    );
  }

  // Get grid layout classes based on card count
  const getGridClasses = () => {
    switch (cardsCount) {
      case 1:
        return 'flex justify-center';
      case 3:
        return 'grid grid-cols-3 gap-4';
      case 5:
        return 'grid grid-cols-3 gap-4'; // Cruz layout handled differently
      case 10:
        return 'grid grid-cols-4 gap-4'; // Celtic cross layout
      default:
        return 'grid grid-cols-3 gap-4';
    }
  };

  return (
    <div className="bg-bg-main min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Question Display */}
        <div className="mb-8 text-center">
          <p className="text-text-muted mb-2 text-sm">Tu consulta:</p>
          <p className="text-text-primary font-serif text-xl md:text-2xl">{question}</p>
        </div>

        {/* ESTADO 1: Selección de cartas */}
        {state === 'selecting' && (
          <>
            <h2 className="mb-6 text-center font-serif text-2xl">Selecciona tus cartas</h2>

            {/* Selection progress */}
            <p className="text-text-muted mb-6 text-center">
              {selectedCards.size} de {cardsCount} cartas seleccionadas
            </p>

            {/* Card Grid */}
            <div
              data-testid="card-selection-grid"
              className={cn(getGridClasses(), 'mx-auto mb-8 max-w-2xl')}
            >
              {Array.from({ length: cardsCount }).map((_, index) => (
                <div
                  key={index}
                  data-testid="selectable-card"
                  role="button"
                  tabIndex={0}
                  className={cn(
                    'cursor-pointer transition-all duration-300',
                    selectedCards.has(index) && 'ring-primary ring-2 ring-offset-2'
                  )}
                  onClick={() => handleCardClick(index)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  aria-label={`Carta ${index + 1}${selectedCards.has(index) ? ' - seleccionada' : ''}`}
                  aria-pressed={selectedCards.has(index)}
                >
                  <TarotCard isRevealed={false} size="md" />
                </div>
              ))}
            </div>

            {/* Reveal Button */}
            <div className="flex justify-center">
              <Button
                size="lg"
                onClick={handleReveal}
                disabled={selectedCards.size !== cardsCount}
                className="px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Revelar mi destino
              </Button>
            </div>
          </>
        )}

        {/* ESTADO 2: Loading IA */}
        {state === 'loading' && <LoadingState message={LOADING_MESSAGES[loadingMessageIndex]} />}

        {/* ESTADO 3: Resultado */}
        {state === 'result' && readingResult && (
          <>
            <h2 className="mb-8 text-center font-serif text-2xl">Tu lectura del Tarot</h2>

            {/* Revealed Cards */}
            <div
              data-testid="result-cards-grid"
              className={cn(getGridClasses(), 'mx-auto mb-8 max-w-3xl')}
            >
              {readingResult.cards.map((card, index) => (
                <ResultCard key={card.id} card={card} index={index} />
              ))}
            </div>

            {/* Interpretation */}
            <InterpretationSection
              interpretation={readingResult.interpretation.generalInterpretation}
            />

            {/* Action Buttons */}
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {isPremium && (
                <Button variant="outline" onClick={handleRegenerate} disabled={isRegenerating}>
                  <RefreshCw className={cn('mr-2 h-4 w-4', isRegenerating && 'animate-spin')} />
                  Regenerar Interpretación
                </Button>
              )}

              <Button variant="outline" onClick={handleShare} disabled={isSharing}>
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>

              <Button onClick={handleNewReading}>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Lectura
              </Button>
            </div>
          </>
        )}

        {/* ESTADO ERROR */}
        {state === 'error' && (
          <div className="py-12 text-center">
            <ErrorDisplay message={error || 'Error al crear la lectura'} onRetry={handleRetry} />
            <Button variant="outline" onClick={handleRetry} className="mt-4">
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
