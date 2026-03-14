/**
 * Tests for useAdminHolisticServices hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAdminHolisticServices,
  usePendingPayments,
  useCreateHolisticService,
  useUpdateHolisticService,
  useApprovePayment,
} from './useAdminHolisticServices';
import * as adminApi from '@/lib/api/admin-holistic-services-api';
import type { HolisticServiceAdmin, ServicePurchase, CreateHolisticServicePayload } from '@/types';

// Mock API module
vi.mock('@/lib/api/admin-holistic-services-api');

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

const mockAdminService: HolisticServiceAdmin = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Descubre tu historia familiar',
  longDescription: 'Descripción larga',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  imageUrl: null,
  displayOrder: 1,
  isActive: true,
  whatsappNumber: '+54911234567',
  mercadoPagoLink: 'https://mpago.la/abc123',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
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

const mockCreatePayload: CreateHolisticServicePayload = {
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Descubre tu historia familiar',
  longDescription: 'Descripción larga del servicio',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  whatsappNumber: '+54911234567',
  mercadoPagoLink: 'https://mpago.la/abc123',
};

describe('useAdminHolisticServices Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // useAdminHolisticServices
  // ============================================================================

  describe('useAdminHolisticServices', () => {
    it('should fetch all services with admin data', async () => {
      vi.mocked(adminApi.adminGetHolisticServices).mockResolvedValue([mockAdminService]);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAdminHolisticServices(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockAdminService]);
      expect(result.current.data?.[0].whatsappNumber).toBe('+54911234567');
    });

    it('should handle errors', async () => {
      vi.mocked(adminApi.adminGetHolisticServices).mockRejectedValue(
        new Error('Error al obtener servicios holísticos')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAdminHolisticServices(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // usePendingPayments
  // ============================================================================

  describe('usePendingPayments', () => {
    it('should fetch pending payments for admin review', async () => {
      vi.mocked(adminApi.adminGetPendingPayments).mockResolvedValue([mockPurchase]);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => usePendingPayments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([mockPurchase]);
      expect(result.current.data).toHaveLength(1);
    });

    it('should handle errors', async () => {
      vi.mocked(adminApi.adminGetPendingPayments).mockRejectedValue(
        new Error('Error al obtener pagos pendientes')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => usePendingPayments(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useCreateHolisticService
  // ============================================================================

  describe('useCreateHolisticService', () => {
    it('should create a service successfully', async () => {
      vi.mocked(adminApi.adminCreateHolisticService).mockResolvedValue(mockAdminService);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCreateHolisticService(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(mockCreatePayload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockAdminService);
      expect(adminApi.adminCreateHolisticService).toHaveBeenCalledWith(mockCreatePayload);
    });

    it('should invalidate admin list and public list on success', async () => {
      vi.mocked(adminApi.adminCreateHolisticService).mockResolvedValue(mockAdminService);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCreateHolisticService(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(mockCreatePayload);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle errors', async () => {
      vi.mocked(adminApi.adminCreateHolisticService).mockRejectedValue(
        new Error('Error al crear el servicio')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCreateHolisticService(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(mockCreatePayload);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useUpdateHolisticService
  // ============================================================================

  describe('useUpdateHolisticService', () => {
    it('should update a service successfully', async () => {
      const updatedService = { ...mockAdminService, priceArs: 18000 };
      vi.mocked(adminApi.adminUpdateHolisticService).mockResolvedValue(updatedService);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useUpdateHolisticService(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 1, data: { priceArs: 18000 } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.priceArs).toBe(18000);
      expect(adminApi.adminUpdateHolisticService).toHaveBeenCalledWith(1, { priceArs: 18000 });
    });

    it('should handle errors', async () => {
      vi.mocked(adminApi.adminUpdateHolisticService).mockRejectedValue(
        new Error('Servicio no encontrado')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useUpdateHolisticService(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 999, data: {} });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useApprovePayment
  // ============================================================================

  describe('useApprovePayment', () => {
    it('should approve a payment successfully', async () => {
      const approvedPurchase = { ...mockPurchase, paymentStatus: 'paid' as const };
      vi.mocked(adminApi.adminApprovePayment).mockResolvedValue(approvedPurchase);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useApprovePayment(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 10 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.paymentStatus).toBe('paid');
      expect(adminApi.adminApprovePayment).toHaveBeenCalledWith(10, undefined);
    });

    it('should approve a payment with reference', async () => {
      const approvedPurchase = {
        ...mockPurchase,
        paymentStatus: 'paid' as const,
        paymentReference: 'REF-001',
      };
      vi.mocked(adminApi.adminApprovePayment).mockResolvedValue(approvedPurchase);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useApprovePayment(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 10, data: { paymentReference: 'REF-001' } });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(adminApi.adminApprovePayment).toHaveBeenCalledWith(10, {
        paymentReference: 'REF-001',
      });
    });

    it('should invalidate pending payments and purchases on success', async () => {
      const approvedPurchase = { ...mockPurchase, paymentStatus: 'paid' as const };
      vi.mocked(adminApi.adminApprovePayment).mockResolvedValue(approvedPurchase);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useApprovePayment(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 10 });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalledTimes(2);
    });

    it('should handle errors', async () => {
      vi.mocked(adminApi.adminApprovePayment).mockRejectedValue(new Error('Compra no encontrada'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useApprovePayment(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 999 });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });
});
