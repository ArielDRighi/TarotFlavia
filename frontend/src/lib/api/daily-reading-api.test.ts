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
import type { DailyReading, PaginatedDailyReadings, DailyReadingHistoryItem } from '@/types';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock data matching backend DailyReadingResponseDto
const mockDailyReading: DailyReading = {
  id: 1,
  userId: 1,
  tarotistaId: 1,
  card: {
    id: 1,
    name: 'El Mago',
    number: 1,
    category: 'arcanos_mayores',
    imageUrl: '/cards/magician.jpg',
    reversedImageUrl: '/cards/magician-reversed.jpg',
    meaningUpright: 'Manifestación, poder personal',
    meaningReversed: 'Manipulación, engaño',
    description: 'El Mago representa el poder de la voluntad',
    keywords: 'voluntad, acción, manifestación',
    deckId: 1,
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-01'),
  },
  isReversed: false,
  interpretation:
    'El Mago te indica que tienes todas las herramientas necesarias para lograr tus metas hoy.',
  readingDate: '2025-12-09',
  wasRegenerated: false,
  createdAt: new Date('2025-12-09T08:00:00Z'),
};

// Mock data matching backend DailyReadingHistoryDto (flat structure)
const mockHistoryItem: DailyReadingHistoryItem = {
  id: 1,
  readingDate: '2025-12-09',
  cardName: 'El Mago',
  isReversed: false,
  interpretationSummary: 'El Mago te indica que tienes todas las herramientas necesarias...',
  wasRegenerated: false,
  createdAt: new Date('2025-12-09T08:00:00Z'),
};

const mockPaginatedDailyReadings: PaginatedDailyReadings = {
  items: [
    mockHistoryItem,
    {
      ...mockHistoryItem,
      id: 2,
      readingDate: '2025-12-08',
      cardName: 'La Sacerdotisa',
    },
  ],
  total: 2,
  page: 1,
  limit: 10,
  totalPages: 1,
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

    it('should throw AxiosError when daily reading already exists (409)', async () => {
      const error = { response: { status: 409, data: {} }, config: {} };
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(getDailyReading()).rejects.toMatchObject({ response: { status: 409 } });
    });

    it('should re-throw original error for non-409 errors', async () => {
      const error = new Error('Network error');
      vi.mocked(apiClient.post).mockRejectedValueOnce(error);

      await expect(getDailyReading()).rejects.toThrow('Network error');
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

    it('should return null when no daily reading exists (backend returns null with 200)', async () => {
      // Backend returns null in response body with 200 status, NOT 404
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: null });

      const result = await getDailyReadingToday();

      expect(result).toBeNull();
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
      const regeneratedReading = { ...mockDailyReading, wasRegenerated: true };
      vi.mocked(apiClient.post).mockResolvedValueOnce({ data: regeneratedReading });

      const result = await regenerateDailyReading();

      expect(apiClient.post).toHaveBeenCalledWith(API_ENDPOINTS.DAILY_READING.REGENERATE);
      expect(result).toEqual(regeneratedReading);
      expect(result.wasRegenerated).toBe(true);
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
