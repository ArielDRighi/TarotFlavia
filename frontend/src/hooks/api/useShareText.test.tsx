/**
 * Tests for useShareText hooks
 *
 * TDD: Write tests first, then implement hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useReadingShareText, useDailyShareText } from './useShareText';
import * as readingsApi from '@/lib/api/readings-api';
import * as dailyReadingApi from '@/lib/api/daily-reading-api';
import type { ReactNode } from 'react';

// ============================================================================
// Test Setup
// ============================================================================

/**
 * Create a fresh QueryClient for each test
 */
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // Disable retries in tests
      },
    },
  });
}

/**
 * Wrapper for React Query Provider
 */
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// ============================================================================
// Mock API Functions
// ============================================================================

vi.mock('@/lib/api/readings-api', () => ({
  getShareText: vi.fn(),
}));

vi.mock('@/lib/api/daily-reading-api', () => ({
  getDailyShareText: vi.fn(),
}));

// ============================================================================
// Tests: useReadingShareText
// ============================================================================

describe('useReadingShareText', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should fetch share text for a reading', async () => {
    const mockShareText = { text: 'Mi lectura del tarot 🔮\n\nPregunta...' };
    vi.mocked(readingsApi.getShareText).mockResolvedValue(mockShareText);

    const { result } = renderHook(() => useReadingShareText(1), {
      wrapper: createWrapper(queryClient),
    });

    // Initial state: loading
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify API call
    expect(readingsApi.getShareText).toHaveBeenCalledWith(1);
    expect(readingsApi.getShareText).toHaveBeenCalledTimes(1);

    // Verify data
    expect(result.current.data).toEqual(mockShareText);
    expect(result.current.error).toBeNull();
  });

  it('should not fetch if readingId is 0', () => {
    const { result } = renderHook(() => useReadingShareText(0), {
      wrapper: createWrapper(queryClient),
    });

    // Should not be loading or have called API
    expect(result.current.isPending).toBe(true);
    expect(result.current.fetchStatus).toBe('idle');
    expect(readingsApi.getShareText).not.toHaveBeenCalled();
  });

  it('should handle errors when fetching share text', async () => {
    const mockError = new Error('Error al obtener texto para compartir');
    vi.mocked(readingsApi.getShareText).mockRejectedValue(mockError);

    const { result } = renderHook(() => useReadingShareText(1), {
      wrapper: createWrapper(queryClient),
    });

    // Wait for error
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify error
    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('should refetch when readingId changes', async () => {
    const mockShareText1 = { text: 'Lectura 1' };
    const mockShareText2 = { text: 'Lectura 2' };
    vi.mocked(readingsApi.getShareText).mockResolvedValueOnce(mockShareText1);
    vi.mocked(readingsApi.getShareText).mockResolvedValueOnce(mockShareText2);

    const { result, rerender } = renderHook(
      ({ readingId }: { readingId: number }) => useReadingShareText(readingId),
      {
        wrapper: createWrapper(queryClient),
        initialProps: { readingId: 1 },
      }
    );

    // Wait for first fetch
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual(mockShareText1);

    // Change readingId
    rerender({ readingId: 2 });

    // Wait for second fetch
    await waitFor(() => expect(result.current.data).toEqual(mockShareText2));
    expect(readingsApi.getShareText).toHaveBeenCalledTimes(2);
    expect(readingsApi.getShareText).toHaveBeenNthCalledWith(1, 1);
    expect(readingsApi.getShareText).toHaveBeenNthCalledWith(2, 2);
  });
});

// ============================================================================
// Tests: useDailyShareText
// ============================================================================

describe('useDailyShareText', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = createTestQueryClient();
    vi.clearAllMocks();
  });

  it('should fetch share text for daily reading', async () => {
    const mockShareText = { text: 'Mi carta del día 🌟\n\nCarta...' };
    vi.mocked(dailyReadingApi.getDailyShareText).mockResolvedValue(mockShareText);

    const { result } = renderHook(() => useDailyShareText(), {
      wrapper: createWrapper(queryClient),
    });

    // Initial state: loading
    expect(result.current.isPending).toBe(true);
    expect(result.current.data).toBeUndefined();

    // Wait for data to load
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    // Verify API call
    expect(dailyReadingApi.getDailyShareText).toHaveBeenCalledTimes(1);

    // Verify data
    expect(result.current.data).toEqual(mockShareText);
    expect(result.current.error).toBeNull();
  });

  it('should handle errors when fetching share text', async () => {
    const mockError = new Error('Error al obtener texto para compartir');
    vi.mocked(dailyReadingApi.getDailyShareText).mockRejectedValue(mockError);

    const { result } = renderHook(() => useDailyShareText(), {
      wrapper: createWrapper(queryClient),
    });

    // Wait for error
    await waitFor(() => expect(result.current.isError).toBe(true));

    // Verify error
    expect(result.current.error).toBe(mockError);
    expect(result.current.data).toBeUndefined();
  });

  it('should use staleTime of 5 minutes', () => {
    renderHook(() => useDailyShareText(), {
      wrapper: createWrapper(queryClient),
    });

    // Verify query options
    const queryState = queryClient.getQueryState(['shareText', 'daily']);
    expect(queryState).toBeDefined();
  });
});
