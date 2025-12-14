/**
 * Tests for admin-cache-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getCacheAnalytics,
  invalidateAllCache,
  invalidateTarotistaCache,
  invalidateSpreadCache,
  triggerCacheWarming,
} from './admin-cache-api';
import type {
  CacheAnalytics,
  InvalidateCacheResponse,
  TriggerWarmingResponse,
} from '@/types/admin-cache.types';

vi.mock('./axios-config');

describe('admin-cache-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCacheAnalytics', () => {
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
          {
            tarotistaName: 'OpenAI',
            spreadName: 'Tres Cartas',
            categoryName: 'Trabajo',
            hitCount: 38,
            lastUpdated: '2025-12-14T09:30:00Z',
          },
        ],
        warmingStatus: {
          isRunning: false,
          lastExecutionAt: '2025-12-14T08:00:00Z',
          nextScheduledAt: '2025-12-15T08:00:00Z',
          entriesWarmed: 120,
        },
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

  describe('invalidateAllCache', () => {
    it('should invalidate all cache successfully', async () => {
      // Arrange
      const mockResponse: InvalidateCacheResponse = {
        entriesDeleted: 150,
        message: 'All cache invalidated successfully',
      };

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await invalidateAllCache();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(apiClient.delete).toHaveBeenCalledWith('/admin/cache/invalidate');
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
    it('should invalidate cache for specific tarotista', async () => {
      // Arrange
      const tarotistaId = 1;
      const mockResponse: InvalidateCacheResponse = {
        entriesDeleted: 45,
        message: 'Tarotista cache invalidated successfully',
      };

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await invalidateTarotistaCache(tarotistaId);

      // Assert
      expect(result).toEqual(mockResponse);
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

  describe('invalidateSpreadCache', () => {
    it('should invalidate cache for specific spread', async () => {
      // Arrange
      const spreadId = 2;
      const mockResponse: InvalidateCacheResponse = {
        entriesDeleted: 30,
        message: 'Spread cache invalidated successfully',
      };

      vi.mocked(apiClient.delete).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await invalidateSpreadCache(spreadId);

      // Assert
      expect(result).toEqual(mockResponse);
      expect(apiClient.delete).toHaveBeenCalledWith('/admin/cache/spreads/2');
    });

    it('should throw error when API fails', async () => {
      // Arrange
      const error = new Error('Spread not found');
      vi.mocked(apiClient.delete).mockRejectedValue(error);

      // Act & Assert
      await expect(invalidateSpreadCache(999)).rejects.toThrow('Spread not found');
    });
  });

  describe('triggerCacheWarming', () => {
    it('should trigger cache warming successfully', async () => {
      // Arrange
      const mockResponse: TriggerWarmingResponse = {
        status: 'success',
        message: 'Cache warming triggered',
        entriesWarmed: 120,
      };

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      // Act
      const result = await triggerCacheWarming();

      // Assert
      expect(result).toEqual(mockResponse);
      expect(apiClient.post).toHaveBeenCalledWith('/admin/cache/warming/trigger');
    });

    it('should throw error when warming is already running', async () => {
      // Arrange
      const error = new Error('Warming already in progress');
      vi.mocked(apiClient.post).mockRejectedValue(error);

      // Act & Assert
      await expect(triggerCacheWarming()).rejects.toThrow('Warming already in progress');
    });
  });
});
