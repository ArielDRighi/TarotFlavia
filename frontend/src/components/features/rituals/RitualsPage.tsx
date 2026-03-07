'use client';

import { useState, useCallback } from 'react';
import {
  RitualGrid,
  RitualCategorySelector,
  RitualDifficultyFilter,
  RitualsSkeleton,
} from '@/components/features/rituals';
import { SearchBar } from '@/components/ui/search-bar';
import { useRituals, useFeaturedRituals, useRitualCategories } from '@/hooks/api/useRituals';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/button';
import { History } from 'lucide-react';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { EncyclopediaInfoWidget } from '@/components/features/encyclopedia';
import type { RitualCategory, RitualDifficulty, RitualFilters } from '@/types/ritual.types';

export function RitualsPage() {
  const { isAuthenticated } = useAuthStore();
  const [filters, setFilters] = useState<RitualFilters>({});

  const { data: categoriesRaw } = useRitualCategories();
  const { data: featured, isLoading: loadingFeatured } = useFeaturedRituals();
  const { data: rituals, isLoading: loadingRituals } = useRituals(filters);

  // Cast categories to correct type
  const categories = categoriesRaw?.map((c) => ({
    category: c.category as RitualCategory,
    count: c.count,
  }));

  const hasFilters = filters.category || filters.difficulty || filters.search;

  const handleCategoryChange = (category: RitualCategory | undefined) => {
    setFilters((prev) => ({ ...prev, category }));
  };

  const handleDifficultyChange = (difficulty: RitualDifficulty | undefined) => {
    setFilters((prev) => ({ ...prev, difficulty }));
  };

  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="mb-2 font-serif text-4xl">Rituales</h1>
          <p className="text-muted-foreground">Guías paso a paso para tu práctica espiritual</p>
        </div>
        {isAuthenticated && (
          <Button variant="outline" asChild>
            <Link href={ROUTES.RITUALES_HISTORIAL}>
              <History className="mr-2 h-4 w-4" />
              Mi Historial
            </Link>
          </Button>
        )}
      </div>

      <EncyclopediaInfoWidget
        slug="guia-rituales"
        href={ROUTES.ENCICLOPEDIA_CARD('guia-rituales')}
        className="mb-6"
      />

      {/* Rituales destacados */}
      {!hasFilters && (
        <section className="mb-12">
          <h2 className="mb-4 font-serif text-2xl">Destacados para esta fase lunar</h2>
          {loadingFeatured ? (
            <RitualsSkeleton count={3} />
          ) : featured && featured.length > 0 ? (
            <RitualGrid rituals={featured.slice(0, 3)} />
          ) : null}
        </section>
      )}

      {/* Filtros */}
      <div className="mb-8 space-y-4">
        <RitualCategorySelector
          selected={filters.category}
          onSelect={handleCategoryChange}
          categories={categories}
        />

        <div className="flex flex-col gap-4 sm:flex-row">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Buscar ritual..."
            className="max-w-md flex-1"
          />
          <RitualDifficultyFilter value={filters.difficulty} onChange={handleDifficultyChange} />
        </div>
      </div>

      {/* Lista de rituales */}
      <section>
        <h2 className="mb-4 font-serif text-2xl">
          {hasFilters ? 'Resultados' : 'Todos los Rituales'}
        </h2>
        {loadingRituals ? (
          <RitualsSkeleton />
        ) : (
          <RitualGrid
            rituals={rituals || []}
            emptyMessage="No se encontraron rituales con estos filtros"
          />
        )}
      </section>
    </div>
  );
}
