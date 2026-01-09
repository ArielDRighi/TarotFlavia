'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, History, Sparkles } from 'lucide-react';
import { ROUTES } from '@/lib/constants/routes';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TarotCard } from '@/components/features/readings/TarotCard';
import { AnonymousLimitReached } from './AnonymousLimitReached';
import { DailyCardLimitReached } from './DailyCardLimitReached';
import {
  useDailyReadingToday,
  useDailyReading,
  useDailyReadingPublic,
} from '@/hooks/api/useDailyReading';
import { useUserCapabilities, useInvalidateCapabilities } from '@/hooks/api/useUserCapabilities';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/utils/useToast';
import { cn } from '@/lib/utils';
import { getSessionFingerprint } from '@/lib/utils/fingerprint';
import type { DailyReading, ReadingCard } from '@/types';

/**
 * Transform DailyReading card to ReadingCard format for TarotCard component
 * Defined outside component as it doesn't depend on component state
 */
function transformToReadingCard(reading: DailyReading): ReadingCard {
  return {
    id: reading.card.id,
    name: reading.card.name,
    arcana: reading.card.category === 'major' ? 'major' : 'minor',
    number: reading.card.number,
    suit: null,
    orientation: reading.isReversed ? 'reversed' : 'upright',
    position: 1,
    positionName: 'Carta del Día',
    imageUrl: reading.isReversed
      ? reading.card.reversedImageUrl || reading.card.imageUrl
      : reading.card.imageUrl,
    isReversed: reading.isReversed,
    meaningUpright: reading.card.meaningUpright,
    meaningReversed: reading.card.meaningReversed,
    keywords: reading.card.keywords,
    description: reading.card.description,
  };
}

/**
 * DailyCardExperience Component
 *
 * Displays the daily card experience with two main states:
 * - UNREVEALED: Face-down card with mystical prompt
 * - REVEALED: Face-up card with interpretation and actions
 *
 * Features:
 * - Uses capabilities system as SINGLE SOURCE OF TRUTH for limits
 * - Dual flow: anonymous (public endpoint) vs authenticated (protected endpoint)
 * - Anonymous users: See card with DB info only, no AI interpretation
 * - Authenticated users: See card with full interpretation (FREE: DB, PREMIUM: AI)
 * - Smooth flip animation on reveal
 * - Share functionality (copy to clipboard)
 * - Navigation to history
 * - Limit reached states with appropriate CTAs
 *
 * Business Rules:
 * - All users (anonymous, free, premium): 1 daily card per day
 * - PREMIUM gets AI interpretation, but same limit (1/day)
 * - Capabilities are automatically invalidated after creating a reading
 */
