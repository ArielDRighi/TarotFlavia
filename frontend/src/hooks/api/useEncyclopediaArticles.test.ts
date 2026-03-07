/**
 * Tests for useEncyclopediaArticles hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useArticleSnippet,
  useArticle,
  useArticlesByCategory,
  useGlobalSearch,
  articleKeys,
} from './useEncyclopediaArticles';
import * as encyclopediaArticlesApi from '@/lib/api/encyclopedia-articles-api';
import {
  ArticleCategory,
  type ArticleSnippet,
  type ArticleDetail,
  type ArticleSummary,
  type GlobalSearchResult,
} from '@/types/encyclopedia-article.types';
import { ArcanaType } from '@/types/encyclopedia.types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/encyclopedia-articles-api');

// Helper to create QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

const mockArticleSnippet: ArticleSnippet = {
  id: 1,
  slug: 'aries',
  nameEs: 'Aries',
  category: ArticleCategory.ZODIAC_SIGN,
  snippet: 'El primer signo del zodiaco, regido por Marte.',
};

const mockArticleSummary: ArticleSummary = {
  ...mockArticleSnippet,
  imageUrl: '/images/zodiac/aries.jpg',
  sortOrder: 1,
};

const mockArticleDetail: ArticleDetail = {
  ...mockArticleSummary,
  nameEn: 'Aries',
  content: '## Aries\n\nContenido completo del artículo...',
  metadata: { symbol: '♈', color: '#FF4500' },
  relatedArticles: [],
  relatedTarotCards: [1, 2, 3],
};

const mockGlobalSearchResult: GlobalSearchResult = {
  tarotCards: [
    {
      id: 4,
      slug: 'the-emperor',
      nameEs: 'El Emperador',
      arcanaType: ArcanaType.MAJOR,
      number: 4,
      suit: null,
      thumbnailUrl: '/images/tarot/major/04-the-emperor.jpg',
    },
  ],
  articles: [mockArticleSummary],
  total: 2,
};

describe('useArticleSnippet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch article snippet by slug', async () => {
    vi.mocked(encyclopediaArticlesApi.getArticleSnippet).mockResolvedValue(mockArticleSnippet);

    const { result } = renderHook(() => useArticleSnippet('aries'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticleSnippet);
    expect(encyclopediaArticlesApi.getArticleSnippet).toHaveBeenCalledWith('aries');
  });

  it('should be disabled when slug is empty', () => {
    const { result } = renderHook(() => useArticleSnippet(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaArticlesApi.getArticleSnippet).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener snippet del artículo');
    vi.mocked(encyclopediaArticlesApi.getArticleSnippet).mockRejectedValue(error);

    const { result } = renderHook(() => useArticleSnippet('aries'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useArticle', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch article detail by slug', async () => {
    vi.mocked(encyclopediaArticlesApi.getArticle).mockResolvedValue(mockArticleDetail);

    const { result } = renderHook(() => useArticle('aries'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockArticleDetail);
    expect(encyclopediaArticlesApi.getArticle).toHaveBeenCalledWith('aries');
  });

  it('should be disabled when slug is empty', () => {
    const { result } = renderHook(() => useArticle(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaArticlesApi.getArticle).not.toHaveBeenCalled();
  });

  it('should handle errors', async () => {
    const error = new Error('Artículo no encontrado');
    vi.mocked(encyclopediaArticlesApi.getArticle).mockRejectedValue(error);

    const { result } = renderHook(() => useArticle('nonexistent'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useArticlesByCategory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch articles by category', async () => {
    const mockData: ArticleSummary[] = [mockArticleSummary];
    vi.mocked(encyclopediaArticlesApi.getArticlesByCategory).mockResolvedValue(mockData);

    const { result } = renderHook(() => useArticlesByCategory(ArticleCategory.ZODIAC_SIGN), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaArticlesApi.getArticlesByCategory).toHaveBeenCalledWith(
      ArticleCategory.ZODIAC_SIGN
    );
  });

  it('should work with different categories', async () => {
    const planetArticle: ArticleSummary = {
      ...mockArticleSummary,
      category: ArticleCategory.PLANET,
    };
    vi.mocked(encyclopediaArticlesApi.getArticlesByCategory).mockResolvedValue([planetArticle]);

    const { result } = renderHook(() => useArticlesByCategory(ArticleCategory.PLANET), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(encyclopediaArticlesApi.getArticlesByCategory).toHaveBeenCalledWith(
      ArticleCategory.PLANET
    );
  });
});

describe('useGlobalSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch global search results when term is long enough', async () => {
    vi.mocked(encyclopediaArticlesApi.globalSearch).mockResolvedValue(mockGlobalSearchResult);

    const { result } = renderHook(() => useGlobalSearch('aries'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockGlobalSearchResult);
    expect(encyclopediaArticlesApi.globalSearch).toHaveBeenCalledWith('aries');
  });

  it('should trim term before sending to API', async () => {
    vi.mocked(encyclopediaArticlesApi.globalSearch).mockResolvedValue(mockGlobalSearchResult);

    const { result } = renderHook(() => useGlobalSearch('  aries  '), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(encyclopediaArticlesApi.globalSearch).toHaveBeenCalledWith('aries');
  });

  it('useGlobalSearch no debe ejecutarse si term.length < 2', () => {
    const { result } = renderHook(() => useGlobalSearch('a'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaArticlesApi.globalSearch).not.toHaveBeenCalled();
  });

  it('should be disabled when term is empty', () => {
    const { result } = renderHook(() => useGlobalSearch(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaArticlesApi.globalSearch).not.toHaveBeenCalled();
  });

  it('should be disabled when term is only whitespace', () => {
    const { result } = renderHook(() => useGlobalSearch('   '), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaArticlesApi.globalSearch).not.toHaveBeenCalled();
  });

  it('should be enabled when term has exactly 2 characters', async () => {
    vi.mocked(encyclopediaArticlesApi.globalSearch).mockResolvedValue({
      tarotCards: [],
      articles: [],
      total: 0,
    });

    const { result } = renderHook(() => useGlobalSearch('ar'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(encyclopediaArticlesApi.globalSearch).toHaveBeenCalledWith('ar');
  });
});

describe('articleKeys', () => {
  it('should have all required key factories', () => {
    expect(typeof articleKeys.snippet).toBe('function');
    expect(typeof articleKeys.detail).toBe('function');
    expect(typeof articleKeys.byCategory).toBe('function');
    expect(typeof articleKeys.search).toBe('function');
  });

  it('should generate correct query keys', () => {
    expect(articleKeys.snippet('aries')).toContain('aries');
    expect(articleKeys.detail('aries')).toContain('aries');
    expect(articleKeys.byCategory(ArticleCategory.ZODIAC_SIGN)).toContain(
      ArticleCategory.ZODIAC_SIGN
    );
    expect(articleKeys.search('mercurio')).toContain('mercurio');
  });

  it('should include encyclopedia prefix in all keys', () => {
    expect(articleKeys.snippet('aries')).toContain('encyclopedia');
    expect(articleKeys.detail('aries')).toContain('encyclopedia');
    expect(articleKeys.byCategory(ArticleCategory.PLANET)).toContain('encyclopedia');
    expect(articleKeys.search('aries')).toContain('encyclopedia');
  });
});
