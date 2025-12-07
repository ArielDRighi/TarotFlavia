'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Clock, Layers, Sparkles } from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useSpreads } from '@/hooks/api/useReadings';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ErrorDisplay } from '@/components/ui/error-display';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
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
              {spread.cardsCount} {spread.cardsCount === 1 ? 'carta' : 'cartas'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" aria-hidden="true" />
            <span>{getEstimatedTime(spread.cardsCount)}</span>
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
  const { user } = useAuthStore();
  const { data: spreads, isLoading: isSpreadsLoading, error: spreadsError, refetch } = useSpreads();

  const [showLimitModal, setShowLimitModal] = useState(false);

  const isLoading = isAuthLoading || isSpreadsLoading;
  const hasQuestion = Boolean(questionId || customQuestion);

  // Check if user has reached daily limit
  const hasReachedLimit = useCallback((): boolean => {
    if (!user) return false;
    if (user.plan === 'PREMIUM') return false;

    const dailyCount = (user as { dailyReadingsCount?: number }).dailyReadingsCount ?? 0;
    const dailyLimit = (user as { dailyReadingsLimit?: number }).dailyReadingsLimit ?? 3;

    return dailyCount >= dailyLimit;
  }, [user]);

  const handleSpreadSelect = useCallback(
    (spreadId: number) => {
      // Check daily limit
      if (hasReachedLimit()) {
        setShowLimitModal(true);
        return;
      }

      // Build navigation URL
      let url = `/ritual/lectura?spreadId=${spreadId}`;

      if (questionId) {
        url += `&questionId=${questionId}`;
      } else if (customQuestion) {
        url += `&customQuestion=${encodeURIComponent(customQuestion)}`;
      }

      router.push(url);
    },
    [questionId, customQuestion, router, hasReachedLimit]
  );

  const handleBackToQuestions = useCallback(() => {
    router.push(`/ritual/preguntas?categoryId=${categoryId}`);
  }, [router, categoryId]);

  const handleCloseLimitModal = useCallback(() => {
    setShowLimitModal(false);
  }, []);

  // Handle missing question
  if (!hasQuestion && !isLoading) {
    return (
      <div className="bg-bg-main min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <ErrorDisplay
            message="Selecciona una pregunta primero."
            onRetry={handleBackToQuestions}
          />
          <div className="mt-4 text-center">
            <Button onClick={handleBackToQuestions}>Volver a preguntas</Button>
          </div>
        </div>
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
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
          <Link
            href={`/ritual/preguntas?categoryId=${categoryId}`}
            className="hover:text-primary transition-colors"
          >
            Pregunta
          </Link>
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

      {/* Daily Limit Modal */}
      <Dialog open={showLimitModal} onOpenChange={setShowLimitModal}>
        <DialogContent>
          <DialogHeader>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100">
              <Sparkles className="h-6 w-6 text-yellow-600" aria-hidden="true" />
            </div>
            <DialogTitle className="text-center">Has alcanzado tu límite</DialogTitle>
            <DialogDescription className="text-center">
              Has alcanzado el límite diario de lecturas gratuitas. Actualiza a Premium para
              lecturas ilimitadas y acceso a preguntas personalizadas.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col gap-2 sm:flex-col">
            <Button className="w-full" onClick={() => router.push('/perfil/upgrade')}>
              Actualiza a Premium
            </Button>
            <Button variant="outline" className="w-full" onClick={handleCloseLimitModal}>
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
