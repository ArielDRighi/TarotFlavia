/**
 * Tests for Horoscope Hooks
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTodayAllHoroscopes,
  useTodayHoroscope,
  useMySignHoroscope,
  horoscopeQueryKeys,
} from './useHoroscope';
import { ZodiacSign } from '@/types/horoscope.types';
import * as horoscopeApi from '@/lib/api/horoscope-api';
import { vi } from 'vitest';

// Mock API functions
vi.mock('@/lib/api/horoscope-api', () => ({
  getTodayAllHoroscopes: vi.fn(),
  getTodayHoroscope: vi.fn(),
  getMySignHoroscope: vi.fn(),
}));

describe('horoscope hooks', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test to ensure isolation
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Disable retries for tests
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

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

  describe('horoscopeQueryKeys', () => {
    it('should have correct query key structure', () => {
      expect(horoscopeQueryKeys.all).toEqual(['horoscope']);
      expect(horoscopeQueryKeys.todayAll()).toEqual(['horoscope', 'today', 'all']);
      expect(horoscopeQueryKeys.todaySign(ZodiacSign.ARIES)).toEqual([
        'horoscope',
        'today',
        ZodiacSign.ARIES,
      ]);
      expect(horoscopeQueryKeys.mySign()).toEqual(['horoscope', 'my-sign']);
    });
  });

  describe('useTodayAllHoroscopes', () => {
    it('should fetch all horoscopes successfully', async () => {
      const mockData = [mockHoroscope, { ...mockHoroscope, id: 2, zodiacSign: ZodiacSign.TAURUS }];
      vi.mocked(horoscopeApi.getTodayAllHoroscopes).mockResolvedValueOnce(mockData);

      const { result } = renderHook(() => useTodayAllHoroscopes(), { wrapper });

      // Initially loading
      expect(result.current.isLoading).toBe(true);

      // Wait for query to complete
      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.data).toHaveLength(2);
      expect(horoscopeApi.getTodayAllHoroscopes).toHaveBeenCalledOnce();
    });

    it('should handle errors', async () => {
      const mockError = new Error('API Error');
      vi.mocked(horoscopeApi.getTodayAllHoroscopes).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTodayAllHoroscopes(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should have 1 hour staleTime', () => {
      renderHook(() => useTodayAllHoroscopes(), { wrapper });

      // Query options should include staleTime
      const queryState = queryClient.getQueryState(horoscopeQueryKeys.todayAll());
      expect(queryState).toBeDefined();
    });
  });

  describe('useTodayHoroscope', () => {
    it('should fetch horoscope for specific sign', async () => {
      vi.mocked(horoscopeApi.getTodayHoroscope).mockResolvedValueOnce(mockHoroscope);

      const { result } = renderHook(() => useTodayHoroscope(ZodiacSign.ARIES), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHoroscope);
      expect(horoscopeApi.getTodayHoroscope).toHaveBeenCalledWith(ZodiacSign.ARIES);
    });

    it('should handle errors when API fails', async () => {
      const mockError = new Error('API Error');
      vi.mocked(horoscopeApi.getTodayHoroscope).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useTodayHoroscope(ZodiacSign.TAURUS), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should fetch different signs independently', async () => {
      const ariesHoroscope = { ...mockHoroscope, zodiacSign: ZodiacSign.ARIES };
      const taurusHoroscope = { ...mockHoroscope, id: 2, zodiacSign: ZodiacSign.TAURUS };

      vi.mocked(horoscopeApi.getTodayHoroscope)
        .mockResolvedValueOnce(ariesHoroscope)
        .mockResolvedValueOnce(taurusHoroscope);

      const { result: ariesResult } = renderHook(() => useTodayHoroscope(ZodiacSign.ARIES), {
        wrapper,
      });
      const { result: taurusResult } = renderHook(() => useTodayHoroscope(ZodiacSign.TAURUS), {
        wrapper,
      });

      await waitFor(() => {
        expect(ariesResult.current.isSuccess).toBe(true);
        expect(taurusResult.current.isSuccess).toBe(true);
      });

      expect(ariesResult.current.data?.zodiacSign).toBe(ZodiacSign.ARIES);
      expect(taurusResult.current.data?.zodiacSign).toBe(ZodiacSign.TAURUS);
      expect(horoscopeApi.getTodayHoroscope).toHaveBeenCalledTimes(2);
    });
  });

  describe('useMySignHoroscope', () => {
    // Helper para crear errores tipo Axios con status específico
    function makeAxiosError(status: number, message = 'Request failed'): Error {
      const error = new Error(message) as Error & {
        response?: { status: number; data?: unknown };
        isAxiosError?: boolean;
      };
      error.response = { status };
      error.isAxiosError = true;
      return error;
    }

    beforeEach(() => {
      // Override queryClient para permitir que el hook controle su política de retry,
      // pero con retryDelay=0 para que los tests sean rápidos
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            gcTime: 0,
            retryDelay: 0,
          },
        },
      });
    });

    it('should fetch user horoscope successfully', async () => {
      vi.mocked(horoscopeApi.getMySignHoroscope).mockResolvedValueOnce(mockHoroscope);

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHoroscope);
      expect(result.current.errorState).toBeNull();
      expect(horoscopeApi.getMySignHoroscope).toHaveBeenCalledOnce();
    });

    it('should expose errorState="no-birthdate" on 400 and NOT retry', async () => {
      const error400 = makeAxiosError(400, 'birthDate is required');
      vi.mocked(horoscopeApi.getMySignHoroscope).mockRejectedValue(error400);

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.errorState).toBe('no-birthdate');
      expect(horoscopeApi.getMySignHoroscope).toHaveBeenCalledTimes(1);
    });

    it('should expose errorState="not-generated" on 404 and NOT retry', async () => {
      const error404 = makeAxiosError(404, 'Horoscope not found');
      vi.mocked(horoscopeApi.getMySignHoroscope).mockRejectedValue(error404);

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.errorState).toBe('not-generated');
      expect(horoscopeApi.getMySignHoroscope).toHaveBeenCalledTimes(1);
    });

    it('should expose errorState="error" on 500 and retry up to 2 times', async () => {
      const error500 = makeAxiosError(500, 'Internal Server Error');
      vi.mocked(horoscopeApi.getMySignHoroscope).mockRejectedValue(error500);

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(result.current.errorState).toBe('error');
      // 1 intento original + 2 reintentos = 3 llamadas
      expect(horoscopeApi.getMySignHoroscope).toHaveBeenCalledTimes(3);
    }, 10000);

    it('should treat unknown errors (without status) as generic "error"', async () => {
      vi.mocked(horoscopeApi.getMySignHoroscope).mockRejectedValue(new Error('Network down'));

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 5000 }
      );

      expect(result.current.errorState).toBe('error');
    }, 10000);
  });
});
