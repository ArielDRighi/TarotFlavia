/**
 * useEncyclopediaArticles hooks
 *
 * React Query hooks for the Mystic Encyclopedia articles module.
 */

import { useQuery } from '@tanstack/react-query';
import {
  getArticleSnippet,
  getArticle,
  getArticlesByCategory,
  globalSearch,
} from '@/lib/api/encyclopedia-articles-api';
import type { ArticleCategory } from '@/types/encyclopedia-article.types';

const STALE_TIME_STATIC = 1000 * 60 * 60; // 1 hour — static encyclopedia content

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const articleKeys = {
  snippet: (slug: string) => ['encyclopedia', 'article', 'snippet', slug] as const,
  detail: (slug: string) => ['encyclopedia', 'article', 'detail', slug] as const,
  byCategory: (category: ArticleCategory) =>
    ['encyclopedia', 'articles', 'category', category] as const,
  search: (term: string) => ['encyclopedia', 'search', term] as const,
};

// ─── Hooks ────────────────────────────────────────────────────────────────────

export function useArticleSnippet(slug: string) {
  return useQuery({
    queryKey: articleKeys.snippet(slug),
    queryFn: () => getArticleSnippet(slug),
    staleTime: STALE_TIME_STATIC,
    enabled: !!slug,
  });
}

export function useArticle(slug: string) {
  return useQuery({
    queryKey: articleKeys.detail(slug),
    queryFn: () => getArticle(slug),
    staleTime: STALE_TIME_STATIC,
    enabled: !!slug,
  });
}

export function useArticlesByCategory(category: ArticleCategory) {
  return useQuery({
    queryKey: articleKeys.byCategory(category),
    queryFn: () => getArticlesByCategory(category),
    staleTime: STALE_TIME_STATIC,
    enabled: !!category,
  });
}

export function useGlobalSearch(term: string) {
  const trimmedTerm = term.trim();

  return useQuery({
    queryKey: articleKeys.search(trimmedTerm),
    queryFn: () => globalSearch(trimmedTerm),
    staleTime: STALE_TIME_STATIC,
    enabled: trimmedTerm.length >= 2,
  });
}
