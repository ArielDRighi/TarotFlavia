/**
 * Tests para admin-ai-usage-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { getAIUsageStats } from './admin-ai-usage-api';

vi.mock('./axios-config');

describe('admin-ai-usage-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAIUsageStats', () => {
    it('should call API without date filters when no params provided', async () => {
      const mockResponse = {
        data: {
          statistics: [],
          groqCallsToday: 100,
          groqRateLimitAlert: false,
          highErrorRateAlert: false,
          highFallbackRateAlert: false,
          highDailyCostAlert: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const result = await getAIUsageStats();

      expect(apiClient.get).toHaveBeenCalledWith('/admin/ai-usage', {
        params: {},
      });
      expect(result).toEqual(mockResponse.data);
    });

    it('should call API with startDate filter', async () => {
      const mockResponse = {
        data: {
          statistics: [],
          groqCallsToday: 100,
          groqRateLimitAlert: false,
          highErrorRateAlert: false,
          highFallbackRateAlert: false,
          highDailyCostAlert: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const startDate = '2025-01-01';
      await getAIUsageStats(startDate);

      expect(apiClient.get).toHaveBeenCalledWith('/admin/ai-usage', {
        params: { startDate },
      });
    });

    it('should call API with both startDate and endDate filters', async () => {
      const mockResponse = {
        data: {
          statistics: [],
          groqCallsToday: 100,
          groqRateLimitAlert: false,
          highErrorRateAlert: false,
          highFallbackRateAlert: false,
          highDailyCostAlert: false,
        },
      };

      vi.mocked(apiClient.get).mockResolvedValue(mockResponse);

      const startDate = '2025-01-01';
      const endDate = '2025-01-31';
      await getAIUsageStats(startDate, endDate);

      expect(apiClient.get).toHaveBeenCalledWith('/admin/ai-usage', {
        params: { startDate, endDate },
      });
    });

    it('should return AI usage statistics', async () => {
      const mockData = {
        statistics: [
          {
            provider: 'GROQ' as const,
            totalCalls: 1000,
            successfulCalls: 950,
            failedCalls: 50,
            errorRate: 5.0,
            totalTokens: 100000,
            inputTokens: 60000,
            outputTokens: 40000,
            averageLatency: 250,
            totalCost: 0.1234,
          },
        ],
        groqCallsToday: 100,
        groqRateLimitAlert: true,
        highErrorRateAlert: false,
        highFallbackRateAlert: false,
        highDailyCostAlert: false,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockData });

      const result = await getAIUsageStats();

      expect(result).toEqual(mockData);
      expect(result.statistics[0].provider).toBe('GROQ');
      expect(result.statistics[0].totalCalls).toBe(1000);
      expect(result.groqRateLimitAlert).toBe(true);
    });
  });
});
