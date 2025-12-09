/**
 * Daily Reading API Service Tests
 *
 * Tests para el servicio de API de carta del día
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import {
  getDailyReading,
  getDailyReadingToday,
  getDailyReadingHistory,
  regenerateDailyReading,
} from './daily-reading-api';
import type { DailyReading, PaginatedDailyReadings } from '@/types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock data
const mockDailyReading: DailyReading = {
  id: 1,
  userId: 1,
  card: {
    id: 1,
    name: 'El Mago',
    arcana: 'major',
    number: 1,
    suit: null,
    orientation: 'upright',
    imageUrl: '/cards/magician.jpg',
  },
  interpretation:
    'El Mago te indica que tienes todas las herramientas necesarias para lograr tus metas hoy.',
  date: '2025-12-09',
  isRegenerated: false,
  createdAt: '2025-12-09T08:00:00Z',
};

const mockPaginatedDailyReadings: PaginatedDailyReadings = {
  data: [
    mockDailyReading,
    {
      ...mockDailyReading,
      id: 2,
      date: '2025-12-08',
      card: {
        ...mockDailyReading.card,
        id: 2,
        name: 'La Sacerdotisa',
        number: 2,
      },
    },
  ],
  meta: {
    page: 1,
    limit: 10,
    totalItems: 2,
    totalPages: 1,
  },
};

describe('daily-reading-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ==========================================================================
  // getDailyReading
  // ==========================================================================
  describe('getDailyReading', () => {
    it('should POST to daily-reading endpoint and return daily reading', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: mockDailyReading });

      const result = await getDailyReading();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.DAILY_READING.BASE);
      expect(result).toEqual(mockDailyReading);
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(getDailyReading()).rejects.toThrow('Error al obtener carta del día');
    });
  });

  // ==========================================================================
  // getDailyReadingToday
  // ==========================================================================
  describe('getDailyReadingToday', () => {
    it('should GET today daily reading from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockDailyReading });

      const result = await getDailyReadingToday();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DAILY_READING.TODAY);
      expect(result).toEqual(mockDailyReading);
    });

    it('should return null when no daily reading exists for today (404)', async () => {
      const error = { response: { status: 404 } };
      vi.mocked(apiClient.get).mockRejectedValueOnce(error);

      const result = await getDailyReadingToday();

      expect(result).toBeNull();
    });

    it('should throw error for non-404 errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getDailyReadingToday()).rejects.toThrow('Error al obtener carta del día');
    });
  });

  // ==========================================================================
  // getDailyReadingHistory
  // ==========================================================================
  describe('getDailyReadingHistory', () => {
    it('should GET paginated history from API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPaginatedDailyReadings });

      const result = await getDailyReadingHistory(1, 10);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DAILY_READING.HISTORY, {
        params: { page: 1, limit: 10 },
      });
      expect(result).toEqual(mockPaginatedDailyReadings);
    });

    it('should pass different page and limit values', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPaginatedDailyReadings });

      await getDailyReadingHistory(2, 5);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.DAILY_READING.HISTORY, {
        params: { page: 2, limit: 5 },
      });
    });

    it('should throw error with clear message on failure', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getDailyReadingHistory(1, 10)).rejects.toThrow(
        'Error al obtener historial de cartas del día'
      );
    });
  });

  // ==========================================================================
  // regenerateDailyReading
  // ==========================================================================
  describe('regenerateDailyReading', () => {
    it('should POST to regenerate endpoint and return new daily reading', async () => {
      const regeneratedReading = { ...mockDailyReading, isRegenerated: true };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: regeneratedReading });

      const result = await regenerateDailyReading();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.DAILY_READING.REGENERATE);
      expect(result).toEqual(regeneratedReading);
      expect(result.isRegenerated).toBe(true);
    });

    it('should throw PremiumRequiredError when user is not premium', async () => {
      const error = {
        response: {
          status: 403,
          data: { message: 'Premium subscription required' },
        },
      };
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(regenerateDailyReading()).rejects.toThrow(
        'Se requiere suscripción Premium para regenerar la carta del día'
      );
    });

    it('should throw generic error for non-403 errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValueOnce(new Error('Network error'));

      await expect(regenerateDailyReading()).rejects.toThrow('Error al regenerar carta del día');
    });
  });
});
