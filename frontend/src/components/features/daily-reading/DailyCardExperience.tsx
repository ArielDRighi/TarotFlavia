'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, History, RefreshCw, Sparkles } from 'lucide-react';
import { isAxiosError, AxiosError } from 'axios';
import { ROUTES } from '@/lib/constants/routes';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { TarotCard } from '@/components/features/readings/TarotCard';
import { AnonymousLimitReached } from './AnonymousLimitReached';
import { DailyCardLimitReached } from './DailyCardLimitReached';
import {
  useDailyReadingToday,
  useDailyReading,
  useDailyReadingPublic,
  useRegenerateDailyReading,
} from '@/hooks/api/useDailyReading';
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
 * - Dual flow: anonymous (public endpoint) vs authenticated (protected endpoint)
 * - Anonymous users: See card with DB info only, no AI interpretation
 * - Authenticated users: See card with full interpretation (FREE: DB, PREMIUM: AI)
 * - Smooth flip animation on reveal
 * - Premium regenerate feature with confirmation modal
 * - Share functionality (copy to clipboard)
 * - Navigation to history
 * - Anonymous limit reached state with conversion CTAs
 */
export function DailyCardExperience() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();

  // Fetch today's reading for authenticated users only
  // Anonymous users don't fetch initial data - they generate on click (POST with fingerprint)
  const {
    data: dailyReading,
    isLoading: isFetching,
    error,
  } = useDailyReadingToday({ enabled: isAuthenticated });

  const { mutate: createDailyReading, isPending: isCreating } = useDailyReading();
  const { mutate: createDailyReadingPublic, isPending: isCreatingPublic } = useDailyReadingPublic();
  const { mutate: regenerateReading, isPending: isRegenerating } = useRegenerateDailyReading();

  // Modal state
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Local state for animation
  const [isRevealing, setIsRevealing] = useState(false);
  const [localReading, setLocalReading] = useState<DailyReading | null>(null);
  const [anonymousError, setAnonymousError] = useState<AxiosError | null>(null);
  const [authenticatedError, setAuthenticatedError] = useState<AxiosError | null>(null);

  // Computed values
  const isPremium = user?.plan === 'PREMIUM';
  const currentReading = localReading || dailyReading;
  const isRevealed = Boolean(currentReading);
  const isCreatingReading = isCreating || isCreatingPublic;

  // Check if anonymous user reached limit
  // Anonymous users get 1 daily card per day (tracked by fingerprint)
  // Backend returns 403/409 when limit is reached
  const isAnonymousLimitReached =
    !isAuthenticated &&
    ((isAxiosError(error) && (error.response?.status === 403 || error.response?.status === 409)) ||
      (isAxiosError(anonymousError) &&
        (anonymousError.response?.status === 403 || anonymousError.response?.status === 409)));

  // Check if authenticated user already has today's card
  // Daily card is independent from tarot readings
  // FREE/ANONYMOUS: If you have one today, limit is reached (1 per day)
  // PREMIUM: Can view their daily card multiple times (no limit on views)
  const isAuthenticatedLimitReached =
    isAuthenticated &&
    !isPremium && // Premium users can view their daily card multiple times
    (!!dailyReading || // Already retrieved daily card today
      (isAxiosError(authenticatedError) &&
        (authenticatedError.response?.status === 403 ||
          authenticatedError.response?.status === 409)));

  // Preventive check: Verify daily card limit before allowing creation
  // Uses specific daily card counters (not tarot readings)
  const hasReachedDailyCardLimit = useCallback((): boolean => {
    if (!user || !isAuthenticated) return false;
    if (isPremium) return false; // Premium users don't have hard limits on viewing

    const dailyCardCount = user.dailyCardCount ?? 0;
    const dailyCardLimit = user.dailyCardLimit ?? 1;

    return dailyCardCount >= dailyCardLimit;
  }, [user, isAuthenticated, isPremium]);

  /**
   * Handle card click to create daily reading
   */
  const handleRevealCard = useCallback(async () => {
    if (isCreatingReading || isRevealing || currentReading) return;

    // Preventive check: Don't allow if limit already reached
    if (hasReachedDailyCardLimit()) {
      return;
    }

    setIsRevealing(true);

    if (isAuthenticated) {
      // Authenticated users: call protected endpoint
      createDailyReading(undefined, {
        onSuccess: (data) => {
          setLocalReading(data);
          setAuthenticatedError(null);
          setTimeout(() => setIsRevealing(false), 600);
        },
        onError: (err) => {
          setIsRevealing(false);
          if (isAxiosError(err)) {
            setAuthenticatedError(err);
          }
        },
      });
    } else {
      // Anonymous users: call public endpoint with fingerprint
      const fingerprint = await getSessionFingerprint();
      createDailyReadingPublic(fingerprint, {
        onSuccess: (data) => {
          setLocalReading(data);
          setAnonymousError(null);
          // Mark that anonymous user consumed their daily card (for home page UI)
          try {
            sessionStorage.setItem('tarot_daily_card_consumed', new Date().toISOString());
          } catch {
            // Ignore storage errors
          }
          setTimeout(() => setIsRevealing(false), 600);
        },
        onError: (err) => {
          setIsRevealing(false);
          if (isAxiosError(err)) {
            setAnonymousError(err);
          }
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
    hasReachedDailyCardLimit,
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

  /**
   * Handle regenerate button click
   */
  const handleRegenerateClick = useCallback(() => {
    if (isPremium) {
      setShowConfirmModal(true);
    } else {
      setShowPremiumModal(true);
    }
  }, [isPremium]);

  /**
   * Handle confirmed regeneration (premium users)
   */
  const handleConfirmRegenerate = useCallback(() => {
    setShowConfirmModal(false);
    regenerateReading(undefined, {
      onSuccess: (data) => {
        setLocalReading(data);
      },
    });
  }, [regenerateReading]);

  // Show AnonymousLimitReached when anonymous user reached limit (403)
  if (isAnonymousLimitReached) {
    return (
      <div className="flex w-full justify-center">
        <AnonymousLimitReached />
      </div>
    );
  }

  // Show DailyCardLimitReached when authenticated user already has today's card (403/409)
  if (isAuthenticatedLimitReached) {
    return (
      <div className="flex w-full justify-center">
        <DailyCardLimitReached />
      </div>
    );
  }

  // Show skeleton while fetching daily reading
  if (isFetching) {
    return (
      <div className="flex flex-col items-center gap-8" aria-label="Cargando carta del día">
        <Skeleton data-testid="loading-skeleton" className="h-12 w-64" />
        <Skeleton className="h-72 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full max-w-lg" />
      </div>
    );
  }

  // Show error state (but not for 403 anonymous, already handled above)
  if (error && !isAnonymousLimitReached) {
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
            className={cn(
              'transition-transform duration-300',
              !isCreatingReading && !isRevealing && 'animate-bounce-slow hover:scale-105'
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

              <Button
                variant="secondary"
                onClick={handleRegenerateClick}
                disabled={isRegenerating}
                aria-label="Regenerar carta"
              >
                <RefreshCw className={cn('h-4 w-4', isRegenerating && 'animate-spin')} />
                Regenerar
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Premium Upgrade Modal */}
      <Dialog open={showPremiumModal} onOpenChange={setShowPremiumModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Actualiza a Premium</DialogTitle>
            <DialogDescription>
              La función de regenerar la carta del día está disponible solo para usuarios Premium.
              Actualiza tu plan para disfrutar de esta y otras funciones exclusivas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPremiumModal(false)}>
              Cancelar
            </Button>
            <Button onClick={() => router.push('/perfil')}>Ver planes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Regenerate Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Regenerar carta del día?</DialogTitle>
            <DialogDescription>
              Se generará una nueva carta e interpretación. Esta acción reemplazará tu carta actual.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmRegenerate} disabled={isRegenerating}>
              {isRegenerating ? 'Regenerando...' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
