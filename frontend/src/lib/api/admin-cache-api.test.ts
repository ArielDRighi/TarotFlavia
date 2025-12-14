/**
 * Tests for admin-cache-api
 * Actualizado para coincidir con contratos reales del backend
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getCacheAnalytics,
  getCacheWarmingStatus,
  invalidateAllCache,
  invalidateTarotistaCache,
  triggerCacheWarming,
} from './admin-cache-api';
import type {
  CacheAnalytics,
  WarmingStatus,
  InvalidateCacheResponse,
  TriggerWarmingResponse,
} from '@/types/admin-cache.types';

vi.mock('./axios-config');

describe('admin-cache-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCacheAnalytics', () => {
    it('should fetch cache analytics with correct structure', async () => {
      // Arrange - estructura real del backend
      const mockData: CacheAnalytics = {
        hitRate: {
          percentage: 85.5,
          totalRequests: 1000,
          cacheHits: 855,
          cacheMisses: 145,
          windowHours: 24,
        },
        savings: {
          openaiSavings: 1.5525,
          deepseekSavings: 0.276,
          groqRateLimitSaved: 855,
          groqRateLimitPercentage: 5.9,
        },
        responseTime: {
          cacheAvg: 50,
          aiAvg: 1500,
          improvementFactor: 30,
        },
        topCombinations: [
          {
            cacheKey: 'abc123def456',
            hitCount: 45,
            cardIds: ['1', '5', '10'],
            spreadId: 2,
            lastUsedAt: '2025-12-14T10:00:00Z',
          },
        ],
        generatedAt: '2025-12-14T12:00:00Z',
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      // Act
      const result = await getCacheAnalytics();

      // Assert
      expect(result).toEqual(mockData);
      expect(apiClient.get).toHaveBeenCalledWith('/admin/cache/analytics');
    });

    it('should throw error when API fails', async () => {
      // Arrange
      const error = new Error('Network error');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      // Act & Assert
      await expect(getCacheAnalytics()).rejects.toThrow('Network error');
    });
  });

  describe('getCacheWarmingStatus', () => {
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      // Act
      const result = await getCacheWarmingStatus();

      // Assert
      expect(result).toEqual(mockStatus);
      expect(apiClient.get).toHaveBeenCalledWith('/admin/cache/warm/status');
    });

    it('should handle inactive warming status', async () => {
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      // Act
      const result = await getCacheWarmingStatus();

      // Assert
      expect(result.isRunning).toBe(false);
    });
  });

  describe('invalidateAllCache', () => {
    it('should call correct endpoint with deletedCount response', async () => {
      // Arrange - estructura real del backend
      const mockResponse: InvalidateCacheResponse = {
        deletedCount: 150,
        message: 'All cache cleared successfully',
        timestamp: '2025-12-14T12:00:00Z',
      };

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await invalidateAllCache();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(apiClient.delete).toHaveBeenCalledWith('/admin/cache/global');
    });

    it('should throw error when API fails', async () => {
      // Arrange
      const error = new Error('Forbidden');
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(invalidateAllCache()).rejects.toThrow('Forbidden');
    });
  });

  describe('invalidateTarotistaCache', () => {
    it('should invalidate cache for specific tarotista with reason', async () => {
      // Arrange
      const tarotistaId = 1;
      const mockResponse: InvalidateCacheResponse = {
        deletedCount: 45,
        message: 'Cache invalidated for tarotista 1',
        timestamp: '2025-12-14T12:00:00Z',
        reason: 'manual-invalidation',
      };

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await invalidateTarotistaCache(tarotistaId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.reason).toBe('manual-invalidation');
      expect(apiClient.delete).toHaveBeenCalledWith('/admin/cache/tarotistas/1');
    });

    it('should throw error when API fails', async () => {
      // Arrange
      const error = new Error('Tarotista not found');
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(invalidateTarotistaCache(999)).rejects.toThrow('Tarotista not found');
    });
  });

  describe('triggerCacheWarming', () => {
    it('should trigger warming with topN parameter', async () => {
      // Arrange - estructura real del backend
      const mockResponse: TriggerWarmingResponse = {
        started: true,
        totalCombinations: 100,
        estimatedTimeMinutes: 10,
        message: 'Cache warming started',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await triggerCacheWarming(100);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(result.started).toBe(true);
      expect(apiClient.post).toHaveBeenCalledWith('/admin/cache/warm', undefined, {
        params: { topN: 100 },
      });
    });

    it('should use default topN when not provided', async () => {
      // Arrange
      const mockResponse: TriggerWarmingResponse = {
        started: true,
        totalCombinations: 100,
        estimatedTimeMinutes: 10,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      await triggerCacheWarming();

      // Assert
      expect(apiClient.post).toHaveBeenCalledWith('/admin/cache/warm', undefined, {
        params: { topN: 100 },
      });
    });

    it('should handle warming already running', async () => {
      // Arrange
      const mockResponse: TriggerWarmingResponse = {
        started: false,
        message: 'Warming already in progress',
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await triggerCacheWarming();

      // Assert
      expect(result.started).toBe(false);
      expect(result.message).toBe('Warming already in progress');
    });

    it('should throw error when warming fails', async () => {
      // Arrange
      const error = new Error('Internal server error');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(triggerCacheWarming()).rejects.toThrow('Internal server error');
    });
  });
});
