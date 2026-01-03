'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { RefreshCw, Share2, Plus, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

import {
  useSpreads,
  usePredefinedQuestions,
  useCreateReading,
  useRegenerateInterpretation,
  useShareReading,
} from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';
import { useUserPlanFeatures } from '@/hooks/utils/useUserPlanFeatures';
import { TarotCard } from './TarotCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorDisplay } from '@/components/ui/error-display';
import UpgradeBanner from './UpgradeBanner';
import UpgradeModal from './UpgradeModal';
import { cn } from '@/lib/utils';
import type {
  ReadingDetail,
  ReadingCard,
  CreateReadingDto,
  CardPositionDto,
  Interpretation,
} from '@/types';

// ============================================================================
// Helpers
// ============================================================================

/**
 * Safely extract the general interpretation from the reading
 * Handles string, object, or null interpretation types
 */
function getGeneralInterpretation(interpretation: Interpretation | string | null): string {
  if (!interpretation) return '';
  if (typeof interpretation === 'string') return interpretation;
  return interpretation.generalInterpretation || '';
}

// ============================================================================
// Constants
// ============================================================================

const LOADING_MESSAGES = [
  'Consultando con el universo...',
  'Alineando energías...',
  'Descifrando el mensaje cósmico...',
];

const LOADING_MESSAGE_INTERVAL = 2000;

/** Total number of cards in a tarot deck */
const DECK_SIZE = 78;

