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
import type { CardFilters } from '@/types/encyclopedia.types';

const STALE_TIME_STATIC = 1000 * 60 * 60; // 1 hour — static encyclopedia data
const STALE_TIME_SEARCH = 1000 * 60 * 5; // 5 minutes — search results

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const encyclopediaKeys = {
  all: ['encyclopedia'] as const,
  cards: (filters?: CardFilters) => [...encyclopediaKeys.all, 'cards', filters] as const,
  major: () => [...encyclopediaKeys.all, 'major'] as const,
  bySuit: (suit: string) => [...encyclopediaKeys.all, 'suit', suit] as const,
  search: (query: string) => [...encyclopediaKeys.all, 'search', query] as const,
  detail: (slug: string) => [...encyclopediaKeys.all, 'detail', slug] as const,
  related: (slug: string) => [...encyclopediaKeys.all, 'related', slug] as const,
  navigation: (slug: string) => [...encyclopediaKeys.all, 'navigation', slug] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useCards(filters?: CardFilters) {
  return useQuery({
    queryKey: encyclopediaKeys.cards(filters),
    queryFn: () => getCards(filters),
    staleTime: STALE_TIME_STATIC,
  });
}

export function useMajorArcana() {
  return useQuery({
    queryKey: encyclopediaKeys.major(),
    queryFn: getMajorArcana,
    staleTime: STALE_TIME_STATIC,
  });
}

export function useCardsBySuit(suit: string) {
  return useQuery({
    queryKey: encyclopediaKeys.bySuit(suit),
    queryFn: () => getCardsBySuit(suit),
    staleTime: STALE_TIME_STATIC,
    enabled: !!suit,
  });
}

export function useSearchCards(query: string) {
  return useQuery({
    queryKey: encyclopediaKeys.search(query),
    queryFn: () => searchCards(query),
    staleTime: STALE_TIME_SEARCH,
    enabled: query.length >= 2,
  });
}

export function useCard(slug: string) {
  return useQuery({
    queryKey: encyclopediaKeys.detail(slug),
    queryFn: () => getCardBySlug(slug),
    staleTime: STALE_TIME_STATIC,
    enabled: !!slug,
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
