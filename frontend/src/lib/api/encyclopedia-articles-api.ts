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

export async function globalSearch(term: string): Promise<GlobalSearchResult> {
  const params = new URLSearchParams({ q: term });
  const response = await apiClient.get<GlobalSearchResult>(
    `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH_GLOBAL}?${params.toString()}`
  );
  return response.data;
}
