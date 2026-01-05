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
  type LucideIcon,
} from 'lucide-react';

import { useRequireAuth } from '@/hooks/useRequireAuth';
import { useAuth } from '@/hooks/useAuth';
import { useCategories } from '@/hooks/api/useReadings';
import { Card, CardContent } from '@/components/ui/card';
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
 * Ritual Page - Category Selector
 *
 * Protected page where users select a category before proceeding to questions.
 * Displays categories in a responsive grid with icons and hover effects.
 *
 * AUTHENTICATION REQUIRED:
 * - Redirects to /registro with message=register-for-readings if not authenticated
 *
 * PLAN-BASED BEHAVIOR:
 * - FREE users: Automatically redirected to /ritual/tirada (no category selection)
 * - PREMIUM users: Select category first, then proceed to questions
 */
export default function RitualPage() {
  const { isLoading: isAuthLoading } = useRequireAuth({
    redirectTo: '/registro',
    redirectQuery: { message: 'register-for-readings' },
  });
  const { user } = useAuth();
  const { data: categories, isLoading: isCategoriesLoading, error, refetch } = useCategories();
  const router = useRouter();

  const isLoading = isAuthLoading || isCategoriesLoading;

  // TASK-2: Redirect FREE users to /ritual/tirada (skip category selection)
  useEffect(() => {
    if (user && user.plan.toLowerCase() === 'free') {
      router.push('/ritual/tirada');
    }
  }, [user, router]);

  const handleCategoryClick = (categoryId: number) => {
    router.push(`/ritual/preguntas?categoryId=${categoryId}`);
  };

  return (
    <div className="bg-bg-main min-h-screen p-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-center font-serif text-3xl md:text-4xl">
          ¿Qué inquieta tu alma hoy?
        </h1>

        {/* Loading State */}
        {isLoading && (
          <div
            data-testid="categories-grid"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, index) => (
              <SkeletonCategoryCard key={index} />
            ))}
          </div>
        )}

        {/* Error State */}
        {!isLoading && error && (
          <ErrorDisplay
            message="Error al cargar las categorías. Por favor, intenta de nuevo."
            onRetry={refetch}
          />
        )}

        {/* Empty State */}
        {!isLoading && !error && categories?.length === 0 && (
          <EmptyState
            icon={<Star />}
            title="Sin categorías"
            message="No hay categorías disponibles en este momento."
          />
        )}

        {/* Categories Grid */}
        {!isLoading && !error && categories && categories.length > 0 && (
          <div
            data-testid="categories-grid"
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {categories.map((category) => (
              <CategoryCard
                key={category.id}
                category={category}
                onClick={() => handleCategoryClick(category.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