export function DailyCardExperience() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Fetch user capabilities - SINGLE SOURCE OF TRUTH for limits
  const { data: capabilities, isLoading: isLoadingCapabilities } = useUserCapabilities();
  const invalidateCapabilities = useInvalidateCapabilities();

  // Extract boolean flags from capabilities
  const canCreateDailyReading = capabilities?.canCreateDailyReading ?? false;

  // Fetch today's reading for authenticated users only IF they can create (haven't reached limit)
  // If limit is reached, don't fetch - user should only see limit message
  // Anonymous users don't fetch initial data - they generate on click (POST with fingerprint)
  const {
    data: dailyReading,
    isLoading: isFetching,
    error,
  } = useDailyReadingToday({ enabled: isAuthenticated && canCreateDailyReading });

  const { mutate: createDailyReading, isPending: isCreating } = useDailyReading();
  const { mutate: createDailyReadingPublic, isPending: isCreatingPublic } = useDailyReadingPublic();

  // Local state
  const [isRevealing, setIsRevealing] = useState(false);
  const [localReading, setLocalReading] = useState<DailyReading | null>(null);

  // Computed values
  const currentReading = localReading || dailyReading;
  const isRevealed = Boolean(currentReading);
  const isCreatingReading = isCreating || isCreatingPublic;

  // Check if user reached limit (authenticated or anonymous)
  // Use capabilities as SINGLE SOURCE OF TRUTH
  // Show limit message when:
  // 1. User can't create daily reading (capabilities say so)
  // 2. AND there's no current reading to display
  // 3. AND not in loading state
  const showLimitReached =
    !isLoadingCapabilities &&
    !canCreateDailyReading &&
    !currentReading && // Don't show limit if we have a reading to display (just created)
    Boolean(capabilities); // Only show after capabilities loaded

  // Separate limit messages for anonymous vs authenticated
  const isAnonymousLimitReached = showLimitReached && !capabilities?.isAuthenticated;
  const isAuthenticatedLimitReached = showLimitReached && capabilities?.isAuthenticated;

  /**
   * Handle card click to create daily reading
   */
  const handleRevealCard = useCallback(async () => {
    if (isCreatingReading || isRevealing || currentReading) return;

    // Preventive check: Don't allow if limit already reached
    if (!canCreateDailyReading) {
      return;
    }

    setIsRevealing(true);

    if (isAuthenticated) {
      // Authenticated users: call protected endpoint
      createDailyReading(undefined, {
        onSuccess: (data) => {
          setLocalReading(data);
          invalidateCapabilities(); // Invalidate capabilities after creating
          setTimeout(() => setIsRevealing(false), 600);
        },
        onError: () => {
          setIsRevealing(false);
        },
      });
    } else {
      // Anonymous users: call public endpoint with fingerprint
      const fingerprint = await getSessionFingerprint();
      createDailyReadingPublic(fingerprint, {
        onSuccess: (data) => {
          setLocalReading(data);
          invalidateCapabilities(); // Invalidate capabilities after creating
          // Mark that anonymous user consumed their daily card (for home page UI)
          try {
            sessionStorage.setItem('tarot_daily_card_consumed', new Date().toISOString());
          } catch {
            // Ignore storage errors
          }
          setTimeout(() => setIsRevealing(false), 600);
        },
        onError: () => {
          setIsRevealing(false);
        },
      });
    }
  }, [
    createDailyReading,
    createDailyReadingPublic,
    isAuthenticated,
    isCreatingReading,
    isRevealing,
    currentReading,
    canCreateDailyReading,
    invalidateCapabilities,
  ]);

  /**
   * Handle share button - copy interpretation to clipboard
   */
  const handleShare = useCallback(async () => {
    if (!currentReading) return;

    const shareText = `🌟 Mi Carta del Día: ${currentReading.card.name}${currentReading.isReversed ? ' (Invertida)' : ''}\n\n${currentReading.interpretation}\n\n✨ Descubre tu carta en Auguria`;

    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Mensaje copiado al portapapeles');
    } catch {
      toast.error('No se pudo copiar el mensaje');
    }
  }, [currentReading]);

  /**
   * Handle history navigation
   */
  const handleViewHistory = useCallback(() => {
    router.push('/historial');
  }, [router]);

  // NOTE: Regenerate functionality removed - not part of business model
  // All users (FREE/PREMIUM) get 1 daily card per day
  // PREMIUM gets AI interpretation but same limit (1/day)

  // Show skeleton while loading capabilities or fetching
  if (isLoadingCapabilities || isFetching) {
    return (
      <div className="flex flex-col items-center gap-8" aria-label="Cargando carta del día">
        <Skeleton data-testid="loading-skeleton" className="h-12 w-64" />
        <Skeleton className="h-72 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full max-w-lg" />
      </div>
    );
  }

  // Show AnonymousLimitReached when anonymous user reached limit
  if (isAnonymousLimitReached) {
    return (
      <div className="flex w-full justify-center">
        <AnonymousLimitReached />
      </div>
    );
  }

  // Show DailyCardLimitReached when authenticated user already has today's card
  if (isAuthenticatedLimitReached) {
    return (
      <div className="flex w-full justify-center">
        <DailyCardLimitReached />
      </div>
    );
  }

  // Show error state (but not for 403/limit related, already handled above)
  if (error && !isAnonymousLimitReached && !isAuthenticatedLimitReached) {
    return (
      <div className="text-center" role="alert">
        <p className="text-destructive">Error al cargar tu carta del día</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <>
      {/* Main Content */}
      {!isRevealed ? (
        // Estado 1: NOT REVEALED
        <div data-testid="unrevealed-state" className="flex flex-col items-center gap-8">
          {/* Mystical prompt */}
          <p className="text-text-muted max-w-md text-center text-lg font-light italic">
            Conecta con tu energía y toca la carta para descubrir el mensaje del universo para ti
            hoy
          </p>

          {/* Face-down card with floating animation */}
          <div
            data-testid="card-container"
            data-can-create={canCreateDailyReading ? 'true' : 'false'}
            className={cn(
              'transition-transform duration-300',
              !isCreatingReading && !isRevealing && 'hover:scale-105'
            )}
          >
            <TarotCard
              isRevealed={false}
              onClick={handleRevealCard}
              size="lg"
              className="shadow-2xl"
            />
          </div>

          {/* Loading state while creating */}
          {(isCreatingReading || isRevealing) && (
            <div data-testid="creating-reading" className="text-primary flex items-center gap-2">
              <Sparkles className="h-5 w-5 animate-pulse" />
              <span className="text-sm">Revelando tu carta...</span>
            </div>
          )}
        </div>
      ) : (
        // Estado 2: REVEALED
        <div data-testid="revealed-state" className="flex w-full flex-col items-center gap-8">
          {/* Revealed card */}
          <div className="animate-fade-in">
            <TarotCard
              card={currentReading ? transformToReadingCard(currentReading) : undefined}
              isRevealed={true}
              size="lg"
              className="shadow-2xl"
            />
          </div>

          {/* Card Title */}
          <div className="text-center">
            <h2 data-testid="card-title" className="text-secondary font-serif text-2xl md:text-3xl">
              {currentReading?.card.name}
            </h2>
            {currentReading?.isReversed && (
              <span className="text-text-muted mt-1 block text-sm">(Invertida)</span>
            )}
          </div>

          {/* Interpretation (authenticated users) or Card Meaning (anonymous users) */}
          {currentReading?.interpretation ? (
            // Authenticated users: Full interpretation
            <div
              data-testid="interpretation-section"
              className="bg-surface shadow-soft w-full max-w-lg rounded-xl p-6"
            >
              <p className="text-text-primary leading-relaxed whitespace-pre-line">
                {currentReading.interpretation}
              </p>
            </div>
          ) : currentReading?.cardMeaning ? (
            // Anonymous users: Card meaning from DB
            <div
              data-testid="card-meaning-section"
              className="bg-surface shadow-soft w-full max-w-lg rounded-xl p-6"
            >
              <p className="text-text-primary leading-relaxed">{currentReading.cardMeaning}</p>
            </div>
          ) : null}

          {/* Anonymous User CTA (shown when no interpretation) */}
          {!isAuthenticated && currentReading?.cardMeaning && (
            <div
              data-testid="anonymous-cta"
              className="bg-primary/5 border-primary/20 w-full max-w-lg rounded-xl border p-6 text-center"
            >
              <p className="text-text-primary mb-4 font-medium">
                ¿Te gustó? Regístrate gratis para obtener lecturas completas
              </p>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button onClick={() => router.push(ROUTES.REGISTER)} size="lg">
                  Crear cuenta gratis
                </Button>
                <Button onClick={() => router.push(ROUTES.LOGIN)} variant="outline" size="lg">
                  Iniciar sesión
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons (only for authenticated users with interpretation) */}
          {isAuthenticated && currentReading?.interpretation && (
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" onClick={handleShare} aria-label="Compartir mensaje">
                <Copy className="h-4 w-4" />
                Compartir mensaje
              </Button>

              <Button
                variant="outline"
                onClick={handleViewHistory}
                aria-label="Ver historial de cartas"
              >
                <History className="h-4 w-4" />
                Ver historial
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Removed regenerate modals - feature not part of business model */}
    </>
  );
}
