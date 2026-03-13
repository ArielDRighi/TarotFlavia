/**
 * Tests for useHolisticServices hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useHolisticServices,
  useHolisticServiceDetail,
  useMyPurchases,
  usePurchaseDetail,
} from './useHolisticServices';
import * as holisticApi from '@/lib/api/holistic-services-api';
import type { HolisticService, HolisticServiceDetail, ServicePurchase } from '@/types';

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

// ============================================================================
// Shared fixtures
// ============================================================================

const mockService: HolisticService = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Descubre tu historia familiar',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockServiceDetail: HolisticServiceDetail = {
  ...mockService,
  longDescription: 'Descripción larga detallada del servicio',
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
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
};

describe('useHolisticServices Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // useHolisticServices
  // ============================================================================

  describe('useHolisticServices', () => {
    it('should fetch the service catalog', async () => {
      vi.mocked(holisticApi.getHolisticServices).mockResolvedValue([mockService]);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useHolisticServices(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockService]);
      expect(holisticApi.getHolisticServices).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      vi.mocked(holisticApi.getHolisticServices).mockRejectedValue(
        new Error('Error al obtener servicios holísticos')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useHolisticServices(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useHolisticServiceDetail
  // ============================================================================

  describe('useHolisticServiceDetail', () => {
    it('should fetch service detail by slug', async () => {
      vi.mocked(holisticApi.getHolisticServiceDetail).mockResolvedValue(mockServiceDetail);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useHolisticServiceDetail('arbol-genealogico'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockServiceDetail);
      expect(holisticApi.getHolisticServiceDetail).toHaveBeenCalledWith('arbol-genealogico');
    });

    it('should not fetch when slug is empty', () => {
      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useHolisticServiceDetail(''), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(holisticApi.getHolisticServiceDetail).not.toHaveBeenCalled();
    });

    it('should handle 404 errors', async () => {
      vi.mocked(holisticApi.getHolisticServiceDetail).mockRejectedValue(
        new Error('Servicio no encontrado')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useHolisticServiceDetail('no-existe'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useMyPurchases
  // ============================================================================

  describe('useMyPurchases', () => {
    it('should fetch user purchases as array', async () => {
      vi.mocked(holisticApi.getMyPurchases).mockResolvedValue([mockPurchase]);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMyPurchases(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockPurchase]);
      expect(holisticApi.getMyPurchases).toHaveBeenCalledTimes(1);
    });

    it('should return empty array when no purchases', async () => {
      vi.mocked(holisticApi.getMyPurchases).mockResolvedValue([]);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMyPurchases(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });

    it('should handle errors', async () => {
      vi.mocked(holisticApi.getMyPurchases).mockRejectedValue(
        new Error('Error al obtener mis compras')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMyPurchases(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // usePurchaseDetail
  // ============================================================================

  describe('usePurchaseDetail', () => {
    it('should fetch purchase detail by ID', async () => {
      vi.mocked(holisticApi.getPurchaseDetail).mockResolvedValue(mockPurchase);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => usePurchaseDetail(10), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockPurchase);
      expect(holisticApi.getPurchaseDetail).toHaveBeenCalledWith(10);
    });

    it('should not fetch when id is 0', () => {
      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => usePurchaseDetail(0), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(holisticApi.getPurchaseDetail).not.toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      vi.mocked(holisticApi.getPurchaseDetail).mockRejectedValue(new Error('Compra no encontrada'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => usePurchaseDetail(999), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
