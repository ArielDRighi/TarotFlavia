/**
 * Tests for admin-chinese-horoscope-api
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getChineseHoroscopeAdminStatus,
  generateMissingChineseHoroscopes,
} from './admin-chinese-horoscope-api';
import { API_ENDPOINTS } from './endpoints';
import type {
  ChineseHoroscopeYearStatus,
  GenerateMissingResponse,
} from '@/types/admin-chinese-horoscope.types';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('admin-chinese-horoscope-api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getChineseHoroscopeAdminStatus', () => {
    it('should call correct endpoint and return year status', async () => {
      const mockStatus: ChineseHoroscopeYearStatus = {
        year: 2026,
        total: 60,
        generated: 58,
        missing: [
          { animal: ChineseZodiacAnimal.RAT, element: 'metal' },
          { animal: ChineseZodiacAnimal.OX, element: 'water' },
        ],
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      const result = await getChineseHoroscopeAdminStatus(2026);

      expect(apiClient.get).toHaveBeenCalledWith(
        API_ENDPOINTS.CHINESE_HOROSCOPE.ADMIN_STATUS(2026)
      );
      expect(result).toEqual(mockStatus);
    });

    it('should return generated=60 and empty missing when all exist', async () => {
      const mockStatus: ChineseHoroscopeYearStatus = {
        year: 2026,
        total: 60,
        generated: 60,
        missing: [],
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockStatus });

      const result = await getChineseHoroscopeAdminStatus(2026);

      expect(result.generated).toBe(60);
      expect(result.missing).toHaveLength(0);
    });

    it('should propagate errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Forbidden'));

      await expect(getChineseHoroscopeAdminStatus(2026)).rejects.toThrow('Forbidden');
    });
  });

  describe('generateMissingChineseHoroscopes', () => {
    it('should call correct endpoint and return message', async () => {
      const mockResponse: GenerateMissingResponse = {
        message: 'Generación de 2 horóscopos faltantes iniciada para 2026',
        details: 'La generación se está ejecutando en background.',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResponse });

      const result = await generateMissingChineseHoroscopes(2026);

      expect(apiClient.post).toHaveBeenCalledWith(
        API_ENDPOINTS.CHINESE_HOROSCOPE.ADMIN_GENERATE_MISSING(2026)
      );
      expect(result.message).toContain('2026');
    });

    it('should propagate errors', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(generateMissingChineseHoroscopes(2026)).rejects.toThrow('Network error');
    });
  });
});
