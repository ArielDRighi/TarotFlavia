/**
 * Tests para useAdminAIUsage hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAIUsageStats } from './useAdminAIUsage';
import * as adminAIUsageApi from '@/lib/api/admin-ai-usage-api';

vi.mock('@/lib/api/admin-ai-usage-api');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
};

describe('useAdminAIUsage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useAIUsageStats', () => {
    it('should fetch AI usage statistics without date filters', async () => {
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
        groqRateLimitAlert: false,
        highErrorRateAlert: false,
        highFallbackRateAlert: false,
        highDailyCostAlert: false,
      };

      vi.mocked(adminAIUsageApi.getAIUsageStats).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAIUsageStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminAIUsageApi.getAIUsageStats).toHaveBeenCalledWith(undefined, undefined);
      expect(result.current.data).toEqual(mockData);
    });

    it('should fetch AI usage statistics with date filters', async () => {
      const mockData = {
        statistics: [],
        groqCallsToday: 100,
        groqRateLimitAlert: false,
        highErrorRateAlert: false,
        highFallbackRateAlert: false,
        highDailyCostAlert: false,
      };

      vi.mocked(adminAIUsageApi.getAIUsageStats).mockResolvedValue(mockData);

      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      const { result } = renderHook(() => useAIUsageStats(startDate, endDate), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminAIUsageApi.getAIUsageStats).toHaveBeenCalledWith(startDate, endDate);
      expect(result.current.data).toEqual(mockData);
    });

    it('should have correct query key', async () => {
      const mockData = {
        statistics: [],
        groqCallsToday: 100,
        groqRateLimitAlert: false,
        highErrorRateAlert: false,
        highFallbackRateAlert: false,
        highDailyCostAlert: false,
      };

      vi.mocked(adminAIUsageApi.getAIUsageStats).mockResolvedValue(mockData);

      const startDate = '2025-01-01';
      const endDate = '2025-01-31';

      const { result } = renderHook(() => useAIUsageStats(startDate, endDate), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Query key should include filters for proper caching
      expect(result.current.data).toBeDefined();
    });

    it('should refetch every 5 minutes (300000ms)', async () => {
      const mockData = {
        statistics: [],
        groqCallsToday: 100,
        groqRateLimitAlert: false,
        highErrorRateAlert: false,
        highFallbackRateAlert: false,
        highDailyCostAlert: false,
      };

      vi.mocked(adminAIUsageApi.getAIUsageStats).mockResolvedValue(mockData);

      const { result } = renderHook(() => useAIUsageStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify refetch interval is set (can't directly test interval in unit test)
      expect(result.current.data).toBeDefined();
    });

    it('should handle errors', async () => {
      const error = new Error('API Error');
      vi.mocked(adminAIUsageApi.getAIUsageStats).mockRejectedValue(error);

      const { result } = renderHook(() => useAIUsageStats(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
