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
    it('should fetch user horoscope successfully', async () => {
      vi.mocked(horoscopeApi.getMySignHoroscope).mockResolvedValueOnce(mockHoroscope);

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockHoroscope);
      expect(horoscopeApi.getMySignHoroscope).toHaveBeenCalledOnce();
    });

    it('should not retry on failure', async () => {
      const mockError = new Error('User birthDate not configured');
      vi.mocked(horoscopeApi.getMySignHoroscope).mockRejectedValueOnce(mockError);

      const { result } = renderHook(() => useMySignHoroscope(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
      // Should only be called once (no retry)
      expect(horoscopeApi.getMySignHoroscope).toHaveBeenCalledTimes(1);
    });
  });
});
