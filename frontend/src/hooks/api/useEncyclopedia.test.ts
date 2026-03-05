/**
 * Tests for useEncyclopedia hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useCards,
  useMajorArcana,
  useCardsBySuit,
  useSearchCards,
  useCard,
  useRelatedCards,
  useCardNavigation,
  encyclopediaKeys,
} from './useEncyclopedia';
import * as encyclopediaApi from '@/lib/api/encyclopedia-api';
import {
  ArcanaType,
  Suit,
  Planet,
  ZodiacAssociation,
  type CardSummary,
  type CardDetail,
  type CardNavigation,
} from '@/types/encyclopedia.types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/encyclopedia-api');

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

const mockCardSummary: CardSummary = {
  id: 1,
  slug: 'the-fool',
  nameEs: 'El Loco',
  arcanaType: ArcanaType.MAJOR,
  number: 0,
  suit: null,
  thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
};

const mockCardDetail: CardDetail = {
  id: 1,
  slug: 'the-fool',
  nameEs: 'El Loco',
  nameEn: 'The Fool',
  arcanaType: ArcanaType.MAJOR,
  number: 0,
  suit: null,
  thumbnailUrl: '/images/tarot/major/00-the-fool.jpg',
  romanNumeral: '0',
  courtRank: null,
  element: null,
  planet: Planet.URANUS,
  zodiacSign: ZodiacAssociation.AQUARIUS,
  meaningUpright: 'Nuevos comienzos e inocencia',
  meaningReversed: 'Imprudencia y decisiones precipitadas',
  description: 'Un joven al borde de un precipicio',
  keywords: {
    upright: ['Nuevos comienzos', 'Inocencia'],
    reversed: ['Imprudencia', 'Ingenuidad'],
  },
  imageUrl: '/images/tarot/major/00-the-fool.jpg',
  relatedCards: [2, 3],
};

describe('useCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch all cards without filters', async () => {
    const mockData = [mockCardSummary];
    vi.mocked(encyclopediaApi.getCards).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCards(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaApi.getCards).toHaveBeenCalledWith(undefined);
  });

  it('should fetch cards with filters', async () => {
    const mockData = [mockCardSummary];
    vi.mocked(encyclopediaApi.getCards).mockResolvedValue(mockData);

    const filters = { arcanaType: ArcanaType.MAJOR };

    const { result } = renderHook(() => useCards(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaApi.getCards).toHaveBeenCalledWith(filters);
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener cartas');
    vi.mocked(encyclopediaApi.getCards).mockRejectedValue(error);

    const { result } = renderHook(() => useCards(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useMajorArcana', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch major arcana cards', async () => {
    const mockData = [mockCardSummary];
    vi.mocked(encyclopediaApi.getMajorArcana).mockResolvedValue(mockData);

    const { result } = renderHook(() => useMajorArcana(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaApi.getMajorArcana).toHaveBeenCalled();
  });
});

describe('useCardsBySuit', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch cards by suit', async () => {
    const mockData: CardSummary[] = [
      { ...mockCardSummary, arcanaType: ArcanaType.MINOR, suit: Suit.CUPS },
    ];
    vi.mocked(encyclopediaApi.getCardsBySuit).mockResolvedValue(mockData);

    const { result } = renderHook(() => useCardsBySuit(Suit.CUPS), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaApi.getCardsBySuit).toHaveBeenCalledWith(Suit.CUPS);
  });
});

describe('useSearchCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch search results when query is long enough', async () => {
    const mockData = [mockCardSummary];
    vi.mocked(encyclopediaApi.searchCards).mockResolvedValue(mockData);

    const { result } = renderHook(() => useSearchCards('loco'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaApi.searchCards).toHaveBeenCalledWith('loco');
  });

  it('should trim query before sending to API', async () => {
    vi.mocked(encyclopediaApi.searchCards).mockResolvedValue([]);

    const { result } = renderHook(() => useSearchCards('  loco  '), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(encyclopediaApi.searchCards).toHaveBeenCalledWith('loco');
  });

  it('should be disabled when query is less than 2 characters', async () => {
    const { result } = renderHook(() => useSearchCards('l'), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaApi.searchCards).not.toHaveBeenCalled();
  });

  it('should be disabled when query is empty', async () => {
    const { result } = renderHook(() => useSearchCards(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaApi.searchCards).not.toHaveBeenCalled();
  });

  it('should be disabled when query is only whitespace', async () => {
    const { result } = renderHook(() => useSearchCards('   '), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaApi.searchCards).not.toHaveBeenCalled();
  });

  it('should be enabled when query has exactly 2 characters', async () => {
    vi.mocked(encyclopediaApi.searchCards).mockResolvedValue([]);

    const { result } = renderHook(() => useSearchCards('as'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(encyclopediaApi.searchCards).toHaveBeenCalledWith('as');
  });
});

describe('useCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch card detail by slug', async () => {
    vi.mocked(encyclopediaApi.getCardBySlug).mockResolvedValue(mockCardDetail);

    const { result } = renderHook(() => useCard('the-fool'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockCardDetail);
    expect(encyclopediaApi.getCardBySlug).toHaveBeenCalledWith('the-fool');
  });

  it('should be disabled when slug is empty', async () => {
    const { result } = renderHook(() => useCard(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaApi.getCardBySlug).not.toHaveBeenCalled();
  });
});

describe('useRelatedCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch related cards by slug', async () => {
    const mockData = [{ ...mockCardSummary, id: 2, slug: 'the-magician', nameEs: 'El Mago' }];
    vi.mocked(encyclopediaApi.getRelatedCards).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRelatedCards('the-fool'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(encyclopediaApi.getRelatedCards).toHaveBeenCalledWith('the-fool');
  });

  it('should be disabled when slug is empty', async () => {
    const { result } = renderHook(() => useRelatedCards(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaApi.getRelatedCards).not.toHaveBeenCalled();
  });
});

describe('useCardNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch card navigation by slug', async () => {
    const mockNav: CardNavigation = {
      previous: null,
      next: {
        id: 2,
        slug: 'the-magician',
        nameEs: 'El Mago',
        arcanaType: ArcanaType.MAJOR,
        number: 1,
        suit: null,
        thumbnailUrl: '/images/tarot/major/01-the-magician.jpg',
      },
    };
    vi.mocked(encyclopediaApi.getCardNavigation).mockResolvedValue(mockNav);

    const { result } = renderHook(() => useCardNavigation('the-fool'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockNav);
    expect(encyclopediaApi.getCardNavigation).toHaveBeenCalledWith('the-fool');
    expect(result.current.data?.previous).toBeNull();
    expect(result.current.data?.next?.slug).toBe('the-magician');
  });

  it('should be disabled when slug is empty', async () => {
    const { result } = renderHook(() => useCardNavigation(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(encyclopediaApi.getCardNavigation).not.toHaveBeenCalled();
  });
});

describe('encyclopediaKeys', () => {
  it('should have all required key factories', () => {
    expect(encyclopediaKeys.all).toBeDefined();
    expect(typeof encyclopediaKeys.cards).toBe('function');
    expect(typeof encyclopediaKeys.major).toBe('function');
    expect(typeof encyclopediaKeys.bySuit).toBe('function');
    expect(typeof encyclopediaKeys.search).toBe('function');
    expect(typeof encyclopediaKeys.detail).toBe('function');
    expect(typeof encyclopediaKeys.related).toBe('function');
    expect(typeof encyclopediaKeys.navigation).toBe('function');
  });

  it('should generate correct query keys', () => {
    expect(encyclopediaKeys.all).toEqual(['encyclopedia']);
    expect(encyclopediaKeys.cards()).toContain('encyclopedia');
    expect(encyclopediaKeys.major()).toContain('encyclopedia');
    expect(encyclopediaKeys.bySuit(Suit.CUPS)).toContain(Suit.CUPS);
    expect(encyclopediaKeys.search('loco')).toContain('loco');
    expect(encyclopediaKeys.detail('the-fool')).toContain('the-fool');
    expect(encyclopediaKeys.related('the-fool')).toContain('the-fool');
    expect(encyclopediaKeys.navigation('the-fool')).toContain('the-fool');
  });
});
