/**
 * Tests for Encyclopedia Articles API Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getArticleSnippet,
  getArticle,
  getArticlesByCategory,
  globalSearch,
} from './encyclopedia-articles-api';
import { ArticleCategory } from '@/types/encyclopedia-article.types';
import { API_ENDPOINTS } from './endpoints';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('encyclopedia articles API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockArticleSnippet = {
    id: 1,
    slug: 'aries',
    nameEs: 'Aries',
    category: ArticleCategory.ZODIAC_SIGN,
    snippet: 'El primer signo del zodiaco, regido por Marte.',
  };

  const mockArticleSummary = {
    ...mockArticleSnippet,
    imageUrl: '/images/zodiac/aries.jpg',
    sortOrder: 1,
  };

  const mockArticleDetail = {
    ...mockArticleSummary,
    nameEn: 'Aries',
    content: '## Aries\n\nContenido completo...',
    metadata: { symbol: '♈' },
    relatedArticles: [],
    relatedTarotCards: [1, 2],
  };

  const mockGlobalSearchResult = {
    tarotCards: [
      {
        id: 1,
        slug: 'the-emperor',
        nameEs: 'El Emperador',
        arcanaType: 'major',
        number: 4,
        suit: null,
        thumbnailUrl: '/images/tarot/major/04-the-emperor.jpg',
      },
    ],
    articles: [mockArticleSummary],
    total: 2,
  };

  describe('getArticleSnippet', () => {
    it('should call correct snippet endpoint and return article snippet', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockArticleSnippet });

      const result = await getArticleSnippet('aries');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_SNIPPET('aries')
      );
      expect(result).toEqual(mockArticleSnippet);
      expect(result.id).toBe(1);
      expect(result.slug).toBe('aries');
    });

    it('should work with different slugs', async () => {
      const mercurySnippet = { ...mockArticleSnippet, slug: 'mercurio', nameEs: 'Mercurio' };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mercurySnippet });

      const result = await getArticleSnippet('mercurio');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_SNIPPET('mercurio')
      );
      expect(result.slug).toBe('mercurio');
    });
  });

  describe('getArticle', () => {
    it('should call correct detail endpoint and return article detail', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockArticleDetail });

      const result = await getArticle('aries');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_DETAIL('aries')
      );
      expect(result).toEqual(mockArticleDetail);
      expect(result.content).toContain('## Aries');
      expect(result.relatedTarotCards).toHaveLength(2);
    });

    it('should work with guide articles', async () => {
      const guideDetail = {
        ...mockArticleDetail,
        slug: 'guia-numerologia',
        nameEs: 'Guía de Numerología',
        category: ArticleCategory.GUIDE_NUMEROLOGY,
        nameEn: null,
        metadata: null,
        relatedTarotCards: null,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: guideDetail });

      const result = await getArticle('guia-numerologia');

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_DETAIL('guia-numerologia')
      );
      expect(result.nameEn).toBeNull();
      expect(result.relatedTarotCards).toBeNull();
    });
  });

  describe('getArticlesByCategory', () => {
    it('should call correct category endpoint and return article summaries', async () => {
      const mockData = [mockArticleSummary];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getArticlesByCategory(ArticleCategory.ZODIAC_SIGN);

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_BY_CATEGORY(ArticleCategory.ZODIAC_SIGN)
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });

    it('should work with different categories', async () => {
      const planetArticle = { ...mockArticleSummary, category: ArticleCategory.PLANET };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [planetArticle] });

      await getArticlesByCategory(ArticleCategory.PLANET);

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.ENCYCLOPEDIA.ARTICLE_BY_CATEGORY(ArticleCategory.PLANET)
      );
    });
  });

  describe('globalSearch', () => {
    it('should call correct search endpoint with term', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockGlobalSearchResult });

      const result = await globalSearch('aries');

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH_GLOBAL}?q=aries`
      );
      expect(result).toEqual(mockGlobalSearchResult);
      expect(result.total).toBe(2);
    });

    it('should return combined tarot cards and articles', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockGlobalSearchResult });

      const result = await globalSearch('mercurio');

      expect(result.tarotCards).toHaveLength(1);
      expect(result.articles).toHaveLength(1);
    });

    it('should encode special characters in search term', async () => {
      const emptyResult = { tarotCards: [], articles: [], total: 0 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: emptyResult });

      await globalSearch('signo y planeta');

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.ENCYCLOPEDIA.SEARCH_GLOBAL}?q=signo+y+planeta`
      );
    });

    it('should return empty result when no matches found', async () => {
      const emptyResult = { tarotCards: [], articles: [], total: 0 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: emptyResult });

      const result = await globalSearch('zzznomatch');

      expect(result.tarotCards).toHaveLength(0);
      expect(result.articles).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });
});
