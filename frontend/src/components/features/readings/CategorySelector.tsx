'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Heart,
  Briefcase,
  DollarSign,
  Activity,
  Sparkles,
  Star,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';

import { useCategories } from '@/hooks/api/useReadings';
import { useUserCapabilities } from '@/hooks/api/useUserCapabilities';
import { ROUTES } from '@/lib/constants/routes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ErrorDisplay } from '@/components/ui/error-display';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';
import type { Category } from '@/types';

/**
 * Icon mapping for categories based on slug
 * Matches backend slugs: amor-relaciones, carrera-trabajo, dinero-finanzas, etc.
 */
const categoryIcons: Record<string, LucideIcon> = {
  'amor-relaciones': Heart,
  'carrera-trabajo': Briefcase,
  'dinero-finanzas': DollarSign,
  'salud-bienestar': Activity,
  'crecimiento-espiritual': Sparkles,
  'consulta-general': Star,
};

/**
 * Background color mapping for categories based on slug
 */
const categoryColors: Record<string, string> = {
  'amor-relaciones': 'bg-pink-100',
  'carrera-trabajo': 'bg-blue-100',
  'dinero-finanzas': 'bg-green-100',
  'salud-bienestar': 'bg-orange-100',
  'crecimiento-espiritual': 'bg-purple-100',
  'consulta-general': 'bg-yellow-100',
};

/**
 * Icon color mapping for categories based on slug
 */
const categoryIconColors: Record<string, string> = {
  'amor-relaciones': 'text-pink-500',
  'carrera-trabajo': 'text-blue-500',
  'dinero-finanzas': 'text-green-500',
  'salud-bienestar': 'text-orange-500',
  'crecimiento-espiritual': 'text-purple-500',
  'consulta-general': 'text-yellow-500',
};

/**
 * Skeleton card for loading state
 */
function SkeletonCategoryCard() {
  return (
    <div data-testid="skeleton-card" className="bg-card animate-pulse rounded-lg border p-6">
      <div className="flex flex-col items-center gap-4">
        <div className="h-16 w-16 rounded-full bg-gray-200" />
        <div className="h-6 w-24 rounded bg-gray-200" />
      </div>
    </div>
  );
}

/**
 * Category card component
 */
interface CategoryCardProps {
  category: Category;
  onClick: () => void;
}

function CategoryCard({ category, onClick }: CategoryCardProps) {
  const Icon = categoryIcons[category.slug] || Star;
  const bgColor = categoryColors[category.slug] || 'bg-gray-100';
  const iconColor = categoryIconColors[category.slug] || 'text-gray-500';

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <Card
      data-testid="category-card"
      className={cn(
        'cursor-pointer transition-all duration-300',
        'hover:scale-105 hover:shadow-lg',
        'border-secondary/20 hover:border-secondary'
      )}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`Seleccionar categoría ${category.name}`}
    >
      <CardContent className="flex flex-col items-center gap-4 p-6">
        <div className={cn('rounded-full p-4', bgColor)}>
          <Icon className={cn('h-10 w-10', iconColor)} aria-hidden="true" />
        </div>
        <span className="font-serif text-lg font-medium">{category.name}</span>
      </CardContent>
    </Card>
  );
}

/**
 * Banner shown to FREE users inviting them to upgrade to Premium.
 */
function FreeUpgradeBanner() {
  const router = useRouter();

  return (
    <div
      data-testid="free-upgrade-banner"
      className="border-secondary/30 bg-secondary/5 mt-6 flex flex-col items-center gap-3 rounded-lg border p-4 text-center"
    >
      <p className="text-muted-foreground text-sm">¿Querés más categorías? Actualizá a Premium.</p>
      <Button
        variant="outline"
        size="sm"
        onClick={() => router.push(ROUTES.PREMIUM)}
        className="gap-2"
      >
        Ver Premium
        <ArrowRight className="h-4 w-4" aria-hidden="true" />
      </Button>
    </div>
  );
}

// ============================================================================
// Props
// ============================================================================

interface CategorySelectorProps {
  /**
   * When provided, activates FREE mode: only categories whose slug is in this
   * array are displayed, and clicking a category navigates directly to
   * /tarot/tirada (skipping the questions step).
   *
   * Set to the 3 allowed FREE slugs: ['amor-relaciones', 'salud-bienestar', 'dinero-finanzas']
   */
  freeModeCategories?: string[];
}

