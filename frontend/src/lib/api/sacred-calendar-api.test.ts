/**
 * Tests for Sacred Calendar API Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getUpcomingEvents,
  getTodayEvents,
  getEventsByDateRange,
  getEventById,
} from './sacred-calendar-api';
import { SacredEventType, ImportanceLevel, type SacredEvent } from '@/types/sacred-calendar.types';
import { RitualCategory } from '@/types/ritual.types';
import { API_ENDPOINTS } from './endpoints';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('sacred-calendar API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockSacredEvent: SacredEvent = {
    id: 1,
    name: 'Luna Nueva en Capricornio',
    slug: 'luna-nueva-capricornio-2026',
    description: 'Primera luna nueva del año, perfecta para establecer intenciones',
    eventType: SacredEventType.LUNAR_PHASE,
    eventDate: '2026-01-17T18:00:00Z',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía de nuevos comienzos y establecimiento de metas a largo plazo',
    suggestedRitualCategories: [RitualCategory.LUNAR, RitualCategory.MEDITATION],
    lunarPhase: 'new_moon',
  };

  const mockSabbatEvent: SacredEvent = {
    id: 2,
    name: 'Imbolc',
    slug: 'imbolc-2026',
    description: 'Sabbat de purificación y primeros signos de primavera',
    eventType: SacredEventType.SABBAT,
    eventDate: '2026-02-02T00:00:00Z',
    importance: ImportanceLevel.HIGH,
    energyDescription: 'Energía de limpieza, renovación y esperanza',
    suggestedRitualCategories: [RitualCategory.CLEANSING, RitualCategory.PROTECTION],
    lunarPhase: null,
  };

  describe('getUpcomingEvents', () => {
    it('should call correct endpoint with default days parameter', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUpcomingEvents();

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.SACRED_CALENDAR.UPCOMING}?days=7`
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });

    it('should call correct endpoint with custom days parameter', async () => {
      const mockData = [mockSacredEvent, mockSabbatEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUpcomingEvents(14);

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.SACRED_CALENDAR.UPCOMING}?days=14`
      );
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no upcoming events', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getUpcomingEvents(30);

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.SACRED_CALENDAR.UPCOMING}?days=30`
      );
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getTodayEvents', () => {
    it('should call correct endpoint and return today events', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getTodayEvents();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.TODAY);
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(1);
    });

    it('should return empty array when no events today', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getTodayEvents();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.TODAY);
      expect(result).toEqual([]);
    });

    it('should return multiple events if multiple events today', async () => {
      const mockData = [mockSacredEvent, mockSabbatEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getTodayEvents();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.TODAY);
      expect(result).toHaveLength(2);
    });
  });

  describe('getEventsByDateRange', () => {
    const startDate = '2026-01-01T00:00:00Z';
    const endDate = '2026-01-31T23:59:59Z';

    it('should call correct endpoint with date range', async () => {
      const mockData = [mockSacredEvent, mockSabbatEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getEventsByDateRange(startDate, endDate);

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(API_ENDPOINTS.SACRED_CALENDAR.BY_DATE_RANGE)
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`startDate=${encodeURIComponent(startDate)}`)
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`endDate=${encodeURIComponent(endDate)}`)
      );
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with eventType filter', async () => {
      const mockData = [mockSacredEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getEventsByDateRange(startDate, endDate, {
        eventType: SacredEventType.LUNAR_PHASE,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`eventType=${SacredEventType.LUNAR_PHASE}`)
      );
      expect(result).toEqual(mockData);
      expect(result[0].eventType).toBe(SacredEventType.LUNAR_PHASE);
    });

    it('should call correct endpoint with importance filter', async () => {
      const mockData = [mockSacredEvent, mockSabbatEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getEventsByDateRange(startDate, endDate, {
        importance: ImportanceLevel.HIGH,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`importance=${ImportanceLevel.HIGH}`)
      );
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with multiple filters', async () => {
      const mockData = [mockSabbatEvent];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getEventsByDateRange(startDate, endDate, {
        eventType: SacredEventType.SABBAT,
        importance: ImportanceLevel.HIGH,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`eventType=${SacredEventType.SABBAT}`)
      );
      expect(apiClient.get).toHaveBeenCalledWith(
        expect.stringContaining(`importance=${ImportanceLevel.HIGH}`)
      );
      expect(result).toEqual(mockData);
      expect(result[0].eventType).toBe(SacredEventType.SABBAT);
    });

    it('should return empty array when no events in date range', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getEventsByDateRange(startDate, endDate);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  describe('getEventById', () => {
    it('should call correct endpoint with event ID and return event', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSacredEvent });

      const result = await getEventById(1);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.BY_ID(1));
      expect(result).toEqual(mockSacredEvent);
      expect(result.id).toBe(1);
    });

    it('should work with different event IDs', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockSabbatEvent });

      const result = await getEventById(2);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.SACRED_CALENDAR.BY_ID(2));
      expect(result).toEqual(mockSabbatEvent);
      expect(result.id).toBe(2);
      expect(result.eventType).toBe(SacredEventType.SABBAT);
    });
  });
});
