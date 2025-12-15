/**
 * Subscriptions API Service Tests
 *
 * Tests para el servicio de API de suscripciones
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { getMySubscription, setFavoriteTarotista } from './subscriptions-api';
import type {
  SubscriptionInfo,
  SetFavoriteTarotistaDto,
  SetFavoriteTarotistaResponse,
} from '@/types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('subscriptions-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // getMySubscription
  // ==========================================================================
  describe('getMySubscription', () => {
    const mockSubscription: SubscriptionInfo = {
      subscriptionType: 'favorite',
      tarotistaId: 5,
      tarotistaNombre: 'Luna Mística',
      canChange: false,
      canChangeAt: '2024-12-15T10:00:00Z',
      changeCount: 1,
    };

    it('should fetch user subscription from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSubscription });

      const result = await getMySubscription();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SUBSCRIPTIONS.MY_SUBSCRIPTION);
      expect(result).toEqual(mockSubscription);
    });

    it('should return subscription with favorite tarotista', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSubscription });

      const result = await getMySubscription();

      expect(result?.tarotistaId).toBe(5);
      expect(result?.canChange).toBe(false);
      expect(result?.changeCount).toBe(1);
    });

    it('should return subscription without favorite tarotista', async () => {
      const subscriptionNoFavorite: SubscriptionInfo = {
        subscriptionType: 'favorite',
        tarotistaId: null,
        canChange: true,
        canChangeAt: null,
        changeCount: 0,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: subscriptionNoFavorite });

      const result = await getMySubscription();

      expect(result?.tarotistaId).toBeNull();
      expect(result?.canChange).toBe(true);
      expect(result?.changeCount).toBe(0);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getMySubscription()).rejects.toThrow('Error al obtener suscripción');
    });
  });

  // ==========================================================================
  // setFavoriteTarotista
  // ==========================================================================
  describe('setFavoriteTarotista', () => {
    const mockResponse: SetFavoriteTarotistaResponse = {
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

    it('should set favorite tarotista via API', async () => {
      const dto: SetFavoriteTarotistaDto = { tarotistaId: 3 };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await setFavoriteTarotista(3);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.SUBSCRIPTIONS.SET_FAVORITE, dto);
      expect(result).toEqual(mockResponse);
    });

    it('should return updated subscription with new favorite', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      const result = await setFavoriteTarotista(3);

      expect(result.message).toBe('Tarotista favorito establecido correctamente');
      expect(result.subscription.tarotistaId).toBe(3);
      expect(result.subscription.subscriptionType).toBe('favorite');
      expect(result.subscription.canChangeAt).toBeTruthy();
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(setFavoriteTarotista(3)).rejects.toThrow(
        'Error al establecer tarotista favorito'
      );
    });

    it('should throw error when cooldown is active', async () => {
      const cooldownError = {
        response: {
          data: {
            message: 'No puedes cambiar tu tarotista favorito hasta dentro de 10 días',
          },
        },
      };
      vi.mocked(apiClient.post).mockRejectedValueOnce(cooldownError);

      await expect(setFavoriteTarotista(5)).rejects.toThrow(
        'Error al establecer tarotista favorito'
      );
    });

    it('should handle numeric tarotista ID', async () => {
      const dto: SetFavoriteTarotistaDto = { tarotistaId: 999 };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockResponse });

      await setFavoriteTarotista(999);

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.SUBSCRIPTIONS.SET_FAVORITE, dto);
    });
  });
});
