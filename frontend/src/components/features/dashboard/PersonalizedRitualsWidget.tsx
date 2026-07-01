'use client';

import { Sparkles, Heart, DollarSign, Shield, Brain } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { WidgetCard } from './WidgetCard';
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
      <WidgetCard
        title="Rituales Recomendados para Ti"
        icon={<Sparkles className="h-5 w-5" />}
        className="bg-secondary/5"
        data-testid="personalized-rituals-widget"
      >
        <p className="text-muted-foreground mb-4 text-sm">
          Con Premium, analizamos tus lecturas para sugerirte rituales personalizados según tu
          momento energético actual.
        </p>
        <Button asChild>
          <Link href="/premium">Desbloquear recomendaciones</Link>
        </Button>
      </WidgetCard>
    );
  }

  // Loading state
  if (isLoading) {
    return <PersonalizedRitualsSkeleton />;
  }

  // Error state
  if (isError) {
    return (
      <WidgetCard
        title="Rituales para Ti"
        icon={<Sparkles className="h-5 w-5" />}
        data-testid="personalized-rituals-widget"
      >
        <p className="text-sm text-red-600">
          Error al cargar recomendaciones. Inténtalo de nuevo más tarde.
        </p>
      </WidgetCard>
    );
  }

  // No recommendations available
  if (!data?.hasRecommendations) {
    return (
      <WidgetCard
        title="Rituales para Ti"
        icon={<Sparkles className="h-5 w-5" />}
        data-testid="personalized-rituals-widget"
      >
        <p className="text-muted-foreground text-sm">
          Realiza algunas lecturas más para que podamos analizar tu energía y recomendarte rituales
          personalizados.
        </p>
      </WidgetCard>
    );
  }

  // Show recommendations
  return (
    <WidgetCard
      title="Recomendado para Ti"
      icon={<Sparkles className="h-5 w-5" />}
      data-testid="personalized-rituals-widget"
      contentClassName="space-y-4"
    >
      {data.recommendations.slice(0, 2).map((rec) => {
        const Icon = PATTERN_ICONS[rec.pattern] || Sparkles;

        return (
          <div key={rec.pattern} className="bg-primary/5 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 rounded-full p-2">
                <Icon className="text-primary h-5 w-5" />
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
    </WidgetCard>
  );
}
