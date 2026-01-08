/**
 * Tests for useReadings hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useCreateReading } from './useReadings';
import * as readingsApi from '@/lib/api/readings-api';
import * as invalidateUserDataUtil from '@/lib/utils/invalidate-user-data';
import type { CreateReadingDto } from '@/types';

// Mock dependencies
vi.mock('@/lib/api/readings-api');
vi.mock('@/lib/utils/invalidate-user-data');
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('useCreateReading', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should call invalidateUserData on successful reading creation', async () => {
    const mockReading = {
      id: 1,
      userId: 1,
      question: 'Test question',
      spreadId: 1,
      cards: [],
      interpretation: 'Test interpretation',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      isShared: false,
      shareToken: null,
    };

    vi.mocked(readingsApi.createReading).mockResolvedValue(mockReading);
    vi.mocked(invalidateUserDataUtil.invalidateUserData).mockResolvedValue(undefined);

    const { result } = renderHook(() => useCreateReading(), { wrapper });

    const createReadingDto: CreateReadingDto = {
      spreadId: 1,
      deckId: 1,
      cardIds: [1, 2, 3],
      cardPositions: [
        { cardId: 1, position: 'past', isReversed: false },
        { cardId: 2, position: 'present', isReversed: false },
        { cardId: 3, position: 'future', isReversed: false },
      ],
    };

    result.current.mutate(createReadingDto);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateUserDataUtil.invalidateUserData).toHaveBeenCalledWith(queryClient);
    expect(invalidateUserDataUtil.invalidateUserData).toHaveBeenCalledTimes(1);
  });

  it('should invalidate readings queries on success', async () => {
    const mockReading = {
      id: 1,
      userId: 1,
      question: 'Test question',
      spreadId: 1,
      cards: [],
      interpretation: 'Test interpretation',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
      isShared: false,
      shareToken: null,
    };

    vi.mocked(readingsApi.createReading).mockResolvedValue(mockReading);
    vi.mocked(invalidateUserDataUtil.invalidateUserData).mockResolvedValue(undefined);

    const invalidateQueriesSpy = vi.spyOn(queryClient, 'invalidateQueries');

    const { result } = renderHook(() => useCreateReading(), { wrapper });

    const createReadingDto: CreateReadingDto = {
      spreadId: 1,
      deckId: 1,
      cardIds: [1, 2, 3],
      cardPositions: [
        { cardId: 1, position: 'past', isReversed: false },
        { cardId: 2, position: 'present', isReversed: false },
        { cardId: 3, position: 'future', isReversed: false },
      ],
    };

    result.current.mutate(createReadingDto);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: ['readings'],
    });
  });
});
