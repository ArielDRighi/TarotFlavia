/**
 * Tests for useAdminChineseHoroscope hooks (TDD - Red Phase)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement } from 'react';
import {
  useChineseHoroscopeAdminStatus,
  useGenerateMissingChineseHoroscopes,
} from './useAdminChineseHoroscope';
import * as api from '@/lib/api/admin-chinese-horoscope-api';
import type { ChineseHoroscopeYearStatus } from '@/types/admin-chinese-horoscope.types';
import { ChineseZodiacAnimal } from '@/types/chinese-horoscope.types';

vi.mock('@/lib/api/admin-chinese-horoscope-api');

describe('useAdminChineseHoroscope hooks', () => {
  let queryClient: QueryClient;
  let wrapper: React.FC<{ children: React.ReactNode }>;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    wrapper = ({ children }) =>
      createElement(QueryClientProvider, { client: queryClient }, children);
    vi.clearAllMocks();
  });

  describe('useChineseHoroscopeAdminStatus', () => {
    it('should fetch year status successfully', async () => {
      const mockStatus: ChineseHoroscopeYearStatus = {
        year: 2026,
        total: 60,
        generated: 58,
        missing: [
          { animal: ChineseZodiacAnimal.RAT, element: 'metal' },
          { animal: ChineseZodiacAnimal.OX, element: 'water' },
        ],
      };
      vi.mocked(api.getChineseHoroscopeAdminStatus).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useChineseHoroscopeAdminStatus(2026), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStatus);
      expect(api.getChineseHoroscopeAdminStatus).toHaveBeenCalledWith(2026);
    });

    it('should always fetch on mount even when polling is disabled', async () => {
      const mockStatus: ChineseHoroscopeYearStatus = {
        year: 2026,
        total: 60,
        generated: 58,
        missing: [{ animal: ChineseZodiacAnimal.RAT, element: 'metal' }],
      };
      vi.mocked(api.getChineseHoroscopeAdminStatus).mockResolvedValue(mockStatus);

      const { result } = renderHook(
        () => useChineseHoroscopeAdminStatus(2026, { pollingEnabled: false }),
        { wrapper }
      );

      // La query siempre carga aunque el polling esté desactivado
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data).toEqual(mockStatus);
      expect(api.getChineseHoroscopeAdminStatus).toHaveBeenCalledTimes(1);
    });

    it('should handle errors', async () => {
      vi.mocked(api.getChineseHoroscopeAdminStatus).mockRejectedValue(new Error('Forbidden'));

      const { result } = renderHook(() => useChineseHoroscopeAdminStatus(2026), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));
    });

    it('should return generated=60 when all horoscopes exist', async () => {
      const mockStatus: ChineseHoroscopeYearStatus = {
        year: 2026,
        total: 60,
        generated: 60,
        missing: [],
      };
      vi.mocked(api.getChineseHoroscopeAdminStatus).mockResolvedValue(mockStatus);

      const { result } = renderHook(() => useChineseHoroscopeAdminStatus(2026), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(result.current.data?.generated).toBe(60);
      expect(result.current.data?.missing).toHaveLength(0);
    });
  });

  describe('useGenerateMissingChineseHoroscopes', () => {
    it('should call generate API on mutate', async () => {
      const mockResponse = {
        message: 'Generación de 2 horóscopos faltantes iniciada para 2026',
        details: 'La generación se está ejecutando en background.',
      };
      vi.mocked(api.generateMissingChineseHoroscopes).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useGenerateMissingChineseHoroscopes(), { wrapper });
      result.current.mutate(2026);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));
      expect(api.generateMissingChineseHoroscopes).toHaveBeenCalledWith(2026);
      expect(result.current.data?.message).toContain('2026');
    });

    it('should handle errors', async () => {
      vi.mocked(api.generateMissingChineseHoroscopes).mockRejectedValue(new Error('Bad Request'));

      const { result } = renderHook(() => useGenerateMissingChineseHoroscopes(), { wrapper });
      result.current.mutate(2026);

      await waitFor(() => expect(result.current.isError).toBe(true));
    });
  });
});
