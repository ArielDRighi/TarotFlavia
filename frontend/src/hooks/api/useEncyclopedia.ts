/**
 * useEncyclopedia hooks
 *
 * React Query hooks for the Tarot Encyclopedia module.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getCards,
  getMajorArcana,
  getCardsBySuit,
  searchCards,
  getCardBySlug,
  getRelatedCards,
  getCardNavigation,
} from '@/lib/api/encyclopedia-api';
import type { CardDetail, CardFilters, CardSummary, Suit } from '@/types/encyclopedia.types';

const STALE_TIME_STATIC = 1000 * 60 * 60; // 1 hour — static encyclopedia data
const STALE_TIME_SEARCH = 1000 * 60 * 5; // 5 minutes — search results

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const encyclopediaKeys = {
  all: ['encyclopedia'] as const,
  cards: (filters?: CardFilters) => [...encyclopediaKeys.all, 'cards', filters] as const,
  major: () => [...encyclopediaKeys.all, 'major'] as const,
  bySuit: (suit: Suit) => [...encyclopediaKeys.all, 'suit', suit] as const,
  search: (query: string) => [...encyclopediaKeys.all, 'search', query] as const,
  detail: (slug: string) => [...encyclopediaKeys.all, 'detail', slug] as const,
  related: (slug: string) => [...encyclopediaKeys.all, 'related', slug] as const,
  navigation: (slug: string) => [...encyclopediaKeys.all, 'navigation', slug] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

/**
 * @param initialData cartas ya resueltas por la ruta `/enciclopedia/tarot` en el
 *   servidor. Siembra la caché para que el primer render —el HTML que ve
 *   Googlebot— traiga el listado en vez del esqueleto (T-SEO-003). Con
 *   `STALE_TIME_STATIC` no dispara refetch inmediato: el mazo no cambia.
 */
export function useCards(filters?: CardFilters, initialData?: CardSummary[]) {
  return useQuery({
    queryKey: encyclopediaKeys.cards(filters),
    queryFn: () => getCards(filters),
    staleTime: STALE_TIME_STATIC,
    initialData,
  });
}

export function useMajorArcana() {
  return useQuery({
    queryKey: encyclopediaKeys.major(),
    queryFn: getMajorArcana,
    staleTime: STALE_TIME_STATIC,
  });
}

export function useCardsBySuit(suit: Suit) {
  return useQuery({
    queryKey: encyclopediaKeys.bySuit(suit),
    queryFn: () => getCardsBySuit(suit),
    staleTime: STALE_TIME_STATIC,
    enabled: !!suit,
  });
}

export function useSearchCards(query: string) {
  const trimmedQuery = query.trim();

  return useQuery({
    queryKey: encyclopediaKeys.search(trimmedQuery),
    queryFn: () => searchCards(trimmedQuery),
    staleTime: STALE_TIME_SEARCH,
    enabled: trimmedQuery.length >= 2,
  });
}

/**
 * @param initialData carta ya resuelta en el servidor por la ruta
 *   `/enciclopedia/tarot/[slug]`. Siembra la caché para que el primer render
 *   (el HTML que ve Googlebot) traiga la carta en vez del skeleton — ver
 *   `CardDetailPageContent`. Con `STALE_TIME_STATIC` no dispara un refetch
 *   inmediato: la enciclopedia es contenido estático.
 */
export function useCard(slug: string, initialData?: CardDetail) {
  return useQuery({
    queryKey: encyclopediaKeys.detail(slug),
    queryFn: () => getCardBySlug(slug),
    staleTime: STALE_TIME_STATIC,
    enabled: !!slug,
    initialData,
  });
}

export function useRelatedCards(slug: string) {
  return useQuery({
    queryKey: encyclopediaKeys.related(slug),
    queryFn: () => getRelatedCards(slug),
    staleTime: STALE_TIME_STATIC,
    enabled: !!slug,
  });
}

export function useCardNavigation(slug: string) {
  return useQuery({
    queryKey: encyclopediaKeys.navigation(slug),
    queryFn: () => getCardNavigation(slug),
    staleTime: STALE_TIME_STATIC,
    enabled: !!slug,
  });
}
