/**
 * Tests for useHolisticServiceMutations hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import { useCreatePurchase, useCancelPurchase } from './useHolisticServiceMutations';
import * as holisticApi from '@/lib/api/holistic-services-api';
import type { ServicePurchase } from '@/types';

// Mock API module
vi.mock('@/lib/api/holistic-services-api');

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
};

const mockPurchase: ServicePurchase = {
  id: 10,
  userId: 100,
  holisticServiceId: 1,
  sessionId: null,
  paymentStatus: 'pending',
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  initPoint: null,
  mercadoPagoPaymentId: null,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
};

describe('useHolisticServiceMutations Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // useCreatePurchase
  // ============================================================================

  describe('useCreatePurchase', () => {
    it('should create a purchase successfully', async () => {
      vi.mocked(holisticApi.createPurchase).mockResolvedValue(mockPurchase);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCreatePurchase(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        holisticServiceId: 1,
        selectedDate: '2026-04-15',
        selectedTime: '10:00',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPurchase);
      expect(holisticApi.createPurchase).toHaveBeenCalledWith({
        holisticServiceId: 1,
        selectedDate: '2026-04-15',
        selectedTime: '10:00',
      });
    });

    it('should handle errors when creation fails', async () => {
      vi.mocked(holisticApi.createPurchase).mockRejectedValue(
        new Error('Error al crear la compra')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCreatePurchase(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        holisticServiceId: 1,
        selectedDate: '2026-04-15',
        selectedTime: '10:00',
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should invalidate purchases queries on success', async () => {
      vi.mocked(holisticApi.createPurchase).mockResolvedValue(mockPurchase);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreatePurchase(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        holisticServiceId: 1,
        selectedDate: '2026-04-15',
        selectedTime: '10:00',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalled();
    });
  });

  // ============================================================================
  // useCancelPurchase
  // ============================================================================

  describe('useCancelPurchase', () => {
    it('should cancel a purchase successfully', async () => {
      vi.mocked(holisticApi.cancelPurchase).mockResolvedValue(undefined);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCancelPurchase(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(10);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(holisticApi.cancelPurchase).toHaveBeenCalledWith(10);
    });

    it('should handle errors when cancellation fails', async () => {
      vi.mocked(holisticApi.cancelPurchase).mockRejectedValue(
        new Error('Error al cancelar la compra')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCancelPurchase(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(10);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should invalidate purchases queries on success', async () => {
      vi.mocked(holisticApi.cancelPurchase).mockResolvedValue(undefined);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCancelPurchase(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(10);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
