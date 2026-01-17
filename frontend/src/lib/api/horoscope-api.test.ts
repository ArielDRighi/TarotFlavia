/**
 * Tests for Horoscope API Functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getTodayAllHoroscopes,
  getTodayHoroscope,
  getMySignHoroscope,
  getHoroscopeByDate,
  getHoroscopeByDateAndSign,
} from './horoscope-api';
import { ZodiacSign } from '@/types/horoscope.types';
import { API_ENDPOINTS } from './endpoints';

// Mock apiClient
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

describe('horoscope API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockHoroscope = {
    id: 1,
    zodiacSign: ZodiacSign.ARIES,
    horoscopeDate: '2026-01-17',
    generalContent: 'Hoy es un buen día...',
    areas: {
      love: { content: 'Amor...', score: 8 },
      wellness: { content: 'Bienestar...', score: 9 },
      money: { content: 'Dinero...', score: 7 },
    },
    luckyNumber: 7,
    luckyColor: 'Verde',
    luckyTime: 'Media mañana',
  };

  describe('getTodayAllHoroscopes', () => {
    it('should call correct endpoint and return horoscopes array', async () => {
      const mockData = [mockHoroscope, { ...mockHoroscope, id: 2, zodiacSign: ZodiacSign.TAURUS }];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getTodayAllHoroscopes();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.HOROSCOPE.TODAY_ALL);
      expect(result).toEqual(mockData);
      expect(result).toHaveLength(2);
    });
  });

  describe('getTodayHoroscope', () => {
    it('should call correct endpoint with sign and return horoscope', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHoroscope });

      const result = await getTodayHoroscope(ZodiacSign.ARIES);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.HOROSCOPE.TODAY_SIGN(ZodiacSign.ARIES));
      expect(result).toEqual(mockHoroscope);
      expect(result.zodiacSign).toBe(ZodiacSign.ARIES);
    });

    it('should work with different zodiac signs', async () => {
      const leoHoroscope = { ...mockHoroscope, zodiacSign: ZodiacSign.LEO };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: leoHoroscope });

      const result = await getTodayHoroscope(ZodiacSign.LEO);

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.HOROSCOPE.TODAY_SIGN(ZodiacSign.LEO));
      expect(result.zodiacSign).toBe(ZodiacSign.LEO);
    });
  });

  describe('getMySignHoroscope', () => {
    it('should call correct endpoint and return horoscope', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHoroscope });

      const result = await getMySignHoroscope();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.HOROSCOPE.MY_SIGN);
      expect(result).toEqual(mockHoroscope);
    });
  });

  describe('getHoroscopeByDate', () => {
    it('should call correct endpoint with date and return horoscopes array', async () => {
      const mockData = [mockHoroscope];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getHoroscopeByDate('2026-01-17');

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.HOROSCOPE.BY_DATE('2026-01-17'));
      expect(result).toEqual(mockData);
    });
  });

  describe('getHoroscopeByDateAndSign', () => {
    it('should call correct endpoint with date and sign', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockHoroscope });

      const result = await getHoroscopeByDateAndSign('2026-01-17', ZodiacSign.ARIES);

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.HOROSCOPE.BY_DATE_SIGN('2026-01-17', ZodiacSign.ARIES)
      );
      expect(result).toEqual(mockHoroscope);
    });

    it('should work with different dates and signs', async () => {
      const capricornHoroscope = { ...mockHoroscope, zodiacSign: ZodiacSign.CAPRICORN };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: capricornHoroscope });

      const result = await getHoroscopeByDateAndSign('2025-12-25', ZodiacSign.CAPRICORN);

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.HOROSCOPE.BY_DATE_SIGN('2025-12-25', ZodiacSign.CAPRICORN)
      );
      expect(result.zodiacSign).toBe(ZodiacSign.CAPRICORN);
    });
  });
});
