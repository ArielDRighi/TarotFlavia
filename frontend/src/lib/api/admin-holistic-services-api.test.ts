/**
 * Tests for Admin Holistic Services API
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  adminGetHolisticServices,
  adminCreateHolisticService,
  adminUpdateHolisticService,
  adminGetPendingPayments,
  adminApprovePayment,
} from './admin-holistic-services-api';
import { apiClient } from './axios-config';
import type { HolisticServiceAdmin, CreateHolisticServicePayload, ServicePurchase } from '@/types';

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

const mockAdminService: HolisticServiceAdmin = {
  id: 1,
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Descubre tu historia familiar',
  longDescription: 'Descripción larga completa del servicio',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  imageUrl: 'https://example.com/arbol.jpg',
  displayOrder: 1,
  isActive: true,
  whatsappNumber: '+54911234567',
  mercadoPagoLink: 'https://mpago.la/abc123',
  createdAt: '2026-01-01T00:00:00Z',
  updatedAt: '2026-01-01T00:00:00Z',
};

const mockCreatePayload: CreateHolisticServicePayload = {
  name: 'Árbol Genealógico',
  slug: 'arbol-genealogico',
  shortDescription: 'Descubre tu historia familiar',
  longDescription: 'Descripción larga completa del servicio',
  priceArs: 15000,
  durationMinutes: 90,
  sessionType: 'family_tree',
  whatsappNumber: '+54911234567',
  mercadoPagoLink: 'https://mpago.la/abc123',
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

describe('Admin Holistic Services API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // adminGetHolisticServices
  // ============================================================================

  describe('adminGetHolisticServices', () => {
    it('should fetch all services with admin data', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockAdminService] });

      const result = await adminGetHolisticServices();

      expect(result).toEqual([mockAdminService]);
      expect(apiClient.get).toHaveBeenCalledWith('/admin/holistic-services');
    });

    it('should include sensitive fields (whatsappNumber, mercadoPagoLink)', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockAdminService] });

      const result = await adminGetHolisticServices();

      expect(result[0].whatsappNumber).toBe('+54911234567');
      expect(result[0].mercadoPagoLink).toBe('https://mpago.la/abc123');
    });

    it('should throw error with Spanish message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(adminGetHolisticServices()).rejects.toThrow(
        'Error al obtener servicios holísticos'
      );
    });
  });

  // ============================================================================
  // adminCreateHolisticService
  // ============================================================================

  describe('adminCreateHolisticService', () => {
    it('should create a service and return admin response', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockAdminService });

      const result = await adminCreateHolisticService(mockCreatePayload);

      expect(result).toEqual(mockAdminService);
      expect(apiClient.post).toHaveBeenCalledWith('/admin/holistic-services', mockCreatePayload);
    });

    it('should throw error with Spanish message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(adminCreateHolisticService(mockCreatePayload)).rejects.toThrow(
        'Error al crear el servicio'
      );
    });
  });

  // ============================================================================
  // adminUpdateHolisticService
  // ============================================================================

  describe('adminUpdateHolisticService', () => {
    it('should update a service and return admin response', async () => {
      const updatedService = { ...mockAdminService, priceArs: 18000 };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: updatedService });

      const result = await adminUpdateHolisticService(1, { priceArs: 18000 });

      expect(result).toEqual(updatedService);
      expect(apiClient.patch).toHaveBeenCalledWith('/admin/holistic-services/1', {
        priceArs: 18000,
      });
    });

    it('should throw "Servicio no encontrado" on 404', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue({ response: { status: 404 } });

      await expect(adminUpdateHolisticService(999, { priceArs: 18000 })).rejects.toThrow(
        'Servicio no encontrado'
      );
    });

    it('should throw generic error on non-404 failures', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue({ response: { status: 500 } });

      await expect(adminUpdateHolisticService(1, {})).rejects.toThrow(
        'Error al actualizar el servicio'
      );
    });
  });

  // ============================================================================
  // adminGetPendingPayments
  // ============================================================================

  describe('adminGetPendingPayments', () => {
    it('should fetch pending purchases for admin review', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [mockPurchase] });

      const result = await adminGetPendingPayments();

      expect(result).toEqual([mockPurchase]);
      expect(apiClient.get).toHaveBeenCalledWith('/admin/holistic-services/payments');
    });

    it('should return empty array when no pending purchases', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await adminGetPendingPayments();

      expect(result).toEqual([]);
    });

    it('should throw error with Spanish message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(adminGetPendingPayments()).rejects.toThrow('Error al obtener pagos pendientes');
    });
  });

  // ============================================================================
  // adminApprovePayment
  // ============================================================================

  describe('adminApprovePayment', () => {
    it('should approve a payment without reference', async () => {
      const approvedPurchase = { ...mockPurchase, paymentStatus: 'paid' as const };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: approvedPurchase });

      const result = await adminApprovePayment(10);

      expect(result).toEqual(approvedPurchase);
      expect(apiClient.patch).toHaveBeenCalledWith(
        '/admin/holistic-services/payments/10/approve',
        {}
      );
    });

    it('should approve a payment with payment reference', async () => {
      const approvedPurchase = {
        ...mockPurchase,
        paymentStatus: 'paid' as const,
        paymentReference: 'REF-001',
      };
      vi.mocked(apiClient.patch).mockResolvedValue({ data: approvedPurchase });

      const result = await adminApprovePayment(10, { paymentReference: 'REF-001' });

      expect(result.paymentReference).toBe('REF-001');
      expect(apiClient.patch).toHaveBeenCalledWith('/admin/holistic-services/payments/10/approve', {
        paymentReference: 'REF-001',
      });
    });

    it('should throw "Compra no encontrada" on 404', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue({ response: { status: 404 } });

      await expect(adminApprovePayment(999)).rejects.toThrow('Compra no encontrada');
    });

    it('should throw generic error on non-404 failures', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue(new Error('Network error'));

      await expect(adminApprovePayment(10)).rejects.toThrow('Error al aprobar el pago');
    });
  });
});
