/**
 * Tests for usePlatformMetrics hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePlatformMetrics } from './usePlatformMetrics';
import * as platformMetricsApi from '@/lib/api/platform-metrics-api';
import type { PlatformMetricsDto } from '@/types';
import { MetricsPeriod } from '@/types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/platform-metrics-api');

// Helper to create QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('usePlatformMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch platform metrics with default period (MONTH)', async () => {
    const mockData: PlatformMetricsDto = {
      totalReadings: 1500,
      totalRevenueShare: 52500.0,
      totalPlatformFee: 22500.0,
      totalGrossRevenue: 75000.0,
      activeTarotistas: 10,
      activeUsers: 500,
      period: {
        start: new Date('2024-12-01T00:00:00Z'),
        end: new Date('2024-12-31T23:59:59Z'),
      },
      topTarotistas: [
        {
          tarotistaId: 1,
          nombrePublico: 'Luna Misteriosa',
          totalReadings: 150,
          totalRevenueShare: 5250.0,
          totalPlatformFee: 2250.0,
          totalGrossRevenue: 7500.0,
          averageRating: 4.8,
          totalReviews: 50,
          period: {
            start: new Date('2024-12-01T00:00:00Z'),
            end: new Date('2024-12-31T23:59:59Z'),
          },
        },
      ],
    };

    vi.mocked(platformMetricsApi.getPlatformMetrics).mockResolvedValue(mockData);

    const { result } = renderHook(() => usePlatformMetrics(MetricsPeriod.MONTH), {
      wrapper: createWrapper(),
    });

    // Initially loading
    expect(result.current.isLoading).toBe(true);

    // Wait for data
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenCalledWith({
      period: MetricsPeriod.MONTH,
    });
  });

  it('should fetch platform metrics with WEEK period', async () => {
    const mockData: PlatformMetricsDto = {
      totalReadings: 350,
      totalRevenueShare: 12250.0,
      totalPlatformFee: 5250.0,
      totalGrossRevenue: 17500.0,
      activeTarotistas: 8,
      activeUsers: 150,
      period: {
        start: new Date('2024-12-08T00:00:00Z'),
        end: new Date('2024-12-14T23:59:59Z'),
      },
      topTarotistas: [],
    };

    vi.mocked(platformMetricsApi.getPlatformMetrics).mockResolvedValue(mockData);

    const { result } = renderHook(() => usePlatformMetrics(MetricsPeriod.WEEK), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenCalledWith({
      period: MetricsPeriod.WEEK,
    });
  });

  it('should fetch platform metrics with custom date range', async () => {
    const mockData: PlatformMetricsDto = {
      totalReadings: 500,
      totalRevenueShare: 17500.0,
      totalPlatformFee: 7500.0,
      totalGrossRevenue: 25000.0,
      activeTarotistas: 5,
      activeUsers: 200,
      period: {
        start: new Date('2024-11-01T00:00:00Z'),
        end: new Date('2024-11-15T23:59:59Z'),
      },
      topTarotistas: [],
    };

    vi.mocked(platformMetricsApi.getPlatformMetrics).mockResolvedValue(mockData);

    const { result } = renderHook(
      () =>
        usePlatformMetrics(MetricsPeriod.CUSTOM, {
          startDate: '2024-11-01T00:00:00Z',
          endDate: '2024-11-15T23:59:59Z',
        }),
      {
        wrapper: createWrapper(),
      }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockData);
    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenCalledWith({
      period: MetricsPeriod.CUSTOM,
      startDate: '2024-11-01T00:00:00Z',
      endDate: '2024-11-15T23:59:59Z',
    });
  });

  it('should handle API errors', async () => {
    const error = new Error('Failed to fetch platform metrics');
    vi.mocked(platformMetricsApi.getPlatformMetrics).mockRejectedValue(error);

    const { result } = renderHook(() => usePlatformMetrics(MetricsPeriod.MONTH), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should refetch when period changes', async () => {
    const mockDataMonth: PlatformMetricsDto = {
      totalReadings: 1500,
      totalRevenueShare: 52500.0,
      totalPlatformFee: 22500.0,
      totalGrossRevenue: 75000.0,
      activeTarotistas: 10,
      activeUsers: 500,
      period: {
        start: new Date('2024-12-01T00:00:00Z'),
        end: new Date('2024-12-31T23:59:59Z'),
      },
      topTarotistas: [],
    };

    const mockDataWeek: PlatformMetricsDto = {
      totalReadings: 350,
      totalRevenueShare: 12250.0,
      totalPlatformFee: 5250.0,
      totalGrossRevenue: 17500.0,
      activeTarotistas: 8,
      activeUsers: 150,
      period: {
        start: new Date('2024-12-08T00:00:00Z'),
        end: new Date('2024-12-14T23:59:59Z'),
      },
      topTarotistas: [],
    };

    vi.mocked(platformMetricsApi.getPlatformMetrics)
      .mockResolvedValueOnce(mockDataMonth)
      .mockResolvedValueOnce(mockDataWeek);

    const { result, rerender } = renderHook(({ period }) => usePlatformMetrics(period), {
      wrapper: createWrapper(),
      initialProps: { period: MetricsPeriod.MONTH },
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockDataMonth);

    // Change period
    rerender({ period: MetricsPeriod.WEEK });

    await waitFor(() => expect(result.current.data).toEqual(mockDataWeek));

    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenCalledTimes(2);
    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenNthCalledWith(1, {
      period: MetricsPeriod.MONTH,
    });
    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenNthCalledWith(2, {
      period: MetricsPeriod.WEEK,
    });
  });

  it('should use default period MONTH when no period provided', async () => {
    const mockData: PlatformMetricsDto = {
      totalReadings: 1500,
      totalRevenueShare: 52500.0,
      totalPlatformFee: 22500.0,
      totalGrossRevenue: 75000.0,
      activeTarotistas: 10,
      activeUsers: 500,
      period: {
        start: new Date('2024-12-01T00:00:00Z'),
        end: new Date('2024-12-31T23:59:59Z'),
      },
      topTarotistas: [],
    };

    vi.mocked(platformMetricsApi.getPlatformMetrics).mockResolvedValue(mockData);

    const { result } = renderHook(() => usePlatformMetrics(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(platformMetricsApi.getPlatformMetrics).toHaveBeenCalledWith({
      period: MetricsPeriod.MONTH,
    });
  });
});
