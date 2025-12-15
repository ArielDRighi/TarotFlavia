/**
 * Tests for useCacheAnalytics hooks
 * Actualizado con estructura real del backend (analytics + warming separados)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  useCacheAnalytics,
  useCacheWarmingStatus,
  useInvalidateAllCache,
  useInvalidateTarotistaCache,
  useTriggerCacheWarming,
} from './useCacheAnalytics';
import * as api from '@/lib/api/admin-cache-api';
import type { CacheAnalytics, WarmingStatus } from '@/types/admin-cache.types';

vi.mock('@/lib/api/admin-cache-api');

describe('useCacheAnalytics hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    vi.clearAllMocks();
  });

  describe('useCacheAnalytics', () => {
    it('should fetch analytics with correct structure', async () => {
      // Arrange
      const mockAnalytics: CacheAnalytics = {
        hitRate: {
          percentage: 85.5,
          totalRequests: 1000,
          cacheHits: 855,
          cacheMisses: 145,
          windowHours: 24,
        },
        savings: {
          openaiSavings: 1.5,
          deepseekSavings: 0.27,
          groqRateLimitSaved: 855,
          groqRateLimitPercentage: 5.9,
        },
        responseTime: {
          cacheAvg: 50,
          aiAvg: 1500,
          improvementFactor: 30,
        },
        topCombinations: [],
        generatedAt: '2025-12-14T12:00:00Z',
      };

      vi.mocked(api.getCacheAnalytics).mockResolvedValue(mockAnalytics);

      // Act
      const { result } = renderHook(() => useCacheAnalytics(), { wrapper });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockAnalytics);
      expect(api.getCacheAnalytics).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(api.getCacheAnalytics).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useCacheAnalytics(), { wrapper });

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useCacheWarmingStatus', () => {
    it('should fetch warming status from separate endpoint', async () => {
      // Arrange
      const mockStatus: WarmingStatus = {
        isRunning: true,
        progress: 45.5,
        totalCombinations: 100,
        processedCombinations: 45,
        successCount: 43,
        errorCount: 2,
        estimatedTimeRemainingMinutes: 5,
      };

      vi.mocked(api.getCacheWarmingStatus).mockResolvedValue(mockStatus);

      // Act
      const { result } = renderHook(() => useCacheWarmingStatus(), { wrapper });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStatus);
      expect(api.getCacheWarmingStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle inactive status', async () => {
      // Arrange
      const mockStatus: WarmingStatus = {
        isRunning: false,
        progress: 0,
        totalCombinations: 0,
        processedCombinations: 0,
        successCount: 0,
        errorCount: 0,
        estimatedTimeRemainingMinutes: 0,
      };

      vi.mocked(api.getCacheWarmingStatus).mockResolvedValue(mockStatus);

      // Act
      const { result } = renderHook(() => useCacheWarmingStatus(), { wrapper });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.isRunning).toBe(false);
    });
  });

  describe('useInvalidateAllCache', () => {
    it('should invalidate all cache and refresh analytics', async () => {
      // Arrange
      const mockResponse = {
        deletedCount: 150,
        message: 'All cache cleared',
        timestamp: '2025-12-14T12:00:00Z',
      };

      vi.mocked(api.invalidateAllCache).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useInvalidateAllCache(), { wrapper });
      result.current.mutate(undefined);

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.invalidateAllCache).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle errors during invalidation', async () => {
      // Arrange
      const error = new Error('Forbidden');
      vi.mocked(api.invalidateAllCache).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useInvalidateAllCache(), { wrapper });
      result.current.mutate(undefined);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useInvalidateTarotistaCache', () => {
    it('should invalidate tarotista cache with deletedCount', async () => {
      // Arrange
      const tarotistaId = 1;
      const mockResponse = {
        deletedCount: 45,
        message: 'Cache invalidated for tarotista 1',
        timestamp: '2025-12-14T12:00:00Z',
        reason: 'manual-invalidation',
      };

      vi.mocked(api.invalidateTarotistaCache).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useInvalidateTarotistaCache(), { wrapper });
      result.current.mutate(tarotistaId);

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(api.invalidateTarotistaCache).mock.calls[0][0]).toBe(tarotistaId);
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Tarotista not found');
      vi.mocked(api.invalidateTarotistaCache).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useInvalidateTarotistaCache(), { wrapper });
      result.current.mutate(999);

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });

  describe('useTriggerCacheWarming', () => {
    it('should trigger warming with topN parameter', async () => {
      // Arrange
      const mockResponse = {
        started: true,
        totalCombinations: 100,
        estimatedTimeMinutes: 10,
        message: 'Cache warming started',
      };

      vi.mocked(api.triggerCacheWarming).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useTriggerCacheWarming(), { wrapper });
      result.current.mutate({ topN: 100 });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(vi.mocked(api.triggerCacheWarming).mock.calls[0][0]).toBe(100);
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle warming already running', async () => {
      // Arrange
      const mockResponse = {
        started: false,
        message: 'Warming already in progress',
      };

      vi.mocked(api.triggerCacheWarming).mockResolvedValue(mockResponse);

      // Act
      const { result } = renderHook(() => useTriggerCacheWarming(), { wrapper });
      result.current.mutate({ topN: 50 });

      // Assert
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.started).toBe(false);
    });

    it('should handle errors', async () => {
      // Arrange
      const error = new Error('Internal server error');
      vi.mocked(api.triggerCacheWarming).mockRejectedValue(error);

      // Act
      const { result } = renderHook(() => useTriggerCacheWarming(), { wrapper });
      result.current.mutate({});

      // Assert
      await waitFor(() => expect(result.current.isError).toBe(true));
      expect(result.current.error).toEqual(error);
    });
  });
});
