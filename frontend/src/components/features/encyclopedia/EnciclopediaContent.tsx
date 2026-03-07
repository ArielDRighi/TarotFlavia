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
 *
 * State design:
 * - `inputValue`: controlled value for the search input (updates on every keystroke)
 * - `searchQuery`: debounced query used for API calls (updated only via onSearch callback)
 * This separation ensures the debounce in EncyclopediaSearchBar is actually effective.
 */
export function EnciclopediaContent() {
  const [selectedCategory, setSelectedCategory] = useState<ArcanaType | undefined>(undefined);
  const [selectedSuit, setSelectedSuit] = useState<Suit | null>(null);
  // inputValue: controlled input state (immediate, no debounce)
  const [inputValue, setInputValue] = useState('');
  // searchQuery: debounced API query state (updated only by onSearch callback)
  const [searchQuery, setSearchQuery] = useState('');

  // ─── Queries ─────────────────────────────────────────────────────────────

  const allCards = useCards();
  const majorCards = useMajorArcana();
  const suitCards = useCardsBySuit(selectedSuit ?? Suit.WANDS);
  const searchResults = useSearchCards(searchQuery);

  // ─── Derived state ───────────────────────────────────────────────────────

  // isSearching is based on inputValue (for UI: hide tabs immediately while typing)
  const isSearching = inputValue.length >= 2;
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
    setInputValue('');
    setSearchQuery('');
  };

  // onSearch is called by EncyclopediaSearchBar after debounce — updates the API query
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
          value={inputValue}
          onChange={setInputValue}
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

      {/* Search result count — hidden while loading to avoid "0 resultados" flash */}
      {isSearching && !isLoading && (
        <p className="text-muted-foreground mb-4 text-sm">
          {cards.length} resultado{cards.length !== 1 ? 's' : ''} para &ldquo;{inputValue}&rdquo;
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
