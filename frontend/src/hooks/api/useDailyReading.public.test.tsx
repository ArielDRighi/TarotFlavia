/**
 * Tests for useDailyReadingPublic hook
 * Testing the new POST-based public daily reading with fingerprint
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { useDailyReadingPublic } from './useDailyReading';
import * as dailyReadingApi from '@/lib/api/daily-reading-api';
import type { DailyReading } from '@/types';

// Mock the API
vi.mock('@/lib/api/daily-reading-api');

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useDailyReadingPublic', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    // Create a new QueryClient for each test
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });

    // Clear all mocks
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should create daily reading with fingerprint', async () => {
    const mockReading: DailyReading = {
      id: 1,
      userId: 0,
      tarotistaId: 1,
      card: {
        id: 1,
        name: 'The Fool',
        number: 0,
        category: 'major',
        meaningUpright: 'New beginnings',
        meaningReversed: 'Recklessness',
        imageUrl: '/cards/fool.jpg',
        reversedImageUrl: '/cards/fool-reversed.jpg',
        description: 'The Fool represents new beginnings',
        keywords: 'beginning, innocence, spontaneity',
        deckId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isReversed: false,
      interpretation: null,
      cardMeaning: 'New beginnings',
      readingDate: '2026-01-02',
      wasRegenerated: false,
      createdAt: new Date(),
    };

    vi.mocked(dailyReadingApi.createDailyReadingPublic).mockResolvedValue(mockReading);

    const { result } = renderHook(() => useDailyReadingPublic(), { wrapper });

    // Call mutate with fingerprint
    result.current.mutate('test-fingerprint-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(dailyReadingApi.createDailyReadingPublic).toHaveBeenCalled();
    const calls = vi.mocked(dailyReadingApi.createDailyReadingPublic).mock.calls;
    expect(calls[0][0]).toBe('test-fingerprint-123');
    expect(result.current.data).toEqual(mockReading);
  });

  it('should handle 409 error (card already generated)', async () => {
    const error = new Error('Ya generaste tu carta del día');
    vi.mocked(dailyReadingApi.createDailyReadingPublic).mockRejectedValue(error);

    const { result } = renderHook(() => useDailyReadingPublic(), { wrapper });

    result.current.mutate('test-fingerprint-123');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should handle 403 error (anonymous limit reached)', async () => {
    const error = new Error('Ya viste tu carta del día. Regístrate para más lecturas.');
    vi.mocked(dailyReadingApi.createDailyReadingPublic).mockRejectedValue(error);

    const { result } = renderHook(() => useDailyReadingPublic(), { wrapper });

    result.current.mutate('test-fingerprint-123');

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toEqual(error);
  });

  it('should invalidate queries on success', async () => {
    const mockReading: DailyReading = {
      id: 1,
      userId: 0,
      tarotistaId: 1,
      card: {
        id: 1,
        name: 'The Fool',
        number: 0,
        category: 'major',
        meaningUpright: 'New beginnings',
        meaningReversed: 'Recklessness',
        imageUrl: '/cards/fool.jpg',
        reversedImageUrl: '/cards/fool-reversed.jpg',
        description: 'The Fool represents new beginnings',
        keywords: 'beginning, innocence, spontaneity',
        deckId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      isReversed: false,
      interpretation: null,
      cardMeaning: 'New beginnings',
      readingDate: '2026-01-02',
      wasRegenerated: false,
      createdAt: new Date(),
    };

    vi.mocked(dailyReadingApi.createDailyReadingPublic).mockResolvedValue(mockReading);

    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useDailyReadingPublic(), { wrapper });

    result.current.mutate('test-fingerprint-123');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ['daily-reading'],
    });
  });
});
