import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { getUpcomingEvents, getTodayEvents, getMonthEvents } from './sacred-calendar-api';
import type { SacredEvent } from '@/types';
import { SacredEventType, ImportanceLevel, RitualCategory } from '@/types';

vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('Sacred Calendar API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSacredEvent: SacredEvent = {
    id: 1,
    name: 'Luna Llena',
    slug: 'luna-llena-2025-01',
    description: 'Luna Llena en el mes de Enero',
    eventType: SacredEventType.LUNAR_PHASE,
    eventDate: '2025-01-15',
    eventTime: '14:30',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Momento de culminación',
    suggestedRitualCategories: [RitualCategory.LUNAR],
    suggestedRitualIds: [1, 2],
    lunarPhase: 'full_moon',
    sabbat: null,
    hemisphere: 'south',
  };

  describe('getUpcomingEvents', () => {
    it('should call correct endpoint with default days parameter', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUpcomingEvents();

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.SACRED_CALENDAR.UPCOMING}?days=30`
      );
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with custom days parameter', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUpcomingEvents(7);

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.SACRED_CALENDAR.UPCOMING}?days=7`
      );
      expect(result).toEqual(mockData);
    });

    it('should return array of sacred events', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUpcomingEvents();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockSacredEvent);
    });

    it('should handle empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getUpcomingEvents();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getUpcomingEvents()).rejects.toThrow('Network error');
    });
  });

  describe('getTodayEvents', () => {
    it('should call correct endpoint', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getTodayEvents();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.TODAY);
      expect(result).toEqual(mockData);
    });

    it('should return array of sacred events', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getTodayEvents();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockSacredEvent);
    });

    it('should handle empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getTodayEvents();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getTodayEvents()).rejects.toThrow('Network error');
    });
  });

  describe('getMonthEvents', () => {
    it('should call correct endpoint with year and month', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getMonthEvents(2025, 1);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.MONTH(2025, 1));
      expect(result).toEqual(mockData);
    });

    it('should return array of sacred events', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getMonthEvents(2025, 12);

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockSacredEvent);
    });

    it('should handle empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getMonthEvents(2025, 6);

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getMonthEvents(2025, 1)).rejects.toThrow('Network error');
    });
  });
});
