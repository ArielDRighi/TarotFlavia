/**
 * Tests for useCacheAnalytics hooks
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';
import {
  useCacheAnalytics,
  useInvalidateAllCache,
  useInvalidateTarotistaCache,
  useInvalidateSpreadCache,
  useTriggerCacheWarming,
} from './useCacheAnalytics';
import * as api from '@/lib/api/admin-cache-api';
import type {
  CacheAnalytics,
  InvalidateCacheResponse,
  TriggerWarmingResponse,
} from '@/types/admin-cache.types';

// Mock del API
vi.mock('@/lib/api/admin-cache-api');

describe('useCacheAnalytics', () => {
  let queryClient: QueryClient;

  const wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
        mutations: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  describe('useCacheAnalytics', () => {
    it('should fetch cache analytics successfully', async () => {
      // Arrange
      const mockData: CacheAnalytics = {
        stats: {
          totalEntries: 150,
          hitRate: 85.5,
          missRate: 14.5,
          memoryUsageMB: 25.3,
        },
        topCombinations: [
          {
            tarotistaName: 'Groq',
            spreadName: 'Cruz Celta',
            categoryName: 'Amor',
            hitCount: 45,
            lastUpdated: '2025-12-14T10:00:00Z',
          },
        ],
        warmingStatus: {
          isRunning: false,
          lastExecutionAt: '2025-12-14T08:00:00Z',
          nextScheduledAt: '2025-12-15T08:00:00Z',
          entriesWarmed: 120,
        },
      };

      vi.mocked(api.getCacheAnalytics).mockResolvedValue(mockData);

      // Act
      const { result } = renderHook(() => useCacheAnalytics(), {
        wrapper,
      });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockData);
      expect(api.getCacheAnalytics).toHaveBeenCalledTimes(1);
    });

    it('should handle error when fetching fails', async () => {
      // Arrange
      const error = new Error('API Error');
      vi.mocked(api.getCacheAnalytics).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useCacheAnalytics(), {
        wrapper,
      });

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });

    it('should refetch on window focus', async () => {
      // Arrange
      const mockData: CacheAnalytics = {
        stats: {
          totalEntries: 150,
          hitRate: 85.5,
          missRate: 14.5,
          memoryUsageMB: 25.3,
        },
        topCombinations: [],
        warmingStatus: {
          isRunning: false,
          lastExecutionAt: null,
          nextScheduledAt: null,
          entriesWarmed: 0,
        },
      };

      vi.mocked(api.getCacheAnalytics).mockResolvedValue(mockData);

      // Act
      const { result } = renderHook(() => useCacheAnalytics(), {
        wrapper,
      });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.refetch).toBeDefined();
    });
  });

  describe('useInvalidateAllCache', () => {
    it('should invalidate all cache successfully', async () => {
      // Arrange
      const mockResponse: InvalidateCacheResponse = {
        entriesDeleted: 150,
        message: 'All cache invalidated',
      };

      vi.mocked(api.invalidateAllCache).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useInvalidateAllCache(), {
        wrapper,
      });

      result.current.mutate();

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(api.invalidateAllCache).toHaveBeenCalledTimes(1);
    });

    it('should handle error when invalidation fails', async () => {
      // Arrange
      const error = new Error('Forbidden');
      vi.mocked(api.invalidateAllCache).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useInvalidateAllCache(), {
        wrapper,
      });

      result.current.mutate();

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useInvalidateTarotistaCache', () => {
    it('should invalidate tarotista cache successfully', async () => {
      // Arrange
      const mockResponse: InvalidateCacheResponse = {
        entriesDeleted: 45,
        message: 'Tarotista cache invalidated',
      };

      vi.mocked(api.invalidateTarotistaCache).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useInvalidateTarotistaCache(), {
        wrapper,
      });

      result.current.mutate(1);

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(api.invalidateTarotistaCache).toHaveBeenCalled();
      expect(vi.mocked(api.invalidateTarotistaCache).mock.calls[0][0]).toBe(1);
    });

    it('should handle error when invalidation fails', async () => {
      // Arrange
      const error = new Error('Tarotista not found');
      vi.mocked(api.invalidateTarotistaCache).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useInvalidateTarotistaCache(), {
        wrapper,
      });

      result.current.mutate(999);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useInvalidateSpreadCache', () => {
    it('should invalidate spread cache successfully', async () => {
      // Arrange
      const mockResponse: InvalidateCacheResponse = {
        entriesDeleted: 30,
        message: 'Spread cache invalidated',
      };

      vi.mocked(api.invalidateSpreadCache).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useInvalidateSpreadCache(), {
        wrapper,
      });

      result.current.mutate(2);

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(api.invalidateSpreadCache).toHaveBeenCalled();
      expect(vi.mocked(api.invalidateSpreadCache).mock.calls[0][0]).toBe(2);
    });

    it('should handle error when invalidation fails', async () => {
      // Arrange
      const error = new Error('Spread not found');
      vi.mocked(api.invalidateSpreadCache).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useInvalidateSpreadCache(), {
        wrapper,
      });

      result.current.mutate(999);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useTriggerCacheWarming', () => {
    it('should trigger cache warming successfully', async () => {
      // Arrange
      const mockResponse: TriggerWarmingResponse = {
        status: 'success',
        message: 'Cache warming triggered',
        entriesWarmed: 120,
      };

      vi.mocked(api.triggerCacheWarming).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useTriggerCacheWarming(), {
        wrapper,
      });

      result.current.mutate();

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockResponse);
      expect(api.triggerCacheWarming).toHaveBeenCalledTimes(1);
    });

    it('should handle error when warming is already running', async () => {
      // Arrange
      const error = new Error('Warming already in progress');
      vi.mocked(api.triggerCacheWarming).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useTriggerCacheWarming(), {
        wrapper,
      });

      result.current.mutate();

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
