/**
 * Tests for TanStack Query hooks for daily reading
 *
 * @vitest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { ReactNode } from 'react';

import {
  useDailyReading,
  useDailyReadingToday,
  useDailyReadingHistory,
  useRegenerateDailyReading,
  dailyReadingQueryKeys,
} from './useDailyReading';
import * as dailyReadingApi from '@/lib/api/daily-reading-api';
import * as invalidateUserDataUtil from '@/lib/utils/invalidate-user-data';
import type { DailyReading, PaginatedDailyReadings, DailyReadingHistoryItem } from '@/types';

// Mock the API module
vi.mock('@/lib/api/daily-reading-api');
vi.mock('@/lib/utils/invalidate-user-data');

// Mock custom toast wrapper
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

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
  interpretation: 'El Mago te indica que tienes todas las herramientas necesarias.',
  readingDate: '2025-12-09',
  wasRegenerated: false,
  createdAt: new Date('2025-12-09T08:00:00Z'),
};

// Mock data matching backend DailyReadingHistoryDto (flat structure)
const mockHistoryItem: DailyReadingHistoryItem = {
  id: 1,
  readingDate: '2025-12-09',
  cardName: 'El Mago',
  interpretationSummary: 'El Mago te indica...',
  wasRegenerated: false,
  isReversed: false,
  createdAt: new Date('2025-12-09T08:00:00Z'),
};

const mockPaginatedDailyReadings: PaginatedDailyReadings = {
  items: [mockHistoryItem],
  total: 1,
  page: 1,
  limit: 10,
  totalPages: 1,
};

describe('useDailyReading hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  // =========================================================================
  // Query Keys
  // =========================================================================
  describe('dailyReadingQueryKeys', () => {
    it('should have correct query key structure', () => {
      expect(dailyReadingQueryKeys.all).toEqual(['daily-reading']);
      expect(dailyReadingQueryKeys.today()).toEqual(['daily-reading', 'today']);
      expect(dailyReadingQueryKeys.history(1, 10)).toEqual([
        'daily-reading',
        'history',
        { page: 1, limit: 10 },
      ]);
    });
  });

  // =========================================================================
  // useDailyReading (mutation)
  // =========================================================================
  describe('useDailyReading', () => {
    it('should return mutation function', () => {
      const { result } = renderHook(() => useDailyReading(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.mutateAsync).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('should call getDailyReading API when mutated', async () => {
      vi.mocked(dailyReadingApi.getDailyReading).mockResolvedValueOnce(mockDailyReading);

      const { result } = renderHook(() => useDailyReading(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(dailyReadingApi.getDailyReading).toHaveBeenCalled();
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should call invalidateUserData on successful creation', async () => {
      vi.mocked(dailyReadingApi.getDailyReading).mockResolvedValueOnce(mockDailyReading);
      vi.mocked(invalidateUserDataUtil.invalidateUserData).mockResolvedValue(undefined);

      const queryClient = createTestQueryClient();
      const wrapper = ({ children }: { children: ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      );

      const { result } = renderHook(() => useDailyReading(), { wrapper });

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateUserDataUtil.invalidateUserData).toHaveBeenCalledWith(queryClient);
      expect(invalidateUserDataUtil.invalidateUserData).toHaveBeenCalledTimes(1);
    });

    it('should handle mutation error', async () => {
      vi.mocked(dailyReadingApi.getDailyReading).mockRejectedValueOnce(
        new Error('Error al obtener carta del día')
      );

      const { result } = renderHook(() => useDailyReading(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });
  });

  // =========================================================================
  // useDailyReadingToday (query)
  // =========================================================================
  describe('useDailyReadingToday', () => {
    it('should fetch today daily reading on mount', async () => {
      vi.mocked(dailyReadingApi.getDailyReadingToday).mockResolvedValueOnce(mockDailyReading);

      const { result } = renderHook(() => useDailyReadingToday(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockDailyReading);
      });

      expect(dailyReadingApi.getDailyReadingToday).toHaveBeenCalled();
    });

    it('should return null when no daily reading exists', async () => {
      vi.mocked(dailyReadingApi.getDailyReadingToday).mockResolvedValueOnce(null);

      const { result } = renderHook(() => useDailyReadingToday(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toBeNull();
      });
    });
  });

  // =========================================================================
  // useDailyReadingHistory (query)
  // =========================================================================
  describe('useDailyReadingHistory', () => {
    it('should fetch paginated history', async () => {
      vi.mocked(dailyReadingApi.getDailyReadingHistory).mockResolvedValueOnce(
        mockPaginatedDailyReadings
      );

      const { result } = renderHook(() => useDailyReadingHistory(1, 10), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
        expect(result.current.data).toEqual(mockPaginatedDailyReadings);
      });

      expect(dailyReadingApi.getDailyReadingHistory).toHaveBeenCalledWith(1, 10);
    });

    it('should use correct query key with page and limit', async () => {
      vi.mocked(dailyReadingApi.getDailyReadingHistory).mockResolvedValueOnce(
        mockPaginatedDailyReadings
      );

      const { result } = renderHook(() => useDailyReadingHistory(2, 5), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(dailyReadingApi.getDailyReadingHistory).toHaveBeenCalledWith(2, 5);
    });
  });

  // =========================================================================
  // useRegenerateDailyReading (mutation)
  // =========================================================================
  describe('useRegenerateDailyReading', () => {
    it('should return mutation function', () => {
      const { result } = renderHook(() => useRegenerateDailyReading(), {
        wrapper: createWrapper(),
      });

      expect(result.current.mutate).toBeDefined();
      expect(result.current.isPending).toBe(false);
    });

    it('should call regenerateDailyReading API when mutated', async () => {
      const regeneratedReading = { ...mockDailyReading, wasRegenerated: true };
      vi.mocked(dailyReadingApi.regenerateDailyReading).mockResolvedValueOnce(regeneratedReading);

      const { result } = renderHook(() => useRegenerateDailyReading(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(dailyReadingApi.regenerateDailyReading).toHaveBeenCalled();
        expect(result.current.isSuccess).toBe(true);
      });
    });

    it('should handle Premium required error', async () => {
      vi.mocked(dailyReadingApi.regenerateDailyReading).mockRejectedValueOnce(
        new Error('Se requiere suscripción Premium para regenerar la carta del día')
      );

      const { result } = renderHook(() => useRegenerateDailyReading(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
        expect(result.current.error?.message).toContain('Premium');
      });
    });
  });
});
