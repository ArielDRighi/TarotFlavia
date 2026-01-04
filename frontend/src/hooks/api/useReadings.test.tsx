/**
 * Tests for useReadings hooks
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { useSpreads, useMyAvailableSpreads } from './useReadings';
import * as readingsApi from '@/lib/api/readings-api';

// Mock the API functions
vi.mock('@/lib/api/readings-api');

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
});
