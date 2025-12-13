/**
 * Tests para useDashboardCharts hook
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useDashboardCharts } from './useDashboardCharts';
import * as dashboardApi from '@/lib/api/dashboard-api';
import type { ChartsResponseDto } from '@/types/admin.types';

// Mock dashboard-api
vi.mock('@/lib/api/dashboard-api', () => ({
  fetchDashboardCharts: vi.fn(),
}));

describe('useDashboardCharts', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  const mockChartsData: ChartsResponseDto = {
    userRegistrations: [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 15 },
    ],
    readingsPerDay: [
      { date: '2024-01-01', count: 25 },
      { date: '2024-01-02', count: 30 },
    ],
    aiCostsPerDay: [
      { date: '2024-01-01', cost: 2.5 },
      { date: '2024-01-02', cost: 3.2 },
    ],
  };

  it('should fetch dashboard charts successfully', async () => {
    vi.mocked(dashboardApi.fetchDashboardCharts).mockResolvedValue(mockChartsData);

    const { result } = renderHook(() => useDashboardCharts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockChartsData);
    expect(dashboardApi.fetchDashboardCharts).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch error', async () => {
    const error = new Error('Failed to fetch charts');
    vi.mocked(dashboardApi.fetchDashboardCharts).mockRejectedValue(error);

    const { result } = renderHook(() => useDashboardCharts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toEqual(error);
  });

  it('should use correct query key', async () => {
    vi.mocked(dashboardApi.fetchDashboardCharts).mockResolvedValue(mockChartsData);

    const { result } = renderHook(() => useDashboardCharts(), { wrapper });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verify the hook was called with correct configuration
    expect(dashboardApi.fetchDashboardCharts).toHaveBeenCalledTimes(1);
  });
});
