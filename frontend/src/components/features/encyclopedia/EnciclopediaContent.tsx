'use client';

import { useState, useCallback } from 'react';

import {
  CardGrid,
  CategoryTabs,
  SuitSelector,
  EncyclopediaSearchBar,
} from '@/components/features/encyclopedia';
import {
  useCards,
  useMajorArcana,
  useCardsBySuit,
  useSearchCards,
} from '@/hooks/api/useEncyclopedia';
import { ArcanaType, Suit } from '@/types/encyclopedia.types';

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * EnciclopediaContent
 *
 * Feature component that encapsulates all encyclopedia page logic:
 * - Category filtering (all / major arcana / minor arcana)
 * - Suit filtering within minor arcana
 * - Card search with debounce
 * - Card grid display
 */
export function EnciclopediaContent() {
  const [selectedCategory, setSelectedCategory] = useState<ArcanaType | undefined>(undefined);
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Queries ─────────────────────────────────────────────────────────────

  const allCards = useCards();
  const majorCards = useMajorArcana();
  const suitCards = useCardsBySuit(selectedSuit ?? Suit.WANDS);
  const searchResults = useSearchCards(searchQuery);

  // ─── Derived state ───────────────────────────────────────────────────────

  const isSearching = searchQuery.length >= 2;
  const showSuitSelector = selectedCategory === ArcanaType.MINOR && !isSearching;

  const getDisplayData = () => {
    if (isSearching) {
      return {
        cards: searchResults.data ?? [],
        isLoading: searchResults.isLoading,
      };
    }

    if (selectedCategory === ArcanaType.MAJOR) {
      return {
        cards: majorCards.data ?? [],
        isLoading: majorCards.isLoading,
      };
    }

    if (selectedCategory === ArcanaType.MINOR) {
      if (selectedSuit) {
        return {
          cards: suitCards.data ?? [],
          isLoading: suitCards.isLoading,
        };
      }
      return {
        cards: (allCards.data ?? []).filter((c) => c.arcanaType === ArcanaType.MINOR),
        isLoading: allCards.isLoading,
      };
    }

    // Default: all cards
    return {
      cards: allCards.data ?? [],
      isLoading: allCards.isLoading,
    };
  };

  const { cards, isLoading } = getDisplayData();

  // ─── Handlers ────────────────────────────────────────────────────────────

  const handleCategoryChange = (arcanaType: ArcanaType | undefined) => {
    setSelectedCategory(arcanaType);
    setSelectedSuit(null);
    setSearchQuery('');
  };

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="mb-2 font-serif text-4xl">Enciclopedia del Tarot</h1>
        <p className="text-muted-foreground">Explora las 78 cartas y descubre sus significados</p>
      </div>

      {/* Controls */}
      <div className="mb-8 space-y-4">
        <EncyclopediaSearchBar
          onSearch={handleSearch}
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Buscar carta por nombre..."
          className="mx-auto max-w-md"
        />

        {!isSearching && (
          <>
            <CategoryTabs
              selected={selectedCategory}
              onChange={handleCategoryChange}
              className="mx-auto max-w-md"
            />

            {showSuitSelector && (
              <div className="flex justify-center">
                <SuitSelector
                  selected={selectedSuit ?? undefined}
                  onSelect={(suit) => setSelectedSuit(suit ?? null)}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Search result count */}
      {isSearching && (
        <p className="text-muted-foreground mb-4 text-sm">
          {cards.length} resultado{cards.length !== 1 ? 's' : ''} para &ldquo;{searchQuery}&rdquo;
        </p>
      )}

      {/* Card grid */}
      <CardGrid
        cards={cards}
        isLoading={isLoading}
        emptyMessage={isSearching ? 'No se encontraron cartas' : 'No hay cartas para mostrar'}
      />
    </div>
  );
}
