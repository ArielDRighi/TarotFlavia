/**
 * Tests for useRituals hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useRituals,
  useFeaturedRituals,
  useRitualCategories,
  useLunarInfo,
  useRitual,
  useRitualHistory,
  useRitualStats,
} from './useRituals';
import * as ritualsApi from '@/lib/api/rituals-api';
import {
  RitualCategory,
  RitualDifficulty,
  LunarPhase,
  type RitualSummary,
  type RitualDetail,
  type LunarInfo,
  type RitualHistoryEntry,
  type UserRitualStats,
} from '@/types/ritual.types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/rituals-api');

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

describe('useRituals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRitualSummary: RitualSummary = {
    id: 1,
    slug: 'ritual-luna-nueva',
    title: 'Ritual de Luna Nueva',
    description: 'Ceremonia para establecer intenciones',
    category: RitualCategory.LUNAR,
    difficulty: RitualDifficulty.BEGINNER,
    durationMinutes: 30,
    bestLunarPhase: LunarPhase.NEW_MOON,
    imageUrl: '/images/ritual.jpg',
    materialsCount: 4,
    stepsCount: 7,
  };

  it('should fetch rituals without filters', async () => {
    const mockData = [mockRitualSummary];
    vi.mocked(ritualsApi.getRituals).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRituals(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getRituals).toHaveBeenCalledWith(undefined);
  });

  it('should fetch rituals with filters', async () => {
    const mockData = [mockRitualSummary];
    vi.mocked(ritualsApi.getRituals).mockResolvedValue(mockData);

    const filters = {
      category: RitualCategory.LUNAR,
      difficulty: RitualDifficulty.BEGINNER,
    };

    const { result } = renderHook(() => useRituals(filters), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getRituals).toHaveBeenCalledWith(filters);
  });

  it('should handle errors', async () => {
    const error = new Error('Error al obtener rituales');
    vi.mocked(ritualsApi.getRituals).mockRejectedValue(error);

    const { result } = renderHook(() => useRituals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });
});

describe('useFeaturedRituals', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch featured rituals', async () => {
    const mockData: RitualSummary[] = [
      {
        id: 1,
        slug: 'ritual-luna-nueva',
        title: 'Ritual de Luna Nueva',
        description: 'Ceremonia',
        category: RitualCategory.LUNAR,
        difficulty: RitualDifficulty.BEGINNER,
        durationMinutes: 30,
        bestLunarPhase: LunarPhase.NEW_MOON,
        imageUrl: '/images/ritual.jpg',
        materialsCount: 4,
        stepsCount: 7,
      },
    ];

    vi.mocked(ritualsApi.getFeaturedRituals).mockResolvedValue(mockData);

    const { result } = renderHook(() => useFeaturedRituals(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getFeaturedRituals).toHaveBeenCalled();
  });
});

describe('useRitualCategories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch categories with count', async () => {
    const mockData = [
      { category: 'lunar', count: 4 },
      { category: 'tarot', count: 3 },
    ];

    vi.mocked(ritualsApi.getCategories).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRitualCategories(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getCategories).toHaveBeenCalled();
  });
});

describe('useLunarInfo', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch lunar info', async () => {
    const mockData: LunarInfo = {
      phase: LunarPhase.FULL_MOON,
      phaseName: 'Luna Llena',
      illumination: 100,
      zodiacSign: 'Aries',
      isGoodFor: ['Culminación', 'Celebración'],
    };

    vi.mocked(ritualsApi.getLunarInfo).mockResolvedValue(mockData);

    const { result } = renderHook(() => useLunarInfo(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.phase).toBe(LunarPhase.FULL_MOON);
    expect(ritualsApi.getLunarInfo).toHaveBeenCalled();
  });
});

describe('useRitual', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch ritual detail by slug', async () => {
    const mockData: RitualDetail = {
      id: 1,
      slug: 'ritual-luna-nueva',
      title: 'Ritual de Luna Nueva',
      description: 'Ceremonia',
      category: RitualCategory.LUNAR,
      difficulty: RitualDifficulty.BEGINNER,
      durationMinutes: 30,
      bestLunarPhase: LunarPhase.NEW_MOON,
      imageUrl: '/images/ritual.jpg',
      materialsCount: 4,
      stepsCount: 7,
      bestTimeOfDay: 'Noche',
      purpose: 'Establecer intenciones',
      preparation: 'Busca un espacio tranquilo',
      closing: 'Agradece a la luna',
      tips: ['Sé específico'],
      audioUrl: null,
      materials: [],
      steps: [],
      completionCount: 42,
    };

    vi.mocked(ritualsApi.getRitualBySlug).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRitual('ritual-luna-nueva'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getRitualBySlug).toHaveBeenCalledWith('ritual-luna-nueva');
  });

  it('should be disabled when slug is empty', async () => {
    const { result } = renderHook(() => useRitual(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(ritualsApi.getRitualBySlug).not.toHaveBeenCalled();
  });
});

describe('useRitualHistory', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch ritual history without limit', async () => {
    const mockData: RitualHistoryEntry[] = [
      {
        id: 1,
        ritual: {
          id: 1,
          slug: 'ritual-luna-nueva',
          title: 'Ritual de Luna Nueva',
          category: RitualCategory.LUNAR,
        },
        completedAt: '2026-01-17T20:00:00Z',
        lunarPhase: LunarPhase.NEW_MOON,
        lunarSign: 'Capricornio',
        notes: 'Muy tranquilizador',
        rating: 5,
        durationMinutes: 35,
      },
    ];

    vi.mocked(ritualsApi.getRitualHistory).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRitualHistory(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getRitualHistory).toHaveBeenCalledWith(undefined);
  });

  it('should fetch ritual history with limit', async () => {
    const mockData: RitualHistoryEntry[] = [];
    vi.mocked(ritualsApi.getRitualHistory).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRitualHistory(10), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(ritualsApi.getRitualHistory).toHaveBeenCalledWith(10);
  });
});

describe('useRitualStats', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch ritual stats', async () => {
    const mockData: UserRitualStats = {
      totalCompleted: 15,
      favoriteCategory: RitualCategory.LUNAR,
      currentStreak: 3,
      thisMonthCount: 8,
    };

    vi.mocked(ritualsApi.getRitualStats).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRitualStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(result.current.data?.totalCompleted).toBe(15);
    expect(result.current.data?.favoriteCategory).toBe(RitualCategory.LUNAR);
    expect(ritualsApi.getRitualStats).toHaveBeenCalled();
  });

  it('should handle null favoriteCategory', async () => {
    const mockData: UserRitualStats = {
      totalCompleted: 0,
      favoriteCategory: null,
      currentStreak: 0,
      thisMonthCount: 0,
    };

    vi.mocked(ritualsApi.getRitualStats).mockResolvedValue(mockData);

    const { result } = renderHook(() => useRitualStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.favoriteCategory).toBeNull();
  });
});
