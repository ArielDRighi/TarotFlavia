/**
 * Tests for Holistic Services API (public + authenticated)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getHolisticServices,
  getHolisticServiceDetail,
  createPurchase,
  getMyPurchases,
  getPurchaseDetail,
  cancelPurchase,
} from './holistic-services-api';
import { apiClient } from './axios-config';
import type { HolisticService, HolisticServiceDetail, ServicePurchase } from '@/types';

// Mock axios client
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

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
  imageUrl: 'https://example.com/arbol.jpg',
  displayOrder: 1,
  isActive: true,
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockServiceDetail: HolisticServiceDetail = {
  ...mockService,
  longDescription: 'Descripción larga del servicio de árbol genealógico',
};

const mockPurchase: ServicePurchase = {
  id: 10,
  userId: 100,
  holisticServiceId: 1,
  holisticService: {
    id: 1,
    name: 'Árbol Genealógico',
    slug: 'arbol-genealogico',
    durationMinutes: 90,
  },
  sessionId: null,
  paymentStatus: 'pending',
  amountArs: 15000,
  paymentReference: null,
  paidAt: null,
  createdAt: '2026-01-01T10:00:00Z',
  updatedAt: '2026-01-01T10:00:00Z',
};

describe('Holistic Services API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // getHolisticServices
  // ============================================================================

  describe('getHolisticServices', () => {
    it('should fetch the service catalog successfully', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockService] });

      const result = await getHolisticServices();

      expect(result).toEqual([mockService]);
      expect(apiClient.get).toHaveBeenCalledWith('/holistic-services');
    });

    it('should return empty array when no services exist', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getHolisticServices();

      expect(result).toEqual([]);
    });

    it('should throw error with Spanish message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getHolisticServices()).rejects.toThrow('Error al obtener servicios holísticos');
    });
  });

  // ============================================================================
  // getHolisticServiceDetail
  // ============================================================================

  describe('getHolisticServiceDetail', () => {
    it('should fetch service detail by slug', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockServiceDetail });

      const result = await getHolisticServiceDetail('arbol-genealogico');

      expect(result).toEqual(mockServiceDetail);
      expect(apiClient.get).toHaveBeenCalledWith('/holistic-services/arbol-genealogico');
    });

    it('should throw "Servicio no encontrado" on 404', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } });

      await expect(getHolisticServiceDetail('no-existe')).rejects.toThrow('Servicio no encontrado');
    });

    it('should throw generic error on non-404 failures', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 500 } });

      await expect(getHolisticServiceDetail('arbol-genealogico')).rejects.toThrow(
        'Error al obtener detalle del servicio'
      );
    });
  });

  // ============================================================================
  // createPurchase
  // ============================================================================

  describe('createPurchase', () => {
    it('should create a purchase and return it', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockPurchase });

      const result = await createPurchase({ holisticServiceId: 1 });

      expect(result).toEqual(mockPurchase);
      expect(apiClient.post).toHaveBeenCalledWith('/holistic-services/purchases', {
        holisticServiceId: 1,
      });
    });

    it('should throw error with Spanish message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(createPurchase({ holisticServiceId: 1 })).rejects.toThrow(
        'Error al crear la compra'
      );
    });
  });

  // ============================================================================
  // getMyPurchases
  // ============================================================================

  describe('getMyPurchases', () => {
    it('should fetch user purchases as array', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockPurchase] });

      const result = await getMyPurchases();

      expect(result).toEqual([mockPurchase]);
      expect(apiClient.get).toHaveBeenCalledWith('/holistic-services/purchases/my');
    });

    it('should return empty array when no purchases exist', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getMyPurchases();

      expect(result).toEqual([]);
    });

    it('should throw error with Spanish message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getMyPurchases()).rejects.toThrow('Error al obtener mis compras');
    });
  });

  // ============================================================================
  // getPurchaseDetail
  // ============================================================================

  describe('getPurchaseDetail', () => {
    it('should fetch purchase detail by ID', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockPurchase });

      const result = await getPurchaseDetail(10);

      expect(result).toEqual(mockPurchase);
      expect(apiClient.get).toHaveBeenCalledWith('/holistic-services/purchases/10');
    });

    it('should throw "Compra no encontrada" on 404', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 404 } });

      await expect(getPurchaseDetail(999)).rejects.toThrow('Compra no encontrada');
    });

    it('should throw generic error on non-404 failures', async () => {
      vi.mocked(apiClient.get).mockRejectedValue({ response: { status: 500 } });

      await expect(getPurchaseDetail(10)).rejects.toThrow('Error al obtener detalle de la compra');
    });
  });

  // ============================================================================
  // cancelPurchase
  // ============================================================================

  describe('cancelPurchase', () => {
    it('should cancel a purchase successfully', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({ data: undefined });

      await expect(cancelPurchase(10)).resolves.toBeUndefined();
      expect(apiClient.patch).toHaveBeenCalledWith('/holistic-services/purchases/10/cancel');
    });

    it('should throw "Compra no encontrada" on 404', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue({ response: { status: 404 } });

      await expect(cancelPurchase(999)).rejects.toThrow('Compra no encontrada');
    });

    it('should throw generic error on non-404 failures', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue(new Error('Network error'));

      await expect(cancelPurchase(10)).rejects.toThrow('Error al cancelar la compra');
    });
  });
});
