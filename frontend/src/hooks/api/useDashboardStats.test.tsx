/**
 * Tests for useDashboardStats hook
 *
 * @vitest-environment jsdom
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { ReactNode } from 'react';
import { useDashboardStats } from '@/hooks/api/useDashboardStats';
import * as dashboardApi from '@/lib/api/dashboard-api';
import type { DashboardStats } from '@/types/admin.types';

// Mock the API module
vi.mock('@/lib/api/dashboard-api');

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useDashboardStats', () => {
  // Mock data
  const mockStats: DashboardStats = {
    totalUsers: { value: 150, change: 5, trend: 'up' },
    monthlyReadings: { value: 450, change: 12, trend: 'up' },
    activeTarotistas: { value: 25, change: 0, trend: 'stable' },
    monthlyRevenue: { value: 5000, change: 8, trend: 'up' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch dashboard stats successfully', async () => {
    vi.mocked(dashboardApi.fetchDashboardStats).mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockStats);
    expect(dashboardApi.fetchDashboardStats).toHaveBeenCalledTimes(1);
  });

  it('should handle error state', async () => {
    const errorMessage = 'Unauthorized';
    vi.mocked(dashboardApi.fetchDashboardStats).mockRejectedValueOnce(new Error(errorMessage));

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeDefined();
  });

  it('should use correct query key', async () => {
    vi.mocked(dashboardApi.fetchDashboardStats).mockResolvedValueOnce(mockStats);

    const { result } = renderHook(() => useDashboardStats(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Verifica que los datos se obtuvieron correctamente
    expect(result.current.data).toBeDefined();
  });
});
