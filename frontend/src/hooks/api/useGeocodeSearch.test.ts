/**
 * Geocode Search Hook Tests
 *
 * Tests para el hook de búsqueda de ubicaciones con debounce
 */

import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { createElement, type ReactNode } from 'react';
import * as axiosConfig from '@/lib/api/axios-config';
import { useGeocodeSearch } from './useGeocodeSearch';
import type { GeocodeSearchResponse } from '@/types/birth-chart-geocode.types';

// Mock de axios-config
vi.mock('@/lib/api/axios-config', () => ({
  apiClient: {
    get: vi.fn(),
  },
}));

// Mock de useDebounce
vi.mock('@/hooks/utils/useDebounce', () => ({
  useDebounce: (value: string) => value, // Retorna el valor inmediatamente para tests
}));

const mockGet = axiosConfig.apiClient.get as Mock;

// Helper para crear wrapper con QueryClient
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) =>
    createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryClientWrapper';
  return Wrapper;
}

describe('useGeocodeSearch', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not fetch when query is empty', () => {
    const { result } = renderHook(() => useGeocodeSearch(''), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should not fetch when query is less than 3 characters', () => {
    const { result } = renderHook(() => useGeocodeSearch('AB'), {
      wrapper: createWrapper(),
    });

    expect(result.current.fetchStatus).toBe('idle');
    expect(mockGet).not.toHaveBeenCalled();
  });

  it('should fetch results when query is 3+ characters', async () => {
    const mockResponse: GeocodeSearchResponse = {
      results: [
        {
          placeId: '123',
          displayName: 'Buenos Aires, Argentina',
          latitude: -34.6037,
          longitude: -58.3816,
          country: 'Argentina',
          city: 'Buenos Aires',
          timezone: 'America/Argentina/Buenos_Aires',
        },
      ],
      count: 1,
    };

    mockGet.mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(() => useGeocodeSearch('Buenos Aires'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data).toEqual(mockResponse);
    expect(mockGet).toHaveBeenCalledWith('/birth-chart/geocode', {
      params: { query: 'Buenos Aires' },
    });
  });

  it('should handle empty results', async () => {
    const mockResponse: GeocodeSearchResponse = {
      results: [],
      count: 0,
    };

    mockGet.mockResolvedValue({ data: mockResponse });

    const { result } = renderHook(() => useGeocodeSearch('NonExistentPlace12345'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.results).toHaveLength(0);
  });

  it('should handle API errors', async () => {
    mockGet.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useGeocodeSearch('Buenos Aires'), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should refetch when query changes', async () => {
    const mockResponse1: GeocodeSearchResponse = {
      results: [
        {
          placeId: '123',
          displayName: 'Buenos Aires, Argentina',
          latitude: -34.6037,
          longitude: -58.3816,
          country: 'Argentina',
          city: 'Buenos Aires',
          timezone: 'America/Argentina/Buenos_Aires',
        },
      ],
      count: 1,
    };

    const mockResponse2: GeocodeSearchResponse = {
      results: [
        {
          placeId: '456',
          displayName: 'Madrid, España',
          latitude: 40.4168,
          longitude: -3.7038,
          country: 'España',
          city: 'Madrid',
          timezone: 'Europe/Madrid',
        },
      ],
      count: 1,
    };

    mockGet
      .mockResolvedValueOnce({ data: mockResponse1 })
      .mockResolvedValueOnce({ data: mockResponse2 });

    const { result, rerender } = renderHook(({ query }) => useGeocodeSearch(query), {
      initialProps: { query: 'Buenos Aires' },
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(result.current.data?.results[0].city).toBe('Buenos Aires');

    // Cambiar query
    rerender({ query: 'Madrid' });

    await waitFor(() => {
      expect(result.current.data?.results[0].city).toBe('Madrid');
    });

    expect(mockGet).toHaveBeenCalledTimes(2);
  });
});
