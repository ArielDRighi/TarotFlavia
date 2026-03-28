/**
 * Tests for TanStack Query hooks for MP subscriptions (useSubscription)
 *
 * @vitest-environment jsdom
 */
import { renderHook, waitFor, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

import {
  useCreatePreapproval,
  useSubscriptionStatus,
  useCancelSubscription,
  subscriptionMpQueryKeys,
} from './useSubscription';
import * as subscriptionMpApi from '@/lib/api/subscription-mp-api';
import type {
  CreatePreapprovalResponse,
  MpSubscriptionStatus,
  CancelSubscriptionResponse,
} from '@/types';

// Mock the API module
vi.mock('@/lib/api/subscription-mp-api');

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
const mockCreatePreapprovalResponse: CreatePreapprovalResponse = {
  initPoint: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=abc123',
};

const mockStatusPremiumActive: MpSubscriptionStatus = {
  plan: 'premium',
  subscriptionStatus: 'active',
  planExpiresAt: '2026-04-28T03:00:00.000Z',
  mpPreapprovalId: 'sub_abc123',
};

const mockStatusFree: MpSubscriptionStatus = {
  plan: 'free',
  subscriptionStatus: null,
  planExpiresAt: null,
  mpPreapprovalId: null,
};

const mockCancelResponse: CancelSubscriptionResponse = {
  message: 'Suscripción cancelada exitosamente',
  planExpiresAt: '2026-04-28T03:00:00.000Z',
};

describe('useSubscription hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // useCreatePreapproval
  // ==========================================================================
  describe('useCreatePreapproval', () => {
    it('should call createPreapproval API and return initPoint', async () => {
      vi.mocked(subscriptionMpApi.createPreapproval).mockResolvedValueOnce(
        mockCreatePreapprovalResponse
      );

      const { result } = renderHook(() => useCreatePreapproval(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(subscriptionMpApi.createPreapproval).toHaveBeenCalledTimes(1);
      expect(result.current.data?.initPoint).toBe(
        'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=abc123'
      );
    });

    it('should call correct endpoint via API function', async () => {
      vi.mocked(subscriptionMpApi.createPreapproval).mockResolvedValueOnce(
        mockCreatePreapprovalResponse
      );

      const { result } = renderHook(() => useCreatePreapproval(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(subscriptionMpApi.createPreapproval).toHaveBeenCalledTimes(1);
    });

    it('should handle error when createPreapproval fails', async () => {
      vi.mocked(subscriptionMpApi.createPreapproval).mockRejectedValueOnce(
        new Error('Error al crear suscripción')
      );

      const { result } = renderHook(() => useCreatePreapproval(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  // ==========================================================================
  // useSubscriptionStatus
  // ==========================================================================
  describe('useSubscriptionStatus', () => {
    it('should fetch subscription status successfully', async () => {
      vi.mocked(subscriptionMpApi.getSubscriptionStatus).mockResolvedValueOnce(
        mockStatusPremiumActive
      );

      const { result } = renderHook(() => useSubscriptionStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockStatusPremiumActive);
      expect(subscriptionMpApi.getSubscriptionStatus).toHaveBeenCalledTimes(1);
    });

    it('should return premium active status correctly', async () => {
      vi.mocked(subscriptionMpApi.getSubscriptionStatus).mockResolvedValueOnce(
        mockStatusPremiumActive
      );

      const { result } = renderHook(() => useSubscriptionStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.plan).toBe('premium');
      expect(result.current.data?.subscriptionStatus).toBe('active');
      expect(result.current.data?.planExpiresAt).toBe('2026-04-28T03:00:00.000Z');
    });

    it('should return free user status with nulls', async () => {
      vi.mocked(subscriptionMpApi.getSubscriptionStatus).mockResolvedValueOnce(mockStatusFree);

      const { result } = renderHook(() => useSubscriptionStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.plan).toBe('free');
      expect(result.current.data?.subscriptionStatus).toBeNull();
      expect(result.current.data?.planExpiresAt).toBeNull();
    });

    it('should accept refetchInterval option for polling', async () => {
      vi.mocked(subscriptionMpApi.getSubscriptionStatus).mockResolvedValue(mockStatusFree);

      const { result } = renderHook(() => useSubscriptionStatus({ refetchInterval: 2000 }), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      // The hook runs without error with refetchInterval option
      expect(result.current.data).toEqual(mockStatusFree);
    });

    it('should use correct query key', () => {
      expect(subscriptionMpQueryKeys.status).toEqual(['subscriptions', 'mp', 'status']);
    });

    it('should handle error when fetching status fails', async () => {
      vi.mocked(subscriptionMpApi.getSubscriptionStatus).mockRejectedValueOnce(
        new Error('Error al obtener estado de suscripción')
      );

      const { result } = renderHook(() => useSubscriptionStatus(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  // ==========================================================================
  // useCancelSubscription
  // ==========================================================================
  describe('useCancelSubscription', () => {
    it('should cancel subscription and return response', async () => {
      vi.mocked(subscriptionMpApi.cancelSubscription).mockResolvedValueOnce(mockCancelResponse);

      const { result } = renderHook(() => useCancelSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(subscriptionMpApi.cancelSubscription).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockCancelResponse);
    });

    it('should invalidate capabilities query on success', async () => {
      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.mocked(subscriptionMpApi.cancelSubscription).mockResolvedValueOnce(mockCancelResponse);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCancelSubscription(), { wrapper });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['user', 'capabilities']),
        })
      );
    });

    it('should invalidate subscription status query on success', async () => {
      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      vi.mocked(subscriptionMpApi.cancelSubscription).mockResolvedValueOnce(mockCancelResponse);

      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useCancelSubscription(), { wrapper });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          queryKey: expect.arrayContaining(['subscriptions', 'mp', 'status']),
        })
      );
    });

    it('should handle error when cancellation fails', async () => {
      vi.mocked(subscriptionMpApi.cancelSubscription).mockRejectedValueOnce(
        new Error('Error al cancelar suscripción')
      );

      const { result } = renderHook(() => useCancelSubscription(), {
        wrapper: createWrapper(),
      });

      act(() => {
        result.current.mutate();
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });
});
