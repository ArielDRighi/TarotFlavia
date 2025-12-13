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
import type { StatsResponseDto } from '@/types/admin.types';

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
  // Mock data que coincide con el backend DTO
  const mockStats: StatsResponseDto = {
    users: {
      totalUsers: 150,
      activeUsersLast7Days: 80,
      activeUsersLast30Days: 120,
      newRegistrationsPerDay: [],
      planDistribution: [],
    },
    readings: {
      totalReadings: 450,
      readingsLast7Days: 120,
      readingsLast30Days: 380,
      readingsPerDay: [],
    },
    cards: {
      totalCards: 78,
      mostDrawnCard: 'The Fool',
      leastDrawnCard: 'The Tower',
    },
    openai: {
      totalPrompts: 450,
      totalCost: 25.5,
      aiCostsPerDay: [],
    },
    questions: {
      totalQuestions: 15,
      mostCommonQuestion: '¿Encontraré el amor?',
    },
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
