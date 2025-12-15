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
  UserSubscription,
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
    const mockSubscription: UserSubscription = {
      id: 1,
      userId: 1,
      plan: 'free',
      favoriteTarotistaId: 5,
      lastFavoriteChange: '2024-11-15T10:00:00Z',
      canChangeFavorite: false,
      daysUntilChange: 15,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-11-15T10:00:00Z',
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

      expect(result.favoriteTarotistaId).toBe(5);
      expect(result.canChangeFavorite).toBe(false);
      expect(result.daysUntilChange).toBe(15);
    });

    it('should return subscription without favorite tarotista', async () => {
      const subscriptionNoFavorite: UserSubscription = {
        ...mockSubscription,
        favoriteTarotistaId: null,
        lastFavoriteChange: null,
        canChangeFavorite: true,
        daysUntilChange: 0,
      };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: subscriptionNoFavorite });

      const result = await getMySubscription();

      expect(result.favoriteTarotistaId).toBeNull();
      expect(result.canChangeFavorite).toBe(true);
      expect(result.daysUntilChange).toBe(0);
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
      success: true,
      subscription: {
        id: 1,
        userId: 1,
        plan: 'free',
        favoriteTarotistaId: 3,
        lastFavoriteChange: '2024-12-15T10:00:00Z',
        canChangeFavorite: false,
        daysUntilChange: 30,
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

      expect(result.success).toBe(true);
      expect(result.subscription.favoriteTarotistaId).toBe(3);
      expect(result.subscription.canChangeFavorite).toBe(false);
      expect(result.subscription.daysUntilChange).toBe(30);
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