/**
 * Category Selector Component
 *
 * Displays categories in a responsive grid with icons and hover effects.
 * Uses capabilities system to control access based on user plan.
 *
 * ACCESS CONTROL:
 * - PREMIUM users see the full category list and go to /tarot/preguntas on click
 * - FREE users: pass freeModeCategories to show only 3 categories and route
 *   directly to /tarot/tirada (no questions step)
 * - Users who reached their tarot reading limit are redirected to home
 *
 * REFACTORED:
 * - Uses useUserCapabilities() as single source of truth (TASK-REFACTOR-007)
 * - Replaced direct user.plan checks with capabilities.canUseCustomQuestions
 * - Added limit validation to prevent poor UX (TASK-REFACTOR-011)
 * - Added freeModeCategories prop for FREE plan support (T-FR-F01)
 */
export function CategorySelector({ freeModeCategories }: CategorySelectorProps = {}) {
  const { data: capabilities, isLoading: isLoadingCapabilities } = useUserCapabilities();
  const { data: categories, isLoading: isCategoriesLoading, error, refetch } = useCategories();
  const router = useRouter();

  const isLoading = isLoadingCapabilities || isCategoriesLoading;
  const canUseCustomQuestions = capabilities?.canUseCustomQuestions ?? false;
  const canCreateTarotReading = capabilities?.canCreateTarotReading ?? false;

  // Determine if FREE mode is active via the prop
  const isFreeMode = freeModeCategories !== undefined && freeModeCategories.length > 0;

  // Redirect to home if user reached tarot reading limit
  useEffect(() => {
    if (!canCreateTarotReading && !isLoading) {
      router.replace('/');
    }
  }, [canCreateTarotReading, isLoading, router]);

  // Redirect FREE/ANONYMOUS users to spread selector ONLY when not in free mode
  // (i.e. when CategorySelector is used without freeModeCategories prop — legacy behavior)
  useEffect(() => {
    if (!isFreeMode && !canUseCustomQuestions && !isLoading && canCreateTarotReading) {
      router.replace(ROUTES.TAROT_TIRADA);
    }
  }, [isFreeMode, canUseCustomQuestions, isLoading, canCreateTarotReading, router]);

  // Show loading state while checking capabilities
  if (isLoading) {
    return (
      <div className="bg-bg-main min-h-screen p-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-8 text-center font-serif text-3xl md:text-4xl">
            ¿Qué inquieta tu alma hoy?
          </h1>
          <div
            data-testid="categories-grid"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCategoryCard key={index} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // In FREE mode, do NOT gate on canUseCustomQuestions — the selector is always shown
  // In standard mode, guard against non-PREMIUM access
  if (!isFreeMode && (!canUseCustomQuestions || !canCreateTarotReading)) {
    return null;
  }

  // In FREE mode, also check that the user can still create readings
  if (isFreeMode && !canCreateTarotReading) {
    return null;
  }

  // Filter categories to only allowed slugs when in FREE mode
  const visibleCategories = isFreeMode
    ? (categories ?? []).filter((cat) => (freeModeCategories ?? []).includes(cat.slug))
    : (categories ?? []);

  const handleCategoryClick = (categoryId: number) => {
    if (isFreeMode) {
      // FREE mode: skip questions, go directly to tirada
      router.push(ROUTES.TAROT_TIRADA_BY_CATEGORY(categoryId));
    } else {
      // PREMIUM mode: go to questions first
      router.push(ROUTES.TAROT_PREGUNTAS_BY_CATEGORY(categoryId));
    }
  };

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center font-serif text-3xl md:text-4xl">
          ¿Qué inquieta tu alma hoy?
        </h1>

        {/* Error State */}
        {error && (
          <ErrorDisplay
            message="Error al cargar las categorías. Por favor, intenta de nuevo."
            onRetry={refetch}
          />
        )}

        {/* Empty State */}
        {!error && visibleCategories.length === 0 && (
          <EmptyState
            icon={<Star />}
            title="Sin categorías"
            message="No hay categorías disponibles en este momento."
          />
        )}

        {/* Categories Grid */}
        {!error && visibleCategories.length > 0 && (
          <div
            data-testid="categories-grid"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {visibleCategories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        )}

        {/* FREE mode upgrade banner */}
        {isFreeMode && <FreeUpgradeBanner />}
      </div>
    </div>
  );
}
