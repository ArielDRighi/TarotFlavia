/**
 * Encyclopedia Articles API Functions
 *
 * API functions for the Mystic Encyclopedia articles module.
 */

import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import type {
  ArticleSnippet,
  ArticleSummary,
  ArticleDetail,
  ArticleCategory,
  GlobalSearchResult,
} from '@/types/encyclopedia-article.types';

export async function getArticleSnippet(slug: string): Promise<ArticleSnippet> {
  const response = await apiClient.get<ArticleSnippet>(
    API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_SNIPPET(slug)
  );
  return response.data;
}

export async function getArticle(slug: string): Promise<ArticleDetail> {
  const response = await apiClient.get<ArticleDetail>(
    API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_DETAIL(slug)
  );
  return response.data;
}

export async function getArticlesByCategory(category: ArticleCategory): Promise<ArticleSummary[]> {
  const response = await apiClient.get<ArticleSummary[]>(
    API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_BY_CATEGORY(category)
  );
  return response.data;
}

/**
 * Resuelve varias categorías en paralelo, para sembrar un listado desde el
 * servidor (T-SEO-003 — lo usa `/enciclopedia/guias`, que muestra siete).
 *
 * Cada categoría degrada por separado: una que falle queda fuera del resultado
 * y el cliente la vuelve a pedir, en vez de dejar sin contenido a las otras
 * seis. Mismo criterio que `resolveListingData`.
 */
export async function getArticlesByCategories(
  categories: ArticleCategory[]
): Promise<Partial<Record<ArticleCategory, ArticleSummary[]>>> {
  const resolved = await Promise.all(
    categories.map(async (category) => {
      try {
        return { category, articles: await getArticlesByCategory(category) };
      } catch {
        return { category, articles: undefined };
      }
    })
  );

  return resolved.reduce<Partial<Record<ArticleCategory, ArticleSummary[]>>>(
    (accumulator, { category, articles }) => {
      if (articles) {
        accumulator[category] = articles;
      }
      return accumulator;
    },
    {}
  );
}

export async function globalSearch(term: string): Promise<GlobalSearchResult> {
  const params = new URLSearchParams({ q: term });
  const response = await apiClient.get<GlobalSearchResult>(
    `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH_GLOBAL}?${params.toString()}`
  );
  return response.data;
}
