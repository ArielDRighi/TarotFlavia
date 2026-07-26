/**
 * Tests for Horoscope Hooks (local-day + fallback)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useLocalDailyHoroscopes,
  useLocalHoroscope,
  useMyLocalSignHoroscope,
  horoscopeQueryKeys,
} from './useHoroscope';
import { ZodiacSign } from '@/types/horoscope.types';
import * as horoscopeApi from '@/lib/api/horoscope-api';

const TODAY = '2026-07-25';
const YESTERDAY = '2026-07-24';

// Fixed "today" so the local-day rollover is deterministic in tests.
vi.mock('@/hooks/utils/useLocalToday', () => ({
  useLocalToday: () => TODAY,
}));

// Auth store: controls birthDate for useMyLocalSignHoroscope.
const mockUser = vi.fn<() => { birthDate?: string | null } | null>(() => null);
vi.mock('@/stores/authStore', () => ({
  useAuthStore: (selector: (s: { user: { birthDate?: string | null } | null }) => unknown) =>
    selector({ user: mockUser() }),
}));

vi.mock('@/lib/api/horoscope-api', () => ({
  getHoroscopeByDate: vi.fn(),
  getHoroscopeByDateAndSign: vi.fn(),
}));

/** Build an axios-like error with an HTTP status. */
function httpError(status: number): Error {
  return Object.assign(new Error(`HTTP ${status}`), { response: { status } });
}

const mockHoroscope = {
  id: 1,
  zodiacSign: ZodiacSign.ARIES,
  horoscopeDate: TODAY,
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

describe('horoscope hooks (local day)', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    vi.clearAllMocks();
    mockUser.mockReturnValue(null);
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  describe('horoscopeQueryKeys', () => {
    it('scopes keys by date and by date+sign', () => {
      expect(horoscopeQueryKeys.byDate(TODAY)).toEqual(['horoscope', 'by-date', TODAY]);
      expect(horoscopeQueryKeys.byDateSign(TODAY, ZodiacSign.ARIES)).toEqual([
        'horoscope',
        'by-date',
        TODAY,
        ZodiacSign.ARIES,
      ]);
    });
  });

  describe('useLocalHoroscope', () => {
    it('fetches the horoscope for the local date', async () => {
      vi.mocked(horoscopeApi.getHoroscopeByDateAndSign).mockResolvedValue(mockHoroscope);

      const { result } = renderHook(() => useLocalHoroscope(ZodiacSign.ARIES), { wrapper });

      await waitFor(() => expect(result.current.data).toEqual(mockHoroscope));
      expect(horoscopeApi.getHoroscopeByDateAndSign).toHaveBeenCalledWith(TODAY, ZodiacSign.ARIES);
      expect(result.current.isShowingPreviousDay).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('falls back to yesterday when today is not generated yet (404)', async () => {
      vi.mocked(horoscopeApi.getHoroscopeByDateAndSign).mockImplementation((date: string) => {
        if (date === TODAY) return Promise.reject(httpError(404));
        return Promise.resolve({ ...mockHoroscope, horoscopeDate: YESTERDAY });
      });

      const { result } = renderHook(() => useLocalHoroscope(ZodiacSign.ARIES), { wrapper });

      await waitFor(() => expect(result.current.isShowingPreviousDay).toBe(true));
      expect(result.current.data?.horoscopeDate).toBe(YESTERDAY);
      expect(horoscopeApi.getHoroscopeByDateAndSign).toHaveBeenCalledWith(
        YESTERDAY,
        ZodiacSign.ARIES
      );
      // A 404 on "today" while yesterday resolves is NOT a surfaced error.
      expect(result.current.error).toBeNull();
    });

    it('surfaces an error when both today and yesterday fail with 404', async () => {
      vi.mocked(horoscopeApi.getHoroscopeByDateAndSign).mockRejectedValue(httpError(404));

      const { result } = renderHook(() => useLocalHoroscope(ZodiacSign.ARIES), { wrapper });

      await waitFor(() => expect(result.current.error).not.toBeNull());
      expect(result.current.data).toBeUndefined();
    });

    it('is disabled when sign is null', () => {
      const { result } = renderHook(() => useLocalHoroscope(null), { wrapper });

      expect(horoscopeApi.getHoroscopeByDateAndSign).not.toHaveBeenCalled();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toBeUndefined();
    });
  });

  describe('useLocalDailyHoroscopes', () => {
    it('fetches all horoscopes for the local date', async () => {
      vi.mocked(horoscopeApi.getHoroscopeByDate).mockResolvedValue([mockHoroscope]);

      const { result } = renderHook(() => useLocalDailyHoroscopes(), { wrapper });

      await waitFor(() => expect(result.current.data).toEqual([mockHoroscope]));
      expect(horoscopeApi.getHoroscopeByDate).toHaveBeenCalledWith(TODAY);
    });

    it('falls back to yesterday when today returns an empty list', async () => {
      vi.mocked(horoscopeApi.getHoroscopeByDate).mockImplementation((date: string) => {
        if (date === TODAY) return Promise.resolve([]);
        return Promise.resolve([{ ...mockHoroscope, horoscopeDate: YESTERDAY }]);
      });

      const { result } = renderHook(() => useLocalDailyHoroscopes(), { wrapper });

      await waitFor(() => expect(result.current.isShowingPreviousDay).toBe(true));
      expect(result.current.data?.[0].horoscopeDate).toBe(YESTERDAY);
      expect(horoscopeApi.getHoroscopeByDate).toHaveBeenCalledWith(YESTERDAY);
    });
  });

  describe('useMyLocalSignHoroscope', () => {
    it('returns errorState no-birthdate when the user has no birth date', () => {
      mockUser.mockReturnValue({ birthDate: null });

      const { result } = renderHook(() => useMyLocalSignHoroscope(), { wrapper });

      expect(result.current.errorState).toBe('no-birthdate');
      expect(horoscopeApi.getHoroscopeByDateAndSign).not.toHaveBeenCalled();
    });

    it('resolves the sign from birthDate and fetches the local-day horoscope', async () => {
      mockUser.mockReturnValue({ birthDate: '1990-03-25' }); // Aries
      vi.mocked(horoscopeApi.getHoroscopeByDateAndSign).mockResolvedValue(mockHoroscope);

      const { result } = renderHook(() => useMyLocalSignHoroscope(), { wrapper });

      await waitFor(() => expect(result.current.data).toEqual(mockHoroscope));
      expect(result.current.errorState).toBeNull();
      expect(horoscopeApi.getHoroscopeByDateAndSign).toHaveBeenCalledWith(TODAY, ZodiacSign.ARIES);
    });
  });
});
