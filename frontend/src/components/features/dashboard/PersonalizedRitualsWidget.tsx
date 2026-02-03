'use client';

import { Sparkles, Heart, DollarSign, Shield, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useRitualRecommendations } from '@/hooks/api/useRitualRecommendations';
import { useAuthStore } from '@/stores/authStore';
import Link from 'next/link';
import type { RecommendationPattern } from '@/types';

const PATTERN_ICONS: Record<RecommendationPattern, React.ComponentType<{ className?: string }>> = {
  heartbreak: Heart,
  material_block: DollarSign,
  success: Sparkles,
  obsession: Brain,
  protection: Shield,
};

/**
 * Skeleton loading state for PersonalizedRitualsWidget
 */
function PersonalizedRitualsSkeleton() {
  return (
    <Card className="p-6" data-testid="personalized-rituals-skeleton">
      <div className="mb-4 flex items-center gap-3">
        <Skeleton className="h-6 w-6 rounded-full" />
        <Skeleton className="h-6 w-48" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-24 w-full rounded-lg" />
      </div>
    </Card>
  );
}

/**
 * Widget de recomendaciones personalizadas de rituales (Premium)
 *
 * Muestra sugerencias de rituales basadas en el análisis de patrones
 * detectados en las lecturas del usuario.
 *
 * Comportamiento:
 * - Usuario Free: Muestra upsell a Premium
 * - Usuario Premium sin datos: Mensaje de onboarding
 * - Usuario Premium con datos: Muestra top 2 recomendaciones
 *
 * @example
 * ```tsx
 * // En UserDashboard.tsx
 * <PersonalizedRitualsWidget />
 * ```
 */
export function PersonalizedRitualsWidget() {
  const { user } = useAuthStore();
  const isPremium = user?.plan === 'premium';
  const { data, isLoading, isError } = useRitualRecommendations();

  // Free user: Show upsell
  if (!isPremium) {
    return (
      <Card
        className="bg-gradient-to-br from-purple-500/5 to-amber-500/5 p-6"
        data-testid="personalized-rituals-widget"
      >
        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-amber-500" />
          <h2 className="font-serif text-xl">Rituales Recomendados para Ti</h2>
        </div>
        <p className="text-muted-foreground mb-4 text-sm">
          Con Premium, analizamos tus lecturas para sugerirte rituales personalizados según tu
          momento energético actual.
        </p>
        <Button asChild>
          <Link href="/premium">Desbloquear recomendaciones</Link>
        </Button>
      </Card>
    );
  }

  // Loading state
  if (isLoading) {
    return <PersonalizedRitualsSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <Card className="p-6" data-testid="personalized-rituals-widget">
        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h2 className="font-serif text-xl">Rituales para Ti</h2>
        </div>
        <p className="text-sm text-red-600">
          Error al cargar recomendaciones. Inténtalo de nuevo más tarde.
        </p>
      </Card>
    );
  }

  // No recommendations available
  if (!data?.hasRecommendations) {
    return (
      <Card className="p-6" data-testid="personalized-rituals-widget">
        <div className="mb-4 flex items-center gap-3">
          <Sparkles className="h-6 w-6 text-purple-500" />
          <h2 className="font-serif text-xl">Rituales para Ti</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Realiza algunas lecturas más para que podamos analizar tu energía y recomendarte rituales
          personalizados.
        </p>
      </Card>
    );
  }

  // Show recommendations
  return (
    <Card className="p-6" data-testid="personalized-rituals-widget">
      <div className="mb-4 flex items-center gap-3">
        <Sparkles className="h-6 w-6 text-purple-500" />
        <h2 className="font-serif text-xl">Recomendado para Ti</h2>
      </div>

      <div className="space-y-4">
        {data.recommendations.slice(0, 2).map((rec) => {
          const Icon = PATTERN_ICONS[rec.pattern] || Sparkles;

          return (
            <div
              key={rec.pattern}
              className="rounded-lg bg-gradient-to-r from-purple-500/10 to-transparent p-4"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-purple-500/20 p-2">
                  <Icon className="h-5 w-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-muted-foreground mb-2 text-sm">{rec.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {rec.suggestedCategories.map((cat) => (
                      <Link key={cat} href={`/rituales?category=${cat}`}>
                        <Button variant="outline" size="sm">
                          Ver rituales de {cat}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
