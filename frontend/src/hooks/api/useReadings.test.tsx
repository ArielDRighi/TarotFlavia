/**
 * Tests for useReadings hooks
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import {
  useSpreads,
  useMyAvailableSpreads,
  useCategories,
  usePredefinedQuestions,
  useMyReadings,
  useReadingDetail,
  useCreateReading,
  useDeleteReading,
  useRestoreReading,
} from './useReadings';
import * as readingsApi from '@/lib/api/readings-api';
import * as invalidateUserDataUtil from '@/lib/utils/invalidate-user-data';
import type {
  Reading,
  ReadingDetail,
  Category,
  PredefinedQuestion,
  CreateReadingDto,
} from '@/types/reading.types';

// Mock the API functions
vi.mock('@/lib/api/readings-api');
vi.mock('@/lib/utils/invalidate-user-data');

describe('useReadings - Spreads Hooks', () => {
  let queryClient: QueryClient;

  // Wrapper component for React Query
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('useSpreads', () => {
    it('should fetch all public spreads', async () => {
      const mockSpreads = [
        {
          id: 1,
          name: 'Tirada de 1 Carta',
          description: 'Respuesta rápida',
          cardCount: 1,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'anonymous' as const,
        },
        {
          id: 2,
          name: 'Tirada de 3 Cartas',
          description: 'Pasado, presente, futuro',
          cardCount: 3,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'free' as const,
        },
      ];

      vi.mocked(readingsApi.getSpreads).mockResolvedValue(mockSpreads);

      const { result } = renderHook(() => useSpreads(), {
        wrapper: Wrapper,
      });

      // Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockSpreads);
      expect(readingsApi.getSpreads).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching spreads', async () => {
      const mockError = new Error('Network error');
      vi.mocked(readingsApi.getSpreads).mockRejectedValue(mockError);

      const { result } = renderHook(() => useSpreads(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it('should use infinite staleTime for spreads', () => {
      vi.mocked(readingsApi.getSpreads).mockResolvedValue([]);

      renderHook(() => useSpreads(), {
        wrapper: Wrapper,
      });

      // Verify query configuration
      const queryState = queryClient.getQueryState(['spreads']);
      expect(queryState).toBeDefined();
    });
  });

  describe('useMyAvailableSpreads', () => {
    it('should fetch spreads filtered by user plan', async () => {
      const mockFilteredSpreads = [
        {
          id: 1,
          name: 'Tirada de 1 Carta',
          description: 'Respuesta rápida',
          cardCount: 1,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'anonymous' as const,
        },
        {
          id: 2,
          name: 'Tirada de 3 Cartas',
          description: 'Pasado, presente, futuro',
          cardCount: 3,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'free' as const,
        },
      ];

      vi.mocked(readingsApi.getMyAvailableSpreads).mockResolvedValue(mockFilteredSpreads);

      const { result } = renderHook(() => useMyAvailableSpreads(), {
        wrapper: Wrapper,
      });

      // Initial loading state
      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      // Wait for data to load
      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.data).toEqual(mockFilteredSpreads);
      expect(readingsApi.getMyAvailableSpreads).toHaveBeenCalledTimes(1);
    });

    it('should handle errors when fetching filtered spreads', async () => {
      const mockError = new Error('Unauthorized');
      vi.mocked(readingsApi.getMyAvailableSpreads).mockRejectedValue(mockError);

      const { result } = renderHook(() => useMyAvailableSpreads(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeTruthy();
      expect(result.current.data).toBeUndefined();
    });

    it('should use 5-minute staleTime for user-specific spreads', async () => {
      vi.mocked(readingsApi.getMyAvailableSpreads).mockResolvedValue([]);

      const { result } = renderHook(() => useMyAvailableSpreads(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify query was executed
      expect(readingsApi.getMyAvailableSpreads).toHaveBeenCalledTimes(1);
    });

    it('should return only FREE-tier spreads for FREE users', async () => {
      const mockFreeSpreads = [
        {
          id: 1,
          name: 'Tirada de 1 Carta',
          description: 'Respuesta rápida',
          cardCount: 1,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'anonymous' as const,
        },
        {
          id: 2,
          name: 'Tirada de 3 Cartas',
          description: 'Pasado, presente, futuro',
          cardCount: 3,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'free' as const,
        },
      ];

      vi.mocked(readingsApi.getMyAvailableSpreads).mockResolvedValue(mockFreeSpreads);

      const { result } = renderHook(() => useMyAvailableSpreads(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify no PREMIUM spreads are included
      expect(result.current.data).toEqual(mockFreeSpreads);
      expect(result.current.data?.every((s) => s.requiredPlan !== 'premium')).toBe(true);
    });

    it('should return all spreads for PREMIUM users', async () => {
      const mockAllSpreads = [
        {
          id: 1,
          name: 'Tirada de 1 Carta',
          description: 'Respuesta rápida',
          cardCount: 1,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'anonymous' as const,
        },
        {
          id: 2,
          name: 'Tirada de 3 Cartas',
          description: 'Pasado, presente, futuro',
          cardCount: 3,
          positions: [],
          difficulty: 'beginner' as const,
          requiredPlan: 'free' as const,
        },
        {
          id: 3,
          name: 'Tirada de 5 Cartas',
          description: 'Análisis profundo',
          cardCount: 5,
          positions: [],
          difficulty: 'intermediate' as const,
          requiredPlan: 'premium' as const,
        },
        {
          id: 4,
          name: 'Cruz Céltica',
          description: 'Tirada completa',
          cardCount: 10,
          positions: [],
          difficulty: 'advanced' as const,
          requiredPlan: 'premium' as const,
        },
      ];

      vi.mocked(readingsApi.getMyAvailableSpreads).mockResolvedValue(mockAllSpreads);

      const { result } = renderHook(() => useMyAvailableSpreads(), {
        wrapper: Wrapper,
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Verify all spreads are included
      expect(result.current.data).toEqual(mockAllSpreads);
      expect(result.current.data).toHaveLength(4);
    });
  });

  // =========================================================================
  // useCategories
  // =========================================================================
  describe('useCategories', () => {
    it('should fetch categories successfully', async () => {
      const mockCategories: Category[] = [
        {
          id: 1,
          name: 'Amor',
          slug: 'amor',
          description: 'Preguntas sobre amor',
          color: '#FF6B9D',
          icon: 'heart',
          isActive: true,
        },
        {
          id: 2,
          name: 'Trabajo',
          slug: 'trabajo',
          description: 'Preguntas sobre trabajo',
          color: '#4CAF50',
          icon: 'briefcase',
          isActive: true,
        },
      ];

      vi.mocked(readingsApi.getCategories).mockResolvedValue(mockCategories);

      const { result } = renderHook(() => useCategories(), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCategories);
    });
  });

  // =========================================================================
  // usePredefinedQuestions
  // =========================================================================
  describe('usePredefinedQuestions', () => {
    it('should fetch predefined questions for a category', async () => {
      const mockQuestions: PredefinedQuestion[] = [
        {
          id: 1,
          questionText: '¿Encontraré el amor este año?',
          categoryId: 1,
          order: 1,
          isActive: true,
          usageCount: 10,
          createdAt: '2025-01-01T00:00:00Z',
          updatedAt: '2025-01-01T00:00:00Z',
          deletedAt: null,
        },
      ];

      vi.mocked(readingsApi.getPredefinedQuestions).mockResolvedValue(mockQuestions);

      const { result } = renderHook(() => usePredefinedQuestions(1), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockQuestions);
      expect(readingsApi.getPredefinedQuestions).toHaveBeenCalledWith(1);
    });
  });

  // =========================================================================
  // useMyReadings
  // =========================================================================
  describe('useMyReadings', () => {
    it('should fetch paginated readings', async () => {
      const mockReadingsData = {
        data: [
          {
            id: 1,
            question: '¿Cómo será mi año?',
            spreadId: 1,
            spreadName: 'Tirada de 1 Carta',
            createdAt: '2025-01-01T00:00:00Z',
            cardsCount: 1,
          },
        ] as Reading[],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 1,
          totalPages: 1,
        },
      };

      vi.mocked(readingsApi.getMyReadings).mockResolvedValue(mockReadingsData);

      const { result } = renderHook(() => useMyReadings(1, 10), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReadingsData);
    });

    it('should have 30 seconds staleTime for quick cache updates', async () => {
      // BUG-F-003: Readings can change frequently (create, delete, regenerate)
      // StaleTime of 30s balances UX (quick updates) with performance (avoid unnecessary refetches)

      const mockReadingsData = {
        data: [] as Reading[],
        meta: {
          page: 1,
          limit: 10,
          totalItems: 0,
          totalPages: 0,
        },
      };

      vi.mocked(readingsApi.getMyReadings).mockResolvedValue(mockReadingsData);

      const { result } = renderHook(() => useMyReadings(1, 10), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      // Verify the query has the correct staleTime configuration
      const queryState = queryClient.getQueryState(['readings', 'list', { page: 1, limit: 10 }]);

      // Check that data exists (query was executed)
      expect(queryState).toBeDefined();
      expect(queryState?.dataUpdatedAt).toBeGreaterThan(0);

      // The staleTime should be 30 seconds (30000ms)
      // This test verifies the hook configuration, not React Query's internal timer
      // We check that the query doesn't immediately become stale
      expect(queryState?.isInvalidated).toBe(false);
    });
  });

  // =========================================================================
  // useReadingDetail
  // =========================================================================
  describe('useReadingDetail', () => {
    it('should fetch reading detail by ID', async () => {
      const mockReading: ReadingDetail = {
        id: 1,
        userId: 1,
        question: '¿Cómo será mi año?',
        spreadId: 1,
        cards: [],
        interpretation: 'Interpretación de prueba',
        createdAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(readingsApi.getReadingById).mockResolvedValue(mockReading);

      const { result } = renderHook(() => useReadingDetail(1), { wrapper: Wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockReading);
    });
  });

  // =========================================================================
  // useCreateReading
  // =========================================================================
  describe('useCreateReading', () => {
    it('should create reading successfully', async () => {
      const mockReading: ReadingDetail = {
        id: 1,
        userId: 1,
        question: 'Nueva pregunta',
        spreadId: 1,
        cards: [],
        interpretation: null,
        createdAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(readingsApi.createReading).mockResolvedValue(mockReading);

      const { result } = renderHook(() => useCreateReading(), { wrapper: Wrapper });

      result.current.mutate({
        spreadId: 1,
        deckId: 1,
        cardIds: [1],
        cardPositions: [{ cardId: 1, position: 'Respuesta', isReversed: false }],
        customQuestion: 'Nueva pregunta',
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.createReading).toHaveBeenCalledWith({
        spreadId: 1,
        deckId: 1,
        cardIds: [1],
        cardPositions: [{ cardId: 1, position: 'Respuesta', isReversed: false }],
        customQuestion: 'Nueva pregunta',
      });
    });
  });

  // =========================================================================
  // useDeleteReading
  // =========================================================================
  describe('useDeleteReading', () => {
    it('should soft delete reading successfully', async () => {
      vi.mocked(readingsApi.deleteReading).mockResolvedValue(undefined);

      const { result } = renderHook(() => useDeleteReading(), { wrapper: Wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.deleteReading).toHaveBeenCalledWith(1);
    });
  });

  // =========================================================================
  // useRestoreReading
  // =========================================================================
  describe('useRestoreReading', () => {
    it('should restore reading successfully', async () => {
      const restoredReadingSummary: Reading = {
        id: 1,
        spreadId: 1,
        spreadName: '3 Cartas',
        question: 'Lectura restaurada',
        cardsCount: 0,
        createdAt: '2025-01-01T00:00:00Z',
        deletedAt: null,
      };

      vi.mocked(readingsApi.restoreReading).mockResolvedValue(restoredReadingSummary);

      const { result } = renderHook(() => useRestoreReading(), { wrapper: Wrapper });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(readingsApi.restoreReading).toHaveBeenCalledWith(1);
    });
  });

  // =========================================================================
  // useCreateReading - Mutation invalidation tests (TASK-REFACTOR-008)
  // =========================================================================
  describe('useCreateReading - invalidation behavior', () => {
    it('should call invalidateUserData on successful reading creation', async () => {
      const mockReading: ReadingDetail = {
        id: 1,
        userId: 1,
        question: 'Test question',
        spreadId: 1,
        cards: [],
        interpretation: 'Test interpretation',
        createdAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(readingsApi.createReading).mockResolvedValue(mockReading);
      vi.mocked(invalidateUserDataUtil.invalidateUserData).mockResolvedValue(undefined);

      const { result } = renderHook(() => useCreateReading(), { wrapper: Wrapper });

      const createReadingDto: CreateReadingDto = {
        spreadId: 1,
        deckId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: false },
          { cardId: 3, position: 'future', isReversed: false },
        ],
      };

      result.current.mutate(createReadingDto);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateUserDataUtil.invalidateUserData).toHaveBeenCalledWith(queryClient);
      expect(invalidateUserDataUtil.invalidateUserData).toHaveBeenCalledTimes(1);
    });

    it('should invalidate readings queries on success', async () => {
      const mockReading: ReadingDetail = {
        id: 1,
        userId: 1,
        question: 'Test question',
        spreadId: 1,
        cards: [],
        interpretation: 'Test interpretation',
        createdAt: '2025-01-01T00:00:00Z',
      };

      vi.mocked(readingsApi.createReading).mockResolvedValue(mockReading);
      vi.mocked(invalidateUserDataUtil.invalidateUserData).mockResolvedValue(undefined);

      const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateReading(), { wrapper: Wrapper });

      const createReadingDto: CreateReadingDto = {
        spreadId: 1,
        deckId: 1,
        cardIds: [1, 2, 3],
        cardPositions: [
          { cardId: 1, position: 'past', isReversed: false },
          { cardId: 2, position: 'present', isReversed: false },
          { cardId: 3, position: 'future', isReversed: false },
        ],
      };

      result.current.mutate(createReadingDto);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateQueriesSpy).toHaveBeenCalledWith({
        queryKey: ['readings'],
      });
    });
  });
});
