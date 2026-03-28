/**
 * Subscription MP API Service Tests
 *
 * Tests para el servicio de API de suscripciones MercadoPago
 * (createPreapproval, getSubscriptionStatus, cancelSubscription)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import {
  createPreapproval,
  getSubscriptionStatus,
  cancelSubscription,
} from './subscription-mp-api';
import type {
  CreatePreapprovalResponse,
  MpSubscriptionStatus,
  CancelSubscriptionResponse,
} from '@/types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('subscription-mp-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // createPreapproval
  // ==========================================================================
  describe('createPreapproval', () => {
    const mockResponse: CreatePreapprovalResponse = {
      initPoint: 'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=abc123',
    };

    it('should call create-preapproval endpoint and return initPoint', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await createPreapproval();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.SUBSCRIPTIONS.CREATE_PREAPPROVAL);
      expect(result).toEqual(mockResponse);
    });

    it('should return initPoint URL', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await createPreapproval();

      expect(result.initPoint).toBe(
        'https://www.mercadopago.com.ar/subscriptions/checkout?preapproval_id=abc123'
      );
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(createPreapproval()).rejects.toThrow('Error al crear suscripción');
    });
  });

  // ==========================================================================
  // getSubscriptionStatus
  // ==========================================================================
  describe('getSubscriptionStatus', () => {
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

    const mockStatusCancelled: MpSubscriptionStatus = {
      plan: 'premium',
      subscriptionStatus: 'cancelled',
      planExpiresAt: '2026-04-28T03:00:00.000Z',
      mpPreapprovalId: 'sub_abc123',
    };

    it('should fetch subscription status from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatusPremiumActive });

      const result = await getSubscriptionStatus();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SUBSCRIPTIONS.STATUS);
      expect(result).toEqual(mockStatusPremiumActive);
    });

    it('should return premium active status correctly', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatusPremiumActive });

      const result = await getSubscriptionStatus();

      expect(result.plan).toBe('premium');
      expect(result.subscriptionStatus).toBe('active');
      expect(result.planExpiresAt).toBe('2026-04-28T03:00:00.000Z');
      expect(result.mpPreapprovalId).toBe('sub_abc123');
    });

    it('should return free user status with nulls', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatusFree });

      const result = await getSubscriptionStatus();

      expect(result.plan).toBe('free');
      expect(result.subscriptionStatus).toBeNull();
      expect(result.planExpiresAt).toBeNull();
      expect(result.mpPreapprovalId).toBeNull();
    });

    it('should return cancelled subscription status', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockStatusCancelled });

      const result = await getSubscriptionStatus();

      expect(result.plan).toBe('premium');
      expect(result.subscriptionStatus).toBe('cancelled');
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getSubscriptionStatus()).rejects.toThrow(
        'Error al obtener estado de suscripción'
      );
    });
  });

  // ==========================================================================
  // cancelSubscription
  // ==========================================================================
  describe('cancelSubscription', () => {
    const mockCancelResponse: CancelSubscriptionResponse = {
      message: 'Suscripción cancelada exitosamente',
      planExpiresAt: '2026-04-28T03:00:00.000Z',
    };

    it('should call cancel endpoint and return response', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockCancelResponse });

      const result = await cancelSubscription();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.SUBSCRIPTIONS.CANCEL);
      expect(result).toEqual(mockCancelResponse);
    });

    it('should return message and planExpiresAt on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockCancelResponse });

      const result = await cancelSubscription();

      expect(result.message).toBe('Suscripción cancelada exitosamente');
      expect(result.planExpiresAt).toBe('2026-04-28T03:00:00.000Z');
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(cancelSubscription()).rejects.toThrow('Error al cancelar suscripción');
    });
  });
});
