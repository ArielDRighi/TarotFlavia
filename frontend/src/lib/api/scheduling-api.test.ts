/**
 * Tests for Scheduling API Service
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAvailableSlots } from './scheduling-api';
import { apiClient } from './axios-config';
import type { TimeSlot } from '@/types';

// Mock axios client
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Scheduling API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAvailableSlots', () => {
    it('should fetch available slots successfully', async () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 60, available: true },
        { date: '2025-12-15', time: '10:00', durationMinutes: 60, available: false },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSlots });

      const result = await getAvailableSlots({
        tarotistaId: 1,
        date: '2025-12-15',
      });

      expect(result).toEqual(mockSlots);
      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/available-slots', {
        params: {
          tarotistaId: 1,
          startDate: '2025-12-15',
          endDate: '2025-12-15',
          durationMinutes: undefined,
        },
      });
    });

    it('should include durationMinutes when provided', async () => {
      const mockSlots: TimeSlot[] = [];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSlots });

      await getAvailableSlots({
        tarotistaId: 1,
        date: '2025-12-15',
        durationMinutes: 60,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/available-slots', {
        params: {
          tarotistaId: 1,
          startDate: '2025-12-15',
          endDate: '2025-12-15',
          durationMinutes: 60,
        },
      });
    });

    it('should transform single date param to startDate and endDate', async () => {
      const mockSlots: TimeSlot[] = [];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSlots });

      await getAvailableSlots({
        tarotistaId: 2,
        date: '2025-12-20',
      });

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/available-slots', {
        params: expect.objectContaining({
          startDate: '2025-12-20',
          endDate: '2025-12-20',
        }),
      });
    });

    it('should throw error with message when API call fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(
        getAvailableSlots({
          tarotistaId: 1,
          date: '2025-12-15',
        })
      ).rejects.toThrow('Error al obtener slots disponibles');
    });

    it('should handle empty slots array', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getAvailableSlots({
        tarotistaId: 1,
        date: '2025-12-15',
      });

      expect(result).toEqual([]);
    });

    it('should pass all parameters correctly to API client', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      await getAvailableSlots({
        tarotistaId: 5,
        date: '2025-12-25',
        durationMinutes: 90,
      });

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/available-slots', {
        params: {
          tarotistaId: 5,
          startDate: '2025-12-25',
          endDate: '2025-12-25',
          durationMinutes: 90,
        },
      });
    });
  });
});
