'use client';

import { useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Clock, Layers } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useMyAvailableSpreads } from '@/hooks/api/useReadings';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorDisplay } from '@/components/ui/error-display';
import { ReadingLimitReached } from '@/components/features/readings/ReadingLimitReached';
import { cn } from '@/lib/utils';
import type { Spread } from '@/types';

/**
 * Skeleton card for loading state
 */
function SkeletonSpreadCard() {
  return (
    <div data-testid="skeleton-spread-card" className="bg-card animate-pulse rounded-lg border p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-6 w-32 rounded bg-gray-200" />
        <div className="h-6 w-20 rounded bg-gray-200" />
      </div>
      <div className="mb-4 space-y-2">
        <div className="h-4 w-full rounded bg-gray-200" />
        <div className="h-4 w-2/3 rounded bg-gray-200" />
      </div>
      <div className="mb-4 flex items-center gap-4">
        <div className="h-4 w-16 rounded bg-gray-200" />
        <div className="h-4 w-16 rounded bg-gray-200" />
      </div>
      <div className="h-10 w-full rounded bg-gray-200" />
    </div>
  );
}

/**
 * Get difficulty label in Spanish
 */
function getDifficultyLabel(difficulty: Spread['difficulty']): string {
  const labels: Record<Spread['difficulty'], string> = {
    beginner: 'Principiante',
    intermediate: 'Intermedio',
    advanced: 'Avanzado',
  };
  return labels[difficulty];
}

/**
 * Get difficulty badge variant
 */
function getDifficultyVariant(
  difficulty: Spread['difficulty']
): 'default' | 'secondary' | 'destructive' | 'outline' {
  const variants: Record<
    Spread['difficulty'],
    'default' | 'secondary' | 'destructive' | 'outline'
  > = {
    beginner: 'default',
    intermediate: 'secondary',
    advanced: 'destructive',
  };
  return variants[difficulty];
}

/**
 * Get estimated reading time based on card count
 * Expected spread sizes: 1, 3, 5, 10 cards
 * Fallback uses 2 min per card for any unexpected sizes
 */
function getEstimatedTime(cardsCount: number): string {
  const timeMap: Record<number, string> = {
    1: '~2 min',
    3: '~5 min',
    5: '~10 min',
    10: '~20 min',
  };
  return timeMap[cardsCount] || `~${cardsCount * 2} min`;
}

/**
 * Spread card component
 */
interface SpreadCardProps {
  spread: Spread;
  onSelect: () => void;
}

function SpreadCard({ spread, onSelect }: SpreadCardProps) {
  return (
    <Card
      data-testid="spread-card"
      className={cn(
        'flex flex-col transition-all duration-300',
        'hover:border-primary/50 hover:shadow-lg'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="font-serif text-xl">{spread.name}</CardTitle>
          <Badge variant={getDifficultyVariant(spread.difficulty)}>
            {getDifficultyLabel(spread.difficulty)}
          </Badge>
        </div>
        <CardDescription className="text-text-muted">{spread.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col justify-between">
        <div className="mb-4 flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Layers className="h-4 w-4" aria-hidden="true" />
            <span>
              {spread.cardCount} {spread.cardCount === 1 ? 'carta' : 'cartas'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{getEstimatedTime(spread.cardCount)}</span>
          </div>
        </div>

        <Button onClick={onSelect} className="w-full">
          Seleccionar
        </Button>
      </CardContent>
    </Card>
  );
}

/**
 * Props for SpreadSelector component
 */
export interface SpreadSelectorProps {
  /** Category ID from URL params */
  categoryId: string | null;
  /** Question ID from URL params (for predefined questions) */
  questionId: string | null;
  /** Custom question from URL params (for premium users) */
  customQuestion: string | null;
}

/**
 * SpreadSelector Component
 *
 * Protected component where users select a spread type for their reading.
 * Shows available spreads with their details and validates user limits.
 */
export function SpreadSelector({ categoryId, questionId, customQuestion }: SpreadSelectorProps) {
  const router = useRouter();

  const { isLoading: isAuthLoading } = useRequireAuth();

  // ✅ NEW: Use capabilities hook (single source of truth)
  const { data: capabilities, isLoading: isLoadingCapabilities } = useUserCapabilities();

  // Use different endpoint based on authentication status
  // For authenticated users, backend filters spreads based on their plan
  const {
    data: spreads,
    isLoading: isSpreadsLoading,
    error: spreadsError,
    refetch,
  } = useMyAvailableSpreads();

  // ✅ Move calculations and hooks BEFORE any conditional returns
  const isLoading = isAuthLoading || isSpreadsLoading || isLoadingCapabilities;
  const hasQuestion = Boolean(questionId || customQuestion);

  // ✅ NEW: Simple check using capabilities
  const canCreateTarotReading = capabilities?.canCreateTarotReading ?? false;
  const isPremium = capabilities?.plan === 'premium';

  // ✅ Define callback BEFORE conditional return (hooks must be called in same order)
  const handleSpreadSelect = useCallback(
    (spreadId: number) => {
      // Build navigation URL
      let url = `/ritual/lectura?spreadId=${spreadId}`;

      // Only add question params for PREMIUM users
      if (isPremium) {
        // Add categoryId if present
        if (categoryId) {
          url += `&categoryId=${categoryId}`;
        }
        // Add questionId or customQuestion if present
        if (questionId) {
          url += `&questionId=${questionId}`;
        } else if (customQuestion) {
          url += `&customQuestion=${encodeURIComponent(customQuestion)}`;
        }
      }

      router.push(url);
    },
    [categoryId, questionId, customQuestion, router, isPremium]
  );

  // ✅ NEW: Show limit message immediately if limit reached
  if (!canCreateTarotReading && !isLoading) {
    return (
      <div className="bg-bg-main flex min-h-screen items-center justify-center p-8">
        <ReadingLimitReached />
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-text-muted mb-6 flex items-center gap-2 text-sm">
          <Link href="/ritual" className="hover:text-primary transition-colors">
            Ritual
          </Link>
          {/* Show question step only for PREMIUM users */}
          {isPremium && hasQuestion && (
            <>
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
              <Link
                href={
                  categoryId ? `/ritual/preguntas?categoryId=${categoryId}` : '/ritual/preguntas'
                }
                className="hover:text-primary transition-colors"
              >
                Pregunta
              </Link>
            </>
          )}
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <span className="text-text-primary">Tipo de Tirada</span>
        </nav>

        {/* Title */}
        <h1 className="mb-8 text-center font-serif text-3xl md:text-4xl">
          Elige tu tipo de consulta
        </h1>

        {/* Loading State */}
        {isLoading && (
          <div data-testid="spreads-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <SkeletonSpreadCard key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && spreadsError && (
          <ErrorDisplay
            message="Error al cargar las tiradas. Por favor, intenta de nuevo."
            onRetry={refetch}
          />
        )}

        {/* Spreads Grid */}
        {!isLoading && !spreadsError && spreads && (
          <div data-testid="spreads-grid" className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {spreads.map((spread) => (
              <SpreadCard
                key={spread.id}
                spread={spread}
                onSelect={() => handleSpreadSelect(spread.id)}
              />
            ))}
          </div>
        )}
      </div>
      {/* ❌ REMOVED: Daily Limit Modal - replaced with full ReadingLimitReached component */}
    </div>
  );
}
