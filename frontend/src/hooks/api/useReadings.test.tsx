/**
 * Tests for TanStack Query hooks for readings
 *
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';

import {
  useCategories,
  usePredefinedQuestions,
  useSpreads,
  useMyReadings,
  useReadingDetail,
  useCreateReading,
  useDeleteReading,
  useRegenerateInterpretation,
  useShareReading,
  useUnshareReading,
  useTrashedReadings,
  useRestoreReading,
  readingQueryKeys,
} from './useReadings';
import * as readingsApi from '@/lib/api/readings-api';
import type {
  Category,
  PredefinedQuestion,
  Spread,
  PaginatedReadings,
  ReadingDetail,
  TrashedReading,
  ShareReadingResponse,
} from '@/types';

// Mock the API module
vi.mock('@/lib/api/readings-api');

// Mock custom toast wrapper
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// Mock data
const mockCategories: Category[] = [
  {
    id: 1,
    name: 'Amor',
    slug: 'amor',
    description: 'Preguntas sobre amor',
    color: '#FF6B6B',
    icon: 'heart',
    isActive: true,
  },
  {
    id: 2,
    name: 'Trabajo',
    slug: 'trabajo',
    description: 'Preguntas sobre trabajo',
    color: '#4ECDC4',
    icon: 'briefcase',
    isActive: true,
  },
];

const mockQuestions: PredefinedQuestion[] = [
  {
    id: 1,
    questionText: '¿Encontraré el amor verdadero?',
    categoryId: 1,
    order: 1,
    isActive: true,
    usageCount: 150,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  },
  {
    id: 2,
    questionText: '¿Mi pareja es fiel?',
    categoryId: 1,
    order: 2,
    isActive: true,
    usageCount: 120,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
    deletedAt: null,
  },
];

const mockSpreads: Spread[] = [
  {
    id: 1,
    name: 'Cruz Celta',
    description: 'Tirada clásica de 10 cartas',
    cardCount: 10,
    positions: [{ position: 1, name: 'Presente', description: 'Tu situación actual' }],
    difficulty: 'advanced',
  },
  {
    id: 2,
    name: 'Tres Cartas',
    description: 'Pasado, presente y futuro',
    cardCount: 3,
    positions: [{ position: 1, name: 'Pasado', description: 'Lo que ya ocurrió' }],
    difficulty: 'beginner',
  },
];

const mockReadingDetail: ReadingDetail = {
  id: 1,
  userId: 1,
  spreadId: 1,
  question: '¿Qué me depara el futuro?',
  cards: [],
  interpretation: {
    id: 1,
    generalInterpretation: 'Tu futuro es brillante',
    cardInterpretations: [],
    aiProvider: 'groq',
    model: 'llama-3.1-70b',
  },
  createdAt: '2025-12-01T10:00:00Z',
};

const mockPaginatedReadings: PaginatedReadings = {
  data: [
    {
      id: 1,
      spreadId: 1,
      spreadName: 'Cruz Celta',
      question: '¿Qué me depara el futuro?',
      createdAt: '2025-12-01T10:00:00Z',
      cardsCount: 10,
    },
    {
      id: 2,
      spreadId: 2,
      spreadName: 'Tres Cartas',
      question: '¿Encontraré el amor?',
      createdAt: '2025-12-02T10:00:00Z',
      cardsCount: 3,
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    totalItems: 2,
    totalPages: 1,
  },
};

const mockTrashedReadings: TrashedReading[] = [
  {
    id: 3,
    spreadId: 1,
    question: 'Lectura eliminada',
    createdAt: '2025-12-01T10:00:00Z',
    deletedAt: '2025-12-03T10:00:00Z',
    restorable: true,
  },
];

const mockShareResponse: ShareReadingResponse = {
  shareToken: 'abc123xyz',
};

describe('use-readings hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // =========================================================================
  // useCategories
  // =========================================================================
  describe('useCategories', () => {
    it('should fetch categories successfully', async () => {
      vi.mocked(readingsApi.getCategories).mockResolvedValueOnce(mockCategories);

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCategories);
      expect(readingsApi.getCategories).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching categories', async () => {
      vi.mocked(readingsApi.getCategories).mockRejectedValueOnce(
        new Error('Error al obtener categorías')
      );

      const { result } = renderHook(() => useCategories(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBeDefined();
    });

    it('should have correct staleTime for categories (Infinity)', async () => {
      vi.mocked(readingsApi.getCategories).mockResolvedValueOnce(mockCategories);

      const queryClient = createTestQueryClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCategories(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second call should use cached data (staleTime: Infinity)
      const { result: result2 } = renderHook(() => useCategories(), { wrapper });

      // Should not trigger another API call
      expect(readingsApi.getCategories).toHaveBeenCalledTimes(1);
      expect(result2.current.data).toEqual(mockCategories);
    });
  });

  // =========================================================================
  // usePredefinedQuestions
  // =========================================================================
  describe('usePredefinedQuestions', () => {
    it('should fetch predefined questions without categoryId', async () => {
      vi.mocked(readingsApi.getPredefinedQuestions).mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => usePredefinedQuestions(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockQuestions);
      expect(readingsApi.getPredefinedQuestions).toHaveBeenCalledWith(undefined);
    });

    it('should fetch predefined questions with categoryId', async () => {
      vi.mocked(readingsApi.getPredefinedQuestions).mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => usePredefinedQuestions(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.getPredefinedQuestions).toHaveBeenCalledWith(1);
    });

    it('should be disabled when categoryId is explicitly set to undefined but optional', async () => {
      // When we explicitly pass undefined (no category filter), it should still fetch
      vi.mocked(readingsApi.getPredefinedQuestions).mockResolvedValueOnce(mockQuestions);

      const { result } = renderHook(() => usePredefinedQuestions(undefined), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });
    });
  });

  // =========================================================================
  // useSpreads
  // =========================================================================
  describe('useSpreads', () => {
    it('should fetch spreads successfully', async () => {
      vi.mocked(readingsApi.getSpreads).mockResolvedValueOnce(mockSpreads);

      const { result } = renderHook(() => useSpreads(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSpreads);
      expect(readingsApi.getSpreads).toHaveBeenCalledTimes(1);
    });

    it('should have correct staleTime for spreads (Infinity)', async () => {
      vi.mocked(readingsApi.getSpreads).mockResolvedValueOnce(mockSpreads);

      const queryClient = createTestQueryClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSpreads(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Second render should use cached data
      const { result: result2 } = renderHook(() => useSpreads(), { wrapper });
      expect(readingsApi.getSpreads).toHaveBeenCalledTimes(1);
      expect(result2.current.data).toEqual(mockSpreads);
    });
  });

  // =========================================================================
  // useMyReadings
  // =========================================================================
  describe('useMyReadings', () => {
    it('should fetch paginated readings', async () => {
      vi.mocked(readingsApi.getMyReadings).mockResolvedValueOnce(mockPaginatedReadings);

      const { result } = renderHook(() => useMyReadings(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPaginatedReadings);
      expect(readingsApi.getMyReadings).toHaveBeenCalledWith(1, 10);
    });

    it('should refetch with different page', async () => {
      vi.mocked(readingsApi.getMyReadings).mockResolvedValue(mockPaginatedReadings);

      const queryClient = createTestQueryClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      // First page
      const { result, rerender } = renderHook(({ page, limit }) => useMyReadings(page, limit), {
        wrapper,
        initialProps: { page: 1, limit: 10 },
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.getMyReadings).toHaveBeenCalledWith(1, 10);

      // Change to page 2
      rerender({ page: 2, limit: 10 });

      await waitFor(() => {
        expect(readingsApi.getMyReadings).toHaveBeenCalledWith(2, 10);
      });
    });
  });

  // =========================================================================
  // useReadingDetail
  // =========================================================================
  describe('useReadingDetail', () => {
    it('should fetch reading detail by id', async () => {
      vi.mocked(readingsApi.getReadingById).mockResolvedValueOnce(mockReadingDetail);

      const { result } = renderHook(() => useReadingDetail(1), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReadingDetail);
      expect(readingsApi.getReadingById).toHaveBeenCalledWith(1);
    });

    it('should be disabled when id is 0', async () => {
      const { result } = renderHook(() => useReadingDetail(0), {
        wrapper: createWrapper(),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(readingsApi.getReadingById).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // useCreateReading
  // =========================================================================
  describe('useCreateReading', () => {
    it('should create reading successfully', async () => {
      vi.mocked(readingsApi.createReading).mockResolvedValueOnce(mockReadingDetail);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCreateReading(), { wrapper });

      const createData = {
        spreadId: 1,
        deckId: 1,
        cardIds: [1, 5, 9],
        cardPositions: [
          { cardId: 1, position: 'Pasado', isReversed: false },
          { cardId: 5, position: 'Presente', isReversed: true },
          { cardId: 9, position: 'Futuro', isReversed: false },
        ],
        customQuestion: '¿Qué me depara el futuro?',
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.createReading).toHaveBeenCalledWith(createData);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.all });
    });

    it('should handle error when creating reading', async () => {
      vi.mocked(readingsApi.createReading).mockRejectedValueOnce(
        new Error('Error al crear lectura')
      );

      const { result } = renderHook(() => useCreateReading(), {
        wrapper: createWrapper(),
      });

      const createData = {
        spreadId: 1,
        deckId: 1,
        cardIds: [1],
        cardPositions: [{ cardId: 1, position: 'Presente', isReversed: false }],
        customQuestion: 'Test',
      };

      result.current.mutate(createData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =========================================================================
  // useDeleteReading
  // =========================================================================
  describe('useDeleteReading', () => {
    it('should delete reading successfully', async () => {
      vi.mocked(readingsApi.deleteReading).mockResolvedValueOnce();

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDeleteReading(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.deleteReading).toHaveBeenCalledWith(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.all });
    });
  });

  // =========================================================================
  // useRegenerateInterpretation
  // =========================================================================
  describe('useRegenerateInterpretation', () => {
    it('should regenerate interpretation successfully', async () => {
      vi.mocked(readingsApi.regenerateInterpretation).mockResolvedValueOnce(mockReadingDetail);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useRegenerateInterpretation(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.regenerateInterpretation).toHaveBeenCalledWith(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.detail(1) });
    });
  });

  // =========================================================================
  // useShareReading
  // =========================================================================
  describe('useShareReading', () => {
    it('should share reading successfully', async () => {
      vi.mocked(readingsApi.shareReading).mockResolvedValueOnce(mockShareResponse);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useShareReading(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.shareReading).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(mockShareResponse);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.detail(1) });
    });
  });

  // =========================================================================
  // useUnshareReading
  // =========================================================================
  describe('useUnshareReading', () => {
    it('should unshare reading successfully', async () => {
      vi.mocked(readingsApi.unshareReading).mockResolvedValueOnce();

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useUnshareReading(), { wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.unshareReading).toHaveBeenCalledWith(1);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.detail(1) });
    });
  });

  // =========================================================================
  // useTrashedReadings
  // =========================================================================
  describe('useTrashedReadings', () => {
    it('should fetch trashed readings successfully', async () => {
      vi.mocked(readingsApi.getTrashedReadings).mockResolvedValueOnce(mockTrashedReadings);

      const { result } = renderHook(() => useTrashedReadings(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockTrashedReadings);
      expect(readingsApi.getTrashedReadings).toHaveBeenCalledTimes(1);
    });
  });

  // =========================================================================
  // useRestoreReading
  // =========================================================================
  describe('useRestoreReading', () => {
    it('should restore reading successfully', async () => {
      const restoredReading = {
        id: 3,
        spreadId: 1,
        question: 'Lectura restaurada',
        createdAt: '2025-12-01T10:00:00Z',
      };

      vi.mocked(readingsApi.restoreReading).mockResolvedValueOnce(restoredReading);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useRestoreReading(), { wrapper });

      result.current.mutate(3);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.restoreReading).toHaveBeenCalledWith(3);
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.all });
      expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: readingQueryKeys.trash() });
    });
  });
});
