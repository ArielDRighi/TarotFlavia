/**
 * Tests for usePendulum hooks
 *
 * Following TDD pattern - RED phase (tests written first)
 * Tests will fail until implementation is created
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React, { type ReactNode } from 'react';
import * as pendulumApi from '@/lib/api/pendulum-api';
import {
  usePendulumQuery,
  usePendulumHistory,
  usePendulumStats,
  useDeletePendulumQuery,
  usePendulumCapabilities,
  pendulumKeys,
} from './usePendulum';
import type {
  PendulumQueryResponse,
  PendulumHistoryItem,
  PendulumStats,
} from '@/types/pendulum.types';

// Mock the API functions
vi.mock('@/lib/api/pendulum-api');
vi.mock('./useUserCapabilities', () => ({
  useUserCapabilities: vi.fn(() => ({
    data: {
      pendulum: {
        used: 0,
        limit: 3,
        canUse: true,
        resetAt: null,
        period: 'monthly' as const,
      },
    },
  })),
  capabilitiesQueryKeys: {
    capabilities: ['capabilities'],
  },
}));

const mockQueryPendulum = vi.mocked(pendulumApi.queryPendulum);
const mockGetPendulumHistory = vi.mocked(pendulumApi.getPendulumHistory);
const mockGetPendulumStats = vi.mocked(pendulumApi.getPendulumStats);
const mockDeletePendulumQuery = vi.mocked(pendulumApi.deletePendulumQuery);

// Test wrapper with QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return function Wrapper({ children }: { children: ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('usePendulum hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('pendulumKeys', () => {
    it('should generate correct query keys', () => {
      expect(pendulumKeys.all).toEqual(['pendulum']);
      expect(pendulumKeys.history()).toEqual(['pendulum', 'history', {}]);
      expect(pendulumKeys.history(10)).toEqual(['pendulum', 'history', { limit: 10 }]);
      expect(pendulumKeys.history(10, 'yes')).toEqual([
        'pendulum',
        'history',
        { limit: 10, filter: 'yes' },
      ]);
      expect(pendulumKeys.stats()).toEqual(['pendulum', 'stats']);
    });
  });

  describe('usePendulumQuery', () => {
    it('should call queryPendulum mutation function', async () => {
      const mockResponse: PendulumQueryResponse = {
        response: 'yes',
        movement: 'vertical',
        responseText: 'Sí',
        interpretation: 'El universo afirma tu camino.',
        queryId: 1,
        lunarPhase: '🌕',
        lunarPhaseName: 'Luna Llena',
      };

      mockQueryPendulum.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePendulumQuery(), {
        wrapper: createWrapper(),
      });

      const promise = result.current.mutateAsync({ question: '¿Debo continuar?' });

      await promise;

      expect(mockQueryPendulum).toHaveBeenCalledWith({ question: '¿Debo continuar?' });
    });

    it('should handle query without question', async () => {
      const mockResponse: PendulumQueryResponse = {
        response: 'no',
        movement: 'horizontal',
        responseText: 'No',
        interpretation: 'El universo sugiere otra dirección.',
        queryId: null,
        lunarPhase: '🌑',
        lunarPhaseName: 'Luna Nueva',
      };

      mockQueryPendulum.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => usePendulumQuery(), {
        wrapper: createWrapper(),
      });

      const promise = result.current.mutateAsync({});

      await promise;

      expect(mockQueryPendulum).toHaveBeenCalledWith({});
    });

    it('should handle error response', async () => {
      const error = new Error('Límite alcanzado');
      mockQueryPendulum.mockRejectedValue(error);

      const { result } = renderHook(() => usePendulumQuery(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({ question: '¿Será posible?' });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('usePendulumHistory', () => {
    it('should fetch history without filters', async () => {
      const mockHistory: PendulumHistoryItem[] = [
        {
          id: 1,
          question: '¿Debo aceptar?',
          response: 'yes',
          interpretation: 'El universo afirma.',
          lunarPhase: '🌕',
          createdAt: '2026-02-04T10:00:00Z',
        },
        {
          id: 2,
          question: null,
          response: 'no',
          interpretation: 'El universo sugiere esperar.',
          lunarPhase: '🌑',
          createdAt: '2026-02-03T10:00:00Z',
        },
      ];

      mockGetPendulumHistory.mockResolvedValue(mockHistory);

      const { result } = renderHook(() => usePendulumHistory(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetPendulumHistory).toHaveBeenCalledWith(undefined, undefined);
      expect(result.current.data).toEqual(mockHistory);
    });

    it('should fetch history with limit', async () => {
      const mockHistory: PendulumHistoryItem[] = [
        {
          id: 1,
          question: '¿Continúo?',
          response: 'maybe',
          interpretation: 'El universo guarda silencio.',
          lunarPhase: '🌓',
          createdAt: '2026-02-04T10:00:00Z',
        },
      ];

      mockGetPendulumHistory.mockResolvedValue(mockHistory);

      const { result } = renderHook(() => usePendulumHistory(10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetPendulumHistory).toHaveBeenCalledWith(10, undefined);
      expect(result.current.data).toEqual(mockHistory);
    });

    it('should fetch history with response filter', async () => {
      const mockHistory: PendulumHistoryItem[] = [
        {
          id: 1,
          question: '¿Sí?',
          response: 'yes',
          interpretation: 'Afirmativo.',
          lunarPhase: '🌕',
          createdAt: '2026-02-04T10:00:00Z',
        },
      ];

      mockGetPendulumHistory.mockResolvedValue(mockHistory);

      const { result } = renderHook(() => usePendulumHistory(20, 'yes'), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetPendulumHistory).toHaveBeenCalledWith(20, 'yes');
      expect(result.current.data).toEqual(mockHistory);
    });
  });

  describe('usePendulumStats', () => {
    it('should fetch pendulum stats', async () => {
      const mockStats: PendulumStats = {
        total: 25,
        yesCount: 10,
        noCount: 10,
        maybeCount: 5,
      };

      mockGetPendulumStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => usePendulumStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockGetPendulumStats).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockStats);
    });

    it('should handle empty stats', async () => {
      const mockStats: PendulumStats = {
        total: 0,
        yesCount: 0,
        noCount: 0,
        maybeCount: 0,
      };

      mockGetPendulumStats.mockResolvedValue(mockStats);

      const { result } = renderHook(() => usePendulumStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockStats);
    });
  });

  describe('useDeletePendulumQuery', () => {
    it('should delete a pendulum query', async () => {
      mockDeletePendulumQuery.mockResolvedValue();

      const { result } = renderHook(() => useDeletePendulumQuery(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(1);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockDeletePendulumQuery).toHaveBeenCalledWith(1);
    });

    it('should handle deletion error', async () => {
      const error = new Error('No autorizado');
      mockDeletePendulumQuery.mockRejectedValue(error);

      const { result } = renderHook(() => useDeletePendulumQuery(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(999);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(error);
    });
  });

  describe('usePendulumCapabilities', () => {
    it('should return pendulum capabilities from useUserCapabilities', () => {
      const { result } = renderHook(() => usePendulumCapabilities());

      expect(result.current).toEqual({
        used: 0,
        limit: 3,
        canUse: true,
        resetAt: null,
        period: 'monthly',
      });
    });
  });
});
