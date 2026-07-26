/**
 * Tests for useUserCapabilities hook
 *
 * Test suite for the user capabilities hook that fetches and manages
 * user capabilities from the backend capabilities endpoint.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUserCapabilities, useInvalidateCapabilities } from './useUserCapabilities';
import { apiClient } from '@/lib/api/axios-config';
import type { UserCapabilities } from '@/types';
import React from 'react';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
  })),
}));

// Mock axios
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

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

describe('useUserCapabilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // useUserCapabilities
  // ==========================================================================
  describe('useUserCapabilities', () => {
    const mockAnonymousCapabilities: UserCapabilities = {
      dailyCard: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
      },
      tarotReadings: {
        used: 0,
        limit: 0,
        canUse: false,
        resetAt: '2026-01-09T00:00:00.000Z',
      },
      pendulum: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt: null,
        period: 'lifetime',
      },
      canCreateDailyReading: true,
      canCreateTarotReading: false,
      canUseAI: false,
      canUseCustomQuestions: false,
      canUseAdvancedSpreads: false,
      canUseFullDeck: false,
      plan: 'anonymous',
      isAuthenticated: false,
    };

    const mockFreeCapabilities: UserCapabilities = {
      dailyCard: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
      },
      tarotReadings: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
      },
      pendulum: {
        used: 0,
        limit: 3,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
        period: 'monthly',
      },
      canCreateDailyReading: true,
      canCreateTarotReading: true,
      canUseAI: false,
      canUseCustomQuestions: false,
      canUseAdvancedSpreads: false,
      canUseFullDeck: false,
      plan: 'free',
      isAuthenticated: true,
    };

    const mockPremiumCapabilities: UserCapabilities = {
      dailyCard: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
      },
      tarotReadings: {
        used: 1,
        limit: 3,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
      },
      pendulum: {
        used: 2,
        limit: 10,
        canUse: true,
        resetAt: '2026-01-09T00:00:00.000Z',
        period: 'daily',
      },
      canCreateDailyReading: true,
      canCreateTarotReading: true,
      canUseAI: true,
      canUseCustomQuestions: true,
      canUseAdvancedSpreads: true,
      canUseFullDeck: true,
      plan: 'premium',
      isAuthenticated: true,
    };

    it('should fetch anonymous user capabilities', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAnonymousCapabilities });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for data
      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAnonymousCapabilities);
      // Should call with fingerprint params
      expect(apiClient.get).toHaveBeenCalledWith(
        '/users/capabilities',
        expect.objectContaining({
          params: expect.objectContaining({
            fingerprint: expect.any(String),
          }),
        })
      );
      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('forwards the AbortSignal to axios so an in-flight request can be cancelled', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockAnonymousCapabilities });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      const config = vi.mocked(apiClient.get).mock.calls[0][1];
      expect(config).toHaveProperty('signal');
      expect(config?.signal).toBeInstanceOf(AbortSignal);
    });

    it('should fetch free user capabilities', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockFreeCapabilities });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockFreeCapabilities);
      expect(result.current.data?.plan).toBe('free');
      expect(result.current.data?.isAuthenticated).toBe(true);
      expect(result.current.data?.canCreateTarotReading).toBe(true);
      expect(result.current.data?.canUseAI).toBe(false);
    });

    it('should fetch premium user capabilities', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPremiumCapabilities });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPremiumCapabilities);
      expect(result.current.data?.plan).toBe('premium');
      expect(result.current.data?.canUseAI).toBe(true);
      expect(result.current.data?.canUseCustomQuestions).toBe(true);
      expect(result.current.data?.canUseAdvancedSpreads).toBe(true);
    });

    it('should handle capabilities with limit reached', async () => {
      const mockLimitReached: UserCapabilities = {
        ...mockFreeCapabilities,
        dailyCard: {
          used: 1,
          limit: 1,
          canUse: false,
          resetAt: '2026-01-09T00:00:00.000Z',
        },
        tarotReadings: {
          used: 1,
          limit: 1,
          canUse: false,
          resetAt: '2026-01-09T00:00:00.000Z',
        },
        canCreateDailyReading: false,
        canCreateTarotReading: false,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockLimitReached });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.dailyCard.canUse).toBe(false);
      expect(result.current.data?.tarotReadings.canUse).toBe(false);
      expect(result.current.data?.canCreateDailyReading).toBe(false);
      expect(result.current.data?.canCreateTarotReading).toBe(false);
    });

    it('should handle error when fetching capabilities', async () => {
      const error = new Error('Error al obtener capabilities');
      vi.mocked(apiClient.get).mockRejectedValue(error);

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toEqual(error);
    });

    it('should use correct query key', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockFreeCapabilities });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Verify the query key is ['user', 'capabilities']
      expect(result.current.data).toBeDefined();
    });

    it('should have staleTime of 0 for fresh data', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockFreeCapabilities });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Data should be immediately stale (staleTime: 0)
      expect(result.current.isStale).toBe(true);
    });
  });

  // ==========================================================================
  // Auto-refresh on daily reset (fixes stale "límite alcanzado" on a new day)
  // ==========================================================================
  describe('daily reset auto-refresh', () => {
    afterEach(() => {
      vi.useRealTimers();
    });

    const limitReachedWithResetAt = (resetAt: string): UserCapabilities => ({
      dailyCard: { used: 1, limit: 1, canUse: false, resetAt },
      tarotReadings: { used: 1, limit: 1, canUse: false, resetAt },
      pendulum: {
        used: 0,
        limit: 3,
        canUse: true,
        resetAt: null,
        period: 'monthly',
      },
      canCreateDailyReading: false,
      canCreateTarotReading: false,
      canUseAI: false,
      canUseCustomQuestions: false,
      canUseAdvancedSpreads: false,
      canUseFullDeck: false,
      plan: 'free',
      isAuthenticated: true,
    });

    it('should not schedule an extra refetch when resetAt is already in the past', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const pastReset = new Date(Date.now() - 60_000).toISOString();
      vi.mocked(apiClient.get).mockResolvedValue({
        data: limitReachedWithResetAt(pastReset),
      });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // A past resetAt must not trigger an immediate/looping invalidation:
      // refetchOnMount/refetchOnWindowFocus already handle stale-on-mount.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5_000);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should refetch when the scheduled reset time is reached', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const futureReset = new Date(Date.now() + 60_000).toISOString();
      vi.mocked(apiClient.get).mockResolvedValue({
        data: limitReachedWithResetAt(futureReset),
      });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Cross the reset boundary (+5s safety margin) → timer invalidates and refetches.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(66_000);
      });

      await waitFor(() => expect(apiClient.get).toHaveBeenCalledTimes(2));
    });

    it('should clear the scheduled timer on unmount (no refetch after unmount)', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const futureReset = new Date(Date.now() + 60_000).toISOString();
      vi.mocked(apiClient.get).mockResolvedValue({
        data: limitReachedWithResetAt(futureReset),
      });

      const { result, unmount } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(apiClient.get).toHaveBeenCalledTimes(1);

      // Unmount before the reset fires: the cleanup must clearTimeout so no
      // refetch happens once the boundary passes.
      unmount();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(66_000);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });

    it('should NOT refetch before the reset time is reached', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });

      const futureReset = new Date(Date.now() + 60 * 60_000).toISOString();
      vi.mocked(apiClient.get).mockResolvedValue({
        data: limitReachedWithResetAt(futureReset),
      });

      const { result } = renderHook(() => useUserCapabilities(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // Advance only 5 minutes: still well before the 1-hour reset.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(5 * 60_000);
      });

      expect(apiClient.get).toHaveBeenCalledTimes(1);
    });
  });

  // ==========================================================================
  // useInvalidateCapabilities
  // ==========================================================================
  describe('useInvalidateCapabilities', () => {
    it('should return a function to invalidate capabilities', () => {
      const { result } = renderHook(() => useInvalidateCapabilities(), {
        wrapper: createWrapper(),
      });

      expect(typeof result.current).toBe('function');
    });

    it('should invalidate capabilities query when called', async () => {
      const mockCapabilities: UserCapabilities = {
        dailyCard: {
          used: 0,
          limit: 1,
          canUse: true,
          resetAt: '2026-01-09T00:00:00.000Z',
        },
        tarotReadings: {
          used: 0,
          limit: 1,
          canUse: true,
          resetAt: '2026-01-09T00:00:00.000Z',
        },
        pendulum: {
          used: 0,
          limit: 3,
          canUse: true,
          resetAt: '2026-01-09T00:00:00.000Z',
          period: 'monthly',
        },
        canCreateDailyReading: true,
        canCreateTarotReading: true,
        canUseAI: false,
        canUseCustomQuestions: false,
        canUseAdvancedSpreads: false,
        canUseFullDeck: false,
        plan: 'free',
        isAuthenticated: true,
      };

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCapabilities });

      const wrapper = createWrapper();

      // First fetch capabilities
      const { result: capabilitiesResult } = renderHook(() => useUserCapabilities(), {
        wrapper,
      });

      await waitFor(() => expect(capabilitiesResult.current.isSuccess).toBe(true));

      // Get invalidate function
      const { result: invalidateResult } = renderHook(() => useInvalidateCapabilities(), {
        wrapper,
      });

      // Call invalidate
      invalidateResult.current();

      // Should trigger refetch
      await waitFor(() => {
        expect(apiClient.get).toHaveBeenCalledTimes(2); // Initial + refetch after invalidate
      });
    });
  });
});
