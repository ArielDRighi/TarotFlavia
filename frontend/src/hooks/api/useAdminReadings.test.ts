import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAdminReadings, useSoftDeleteReading, useRestoreReading } from './useAdminReadings';

vi.mock('@/lib/api/admin-readings-api', () => ({
  fetchAdminReadings: vi.fn(),
  softDeleteReading: vi.fn(),
  restoreReading: vi.fn(),
}));

import {
  fetchAdminReadings,
  softDeleteReading,
  restoreReading,
} from '@/lib/api/admin-readings-api';

const mockFetchAdminReadings = fetchAdminReadings as ReturnType<typeof vi.fn>;
const mockSoftDeleteReading = softDeleteReading as ReturnType<typeof vi.fn>;
const mockRestoreReading = restoreReading as ReturnType<typeof vi.fn>;

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

describe('useAdminReadings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debe retornar los datos de lecturas al cargar', async () => {
    const mockResponse = {
      data: [
        {
          id: 1,
          question: '¿Qué me depara el futuro?',
          spreadId: 1,
          spreadName: 'Tirada de 3 cartas',
          cardsCount: 3,
          cardPreviews: [],
          createdAt: '2024-01-01T10:00:00Z',
        },
      ],
      meta: {
        page: 1,
        limit: 50,
        totalItems: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    mockFetchAdminReadings.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminReadings({}), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].id).toBe(1);
  });

  it('debe llamar fetchAdminReadings con includeDeleted cuando se especifica', async () => {
    const mockResponse = {
      data: [],
      meta: {
        page: 1,
        limit: 50,
        totalItems: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
    mockFetchAdminReadings.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAdminReadings({ includeDeleted: true }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockFetchAdminReadings).toHaveBeenCalledWith({ includeDeleted: true });
  });
});

describe('useSoftDeleteReading', () => {
  it('debe llamar softDeleteReading con el id correcto', async () => {
    mockSoftDeleteReading.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSoftDeleteReading(), { wrapper: createWrapper() });

    result.current.mutate(42);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockSoftDeleteReading).toHaveBeenCalledWith(42);
  });
});

describe('useRestoreReading', () => {
  it('debe llamar restoreReading con el id correcto', async () => {
    const mockReading = {
      id: 42,
      question: 'Pregunta',
      spreadId: 1,
      spreadName: 'Tirada',
      cardsCount: 3,
      cardPreviews: [],
      createdAt: '2024-01-01T10:00:00Z',
    };
    mockRestoreReading.mockResolvedValue(mockReading);

    const { result } = renderHook(() => useRestoreReading(), { wrapper: createWrapper() });

    result.current.mutate(42);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(mockRestoreReading).toHaveBeenCalledWith(42);
  });
});