/** Default deck ID (Rider-Waite) */
const DEFAULT_DECK_ID = 1;

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
  // Check if interpretation seems truncated (ends mid-word or mid-sentence)
  const seemsTruncated =
    interpretation &&
    !interpretation.trim().endsWith('.') &&
    !interpretation.trim().endsWith('!') &&
    !interpretation.trim().endsWith('?') &&
    !interpretation.trim().endsWith('"') &&
    interpretation.length > 100;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-serif text-2xl">
          <Sparkles className="text-primary h-6 w-6" />
          Tu lectura del Tarot
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="prose prose-purple prose-p:text-text-primary prose-p:leading-relaxed prose-headings:text-text-primary prose-strong:text-primary max-w-none"
          data-testid="interpretation-content"
        >
          {interpretation ? (
            <>
              <ReactMarkdown>{interpretation}</ReactMarkdown>
              {seemsTruncated && (
                <p className="text-text-muted mt-4 text-sm italic">
                  (La interpretación puede haber sido truncada por límites del modelo de IA)
                </p>
              )}
            </>
          ) : (
            <p className="text-text-muted italic">
              La interpretación está siendo generada. Por favor, espera un momento...
            </p>
          )}
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
  const { canUseAI } = useUserPlanFeatures();

  // API Hooks
  const { data: spreads, isLoading: isSpreadsLoading } = useSpreads();
  const { data: predefinedQuestions, isLoading: isQuestionsLoading } = usePredefinedQuestions();
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
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Derived values
  const spread = useMemo(() => {
    return spreads?.find((s) => s.id === spreadId);
  }, [spreads, spreadId]);

  const selectedQuestion = useMemo(() => {
    if (!questionId || !predefinedQuestions) return null;
    return predefinedQuestions.find((q) => q.id === questionId);
  }, [questionId, predefinedQuestions]);

  const cardsCount = spread?.cardCount ?? 0;
  const isPremium = user?.plan === 'PREMIUM';

  // Display the actual question text
  const questionText = customQuestion || selectedQuestion?.questionText || 'Tu pregunta al tarot';

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
          // Always allow deselection
          newSelection.delete(cardIndex);
        } else if (newSelection.size < cardsCount) {
          // Only allow selection if we haven't reached the limit
          newSelection.add(cardIndex);
        }
        return newSelection;
      });
    },
    [state, cardsCount]
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
    if (selectedCards.size !== cardsCount || !spread) return;

    setState('loading');
    setError(null);

    try {
      // Convert selected card indices (0-77) to card IDs (1-78)
      const selectedCardIndices = Array.from(selectedCards);
      const cardIds = selectedCardIndices.map((index) => index + 1);

      // Build card positions array using spread's position definitions
      const cardPositions: CardPositionDto[] = selectedCardIndices.map((index, i) => {
        const position = spread.positions?.[i];
        return {
          cardId: index + 1,
          position: position?.name ?? `Posición ${i + 1}`,
          isReversed: Math.random() < 0.3, // 30% chance of reversed
        };
      });

      const createDto: CreateReadingDto = {
        spreadId,
        deckId: DEFAULT_DECK_ID,
        cardIds,
        cardPositions,
        ...(questionId ? { predefinedQuestionId: questionId } : {}),
        ...(customQuestion ? { customQuestion } : {}),
        // TASK-006: Send useAI flag based on user plan
        // - PREMIUM: useAI: true (generates AI interpretation)
        // - FREE/ANONYMOUS: useAI: false (DB info only)
        useAI: canUseAI,
      };

      const result = await createReading(createDto);
      setReadingResult(result);
      setState('result');
    } catch (error) {
      console.error('Failed to create reading:', error);
      setState('error');
      setError('Error al crear la lectura. Por favor, intenta de nuevo.');
    }
  }, [
    selectedCards,
    cardsCount,
    spread,
    spreadId,
    questionId,
    customQuestion,
    createReading,
    canUseAI,
  ]);

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
  if (isSpreadsLoading || isQuestionsLoading) {
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
        return 'grid grid-cols-3 gap-4 justify-items-center';
      case 5:
        return 'grid grid-cols-3 gap-4 justify-items-center'; // Cruz layout handled differently
      case 10:
        return 'grid grid-cols-4 gap-4 justify-items-center'; // Celtic cross layout
      default:
        return 'grid grid-cols-3 gap-4 justify-items-center';
    }
  };

  return (
    <div className="bg-bg-main min-h-screen p-4 md:p-8">
      {/* Spread & Question Display - centrado */}
      <div className="mb-8 text-center">
        <p className="text-primary mb-1 text-sm font-medium">{spread.name}</p>
        <p className="text-text-muted mb-2 text-sm">Tu consulta:</p>
        <p className="text-text-primary font-serif text-xl md:text-2xl">{questionText}</p>
      </div>

      {/* ESTADO 1: Selección de cartas */}
      {state === 'selecting' && (
        <>
          <h2 className="mb-6 text-center font-serif text-2xl">Selecciona tus cartas</h2>

          {/* Selection progress */}
          <p className="text-text-muted mb-4 text-center">
            {selectedCards.size} de {cardsCount} cartas seleccionadas
          </p>
          <p className="text-text-muted mb-6 text-center text-sm">
            Elige {cardsCount} carta{cardsCount > 1 ? 's' : ''} del mazo
          </p>

          {/* TASK-006: Show different message based on user plan */}
          <div className="text-text-muted mb-6 text-center text-sm">
            {canUseAI ? (
              <p className="text-primary font-medium">✨ Recibirás interpretación personalizada</p>
            ) : (
              <p>Verás las cartas y sus significados</p>
            )}
          </div>

          {/* Full Deck Grid - 78 cards */}
          <div className="mx-auto mb-8 w-full max-w-6xl px-2 sm:px-4">
            <div
              data-testid="card-selection-grid"
              className="grid grid-cols-6 justify-items-center gap-1 sm:grid-cols-8 sm:gap-2 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-13"
            >
              {Array.from({ length: DECK_SIZE }).map((_, index) => {
                const isSelected = selectedCards.has(index);
                const canSelect = selectedCards.size < cardsCount || isSelected;

                return (
                  <div
                    key={index}
                    data-testid="selectable-card"
                    role="button"
                    tabIndex={canSelect ? 0 : -1}
                    className={cn(
                      'transition-all duration-300',
                      canSelect ? 'cursor-pointer' : 'cursor-not-allowed opacity-50',
                      isSelected && 'ring-primary z-10 scale-110 ring-2 ring-offset-1'
                    )}
                    onClick={() => handleCardClick(index)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    aria-label={`Carta ${index + 1}${isSelected ? ' - seleccionada' : ''}`}
                    aria-pressed={isSelected}
                    aria-disabled={!canSelect}
                  >
                    <TarotCard isRevealed={false} size="sm" />
                  </div>
                );
              })}
            </div>
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
      {state === 'loading' && (
        <div className="mx-auto max-w-4xl">
          <LoadingState message={LOADING_MESSAGES[loadingMessageIndex]} />
        </div>
      )}

      {/* ESTADO 3: Resultado */}
      {state === 'result' && readingResult && (
        <div className="mx-auto max-w-4xl">
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
            interpretation={getGeneralInterpretation(readingResult.interpretation)}
          />

          {/* Upgrade Banner for non-premium users */}
          {!canUseAI && (
            <div className="mt-6">
              <UpgradeBanner onUpgradeClick={() => setShowUpgradeModal(true)} />
            </div>
          )}

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
        </div>
      )}

      {/* ESTADO ERROR */}
      {state === 'error' && (
        <div className="mx-auto max-w-4xl py-12 text-center">
          <ErrorDisplay message={error || 'Error al crear la lectura'} onRetry={handleRetry} />
          <Button variant="outline" onClick={handleRetry} className="mt-4">
            Reintentar
          </Button>
        </div>
      )}

      {/* Upgrade Modal */}
      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  );
}
