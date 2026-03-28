/**
 * Tests for usePublicPlans hook
 *
 * Tests the TanStack Query hook that fetches public plan configuration
 * from the public endpoint (no authentication required).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePublicPlans } from './usePublicPlans';
import { apiClient } from '@/lib/api/axios-config';
import type { PlanConfig } from '@/types/admin.types';
import React from 'react';

// Mock next/navigation (required by hooks that may import it transitively)
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// Mock axios — test hook→api integration without real HTTP
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Helper to create a fresh QueryClient per test (avoids cache bleed)
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

const mockFreePlan: PlanConfig = {
  id: 1,
  planType: 'free',
  name: 'Plan Gratuito',
  description: 'Empieza tu viaje espiritual',
  price: 0,
  readingsLimit: 3,
  aiQuotaMonthly: 0,
  allowCustomQuestions: false,
  allowSharing: false,
  allowAdvancedSpreads: false,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

const mockPremiumPlan: PlanConfig = {
  id: 2,
  planType: 'premium',
  name: 'Plan Premium',
  description: 'Acceso completo a todas las funciones',
  price: 9.99,
  readingsLimit: -1,
  aiQuotaMonthly: -1,
  allowCustomQuestions: true,
  allowSharing: true,
  allowAdvancedSpreads: true,
  isActive: true,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('usePublicPlans', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should be in loading state initially', () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockFreePlan, mockPremiumPlan] });

    const { result } = renderHook(() => usePublicPlans(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
  });

  it('should return plans when the query succeeds', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockFreePlan, mockPremiumPlan] });

    const { result } = renderHook(() => usePublicPlans(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0].planType).toBe('free');
    expect(result.current.data?.[1].planType).toBe('premium');
  });

  it('should normalize price to number (TypeORM decimal-as-string)', async () => {
    // Backend returns decimal columns as strings at runtime
    const backendResponse = [{ ...mockPremiumPlan, price: '9.99' }];

    vi.mocked(apiClient.get).mockResolvedValue({ data: backendResponse });

    const { result } = renderHook(() => usePublicPlans(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(typeof result.current.data?.[0].price).toBe('number');
    expect(result.current.data?.[0].price).toBe(9.99);
  });

  it('should set isError when the API fails', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(new Error('Server error'));

    const { result } = renderHook(() => usePublicPlans(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.data).toBeUndefined();
  });

  it('should use the correct query key', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockFreePlan] });

    const queryClient = createTestQueryClient();
    const wrapper = ({ children }: { children: React.ReactNode }) =>
      React.createElement(QueryClientProvider, { client: queryClient }, children);

    const { result } = renderHook(() => usePublicPlans(), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify that data is cached under ['plans', 'public']
    const cachedData = queryClient.getQueryData(['plans', 'public']);
    expect(cachedData).toBeDefined();
  });

  it('should not be stale immediately after a successful fetch (staleTime = 5 minutes)', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockFreePlan, mockPremiumPlan] });

    const { result } = renderHook(() => usePublicPlans(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // staleTime is 5 minutes — data should not be stale right after fetching
    expect(result.current.isStale).toBe(false);
  });
});
