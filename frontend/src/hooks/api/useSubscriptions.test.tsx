/**
 * Tests for TanStack Query hooks for subscriptions
 *
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

import {
  useMySubscription,
  useSetFavoriteTarotista,
  subscriptionQueryKeys,
} from './useSubscriptions';
import * as subscriptionsApi from '@/lib/api/subscriptions-api';
import type { SubscriptionInfo, SetFavoriteTarotistaResponse } from '@/types';

// Mock the API module
vi.mock('@/lib/api/subscriptions-api');

// Mock custom toast wrapper
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
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

// Mock data
const mockSubscription: SubscriptionInfo = {
  subscriptionType: 'favorite',
  tarotistaId: 5,
  tarotistaNombre: 'Luna Mística',
  canChange: false,
  canChangeAt: '2024-12-15T10:00:00Z',
  changeCount: 1,
};

const mockSubscriptionNoFavorite: SubscriptionInfo = {
  subscriptionType: 'favorite',
  tarotistaId: null,
  canChange: true,
  canChangeAt: null,
  changeCount: 0,
};

const mockSetFavoriteResponse: SetFavoriteTarotistaResponse = {
  message: 'Tarotista favorito establecido correctamente',
  subscription: {
    id: 1,
    userId: 1,
    tarotistaId: 3,
    subscriptionType: 'favorite',
    status: 'active',
    startedAt: '2024-01-01T00:00:00Z',
    expiresAt: null,
    cancelledAt: null,
    canChangeAt: '2025-01-14T10:00:00Z',
    changeCount: 1,
    stripeSubscriptionId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-15T10:00:00Z',
  },
};

describe('useSubscriptions hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // useMySubscription
  // ==========================================================================
  describe('useMySubscription', () => {
    it('should fetch user subscription successfully', async () => {
      vi.mocked(subscriptionsApi.getMySubscription).mockResolvedValueOnce(mockSubscription);

      const { result } = renderHook(() => useMySubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSubscription);
      expect(subscriptionsApi.getMySubscription).toHaveBeenCalledTimes(1);
    });

    it('should return subscription with favorite tarotista', async () => {
      vi.mocked(subscriptionsApi.getMySubscription).mockResolvedValueOnce(mockSubscription);

      const { result } = renderHook(() => useMySubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.tarotistaId).toBe(5);
      expect(result.current.data?.canChange).toBe(false);
      expect(result.current.data?.changeCount).toBe(1);
    });

    it('should return subscription without favorite tarotista', async () => {
      vi.mocked(subscriptionsApi.getMySubscription).mockResolvedValueOnce(
        mockSubscriptionNoFavorite
      );

      const { result } = renderHook(() => useMySubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.tarotistaId).toBeNull();
      expect(result.current.data?.canChange).toBe(true);
      expect(result.current.data?.changeCount).toBe(0);
    });

    it('should handle error when fetching subscription fails', async () => {
      vi.mocked(subscriptionsApi.getMySubscription).mockRejectedValueOnce(
        new Error('Network error')
      );

      const { result } = renderHook(() => useMySubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should use correct query key', async () => {
      vi.mocked(subscriptionsApi.getMySubscription).mockResolvedValueOnce(mockSubscription);

      const { result } = renderHook(() => useMySubscription(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(subscriptionQueryKeys.mySubscription).toEqual(['subscriptions', 'my']);
    });
  });

  // ==========================================================================
  // useSetFavoriteTarotista
  // ==========================================================================
  describe('useSetFavoriteTarotista', () => {
    it('should set favorite tarotista successfully', async () => {
      vi.mocked(subscriptionsApi.setFavoriteTarotista).mockResolvedValueOnce(
        mockSetFavoriteResponse
      );

      const { result } = renderHook(() => useSetFavoriteTarotista(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(3);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(subscriptionsApi.setFavoriteTarotista).toHaveBeenCalledWith(3);
      expect(result.current.data).toEqual(mockSetFavoriteResponse);
    });

    it('should invalidate subscription query on success', async () => {
      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.mocked(subscriptionsApi.setFavoriteTarotista).mockResolvedValueOnce(
        mockSetFavoriteResponse
      );

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useSetFavoriteTarotista(), { wrapper });

      result.current.mutate(3);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: subscriptionQueryKeys.mySubscription,
      });
    });

    it('should show success toast on success', async () => {
      const { toast } = await import('@/hooks/utils/useToast');
      vi.mocked(subscriptionsApi.setFavoriteTarotista).mockResolvedValueOnce(
        mockSetFavoriteResponse
      );

      const { result } = renderHook(() => useSetFavoriteTarotista(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(3);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(toast.success).toHaveBeenCalledWith('Tarotista favorito actualizado');
    });

    it('should show error toast on failure', async () => {
      const { toast } = await import('@/hooks/utils/useToast');
      const error = new Error('Cooldown active');
      vi.mocked(subscriptionsApi.setFavoriteTarotista).mockRejectedValueOnce(error);

      const { result } = renderHook(() => useSetFavoriteTarotista(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(3);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(toast.error).toHaveBeenCalledWith('Error al establecer tarotista favorito');
    });

    it('should handle cooldown error', async () => {
      const cooldownError = new Error(
        'No puedes cambiar tu tarotista favorito hasta dentro de 10 días'
      );
      vi.mocked(subscriptionsApi.setFavoriteTarotista).mockRejectedValueOnce(cooldownError);

      const { result } = renderHook(() => useSetFavoriteTarotista(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(5);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should handle numeric tarotista ID', async () => {
      vi.mocked(subscriptionsApi.setFavoriteTarotista).mockResolvedValueOnce(
        mockSetFavoriteResponse
      );

      const { result } = renderHook(() => useSetFavoriteTarotista(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(999);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(subscriptionsApi.setFavoriteTarotista).toHaveBeenCalledWith(999);
    });
  });
});
