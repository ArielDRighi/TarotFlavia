/**
 * Tests for useAvailableSlots hook
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAvailableSlots } from './useAvailableSlots';
import * as schedulingApi from '@/lib/api/scheduling-api';
import type { TimeSlot } from '@/types';

// Mock de la API
vi.mock('@/lib/api/scheduling-api', () => ({
  getAvailableSlots: vi.fn(),
}));

describe('useAvailableSlots', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false, // Deshabilitar reintentos en tests
        },
      },
    });
    vi.clearAllMocks();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );

  it('should fetch available slots successfully', async () => {
    const mockSlots: TimeSlot[] = [
      {
        date: '2025-12-15',
        time: '09:00',
        durationMinutes: 60,
        available: true,
      },
      {
        date: '2025-12-15',
        time: '10:00',
        durationMinutes: 60,
        available: false,
      },
    ];

    vi.mocked(schedulingApi.getAvailableSlots).mockResolvedValue(mockSlots);

    const { result } = renderHook(() => useAvailableSlots(1, '2025-12-15'), { wrapper });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toEqual(mockSlots);
    expect(schedulingApi.getAvailableSlots).toHaveBeenCalledWith({
      tarotistaId: 1,
      date: '2025-12-15',
    });
  });

  it('should not fetch when tarotistaId is 0 or negative', () => {
    const { result } = renderHook(() => useAvailableSlots(0, '2025-12-15'), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(schedulingApi.getAvailableSlots).not.toHaveBeenCalled();
  });

  it('should not fetch when date is empty', () => {
    const { result } = renderHook(() => useAvailableSlots(1, ''), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(schedulingApi.getAvailableSlots).not.toHaveBeenCalled();
  });

  it('should not fetch when date format is invalid', () => {
    const { result } = renderHook(() => useAvailableSlots(1, 'invalid-date'), { wrapper });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.fetchStatus).toBe('idle');
    expect(schedulingApi.getAvailableSlots).not.toHaveBeenCalled();
  });

  it('should handle API errors gracefully', async () => {
    const mockError = new Error('Failed to fetch slots');
    vi.mocked(schedulingApi.getAvailableSlots).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAvailableSlots(1, '2025-12-15'), { wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));

    expect(result.current.error).toBeDefined();
  });

  it('should call API with correct parameters', async () => {
    vi.mocked(schedulingApi.getAvailableSlots).mockResolvedValue([]);

    renderHook(() => useAvailableSlots(1, '2025-12-15'), { wrapper });

    // Verificar que la query se ejecutó con los parámetros correctos
    await waitFor(() => {
      expect(schedulingApi.getAvailableSlots).toHaveBeenCalledWith({
        tarotistaId: 1,
        date: '2025-12-15',
      });
    });
  });

  it('should refetch when tarotistaId changes', async () => {
    vi.mocked(schedulingApi.getAvailableSlots).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ tarotistaId, date }) => useAvailableSlots(tarotistaId, date),
      {
        wrapper,
        initialProps: { tarotistaId: 1, date: '2025-12-15' },
      }
    );

    await waitFor(() => expect(schedulingApi.getAvailableSlots).toHaveBeenCalledTimes(1));

    // Cambiar tarotistaId
    rerender({ tarotistaId: 2, date: '2025-12-15' });

    await waitFor(() => expect(schedulingApi.getAvailableSlots).toHaveBeenCalledTimes(2));

    expect(schedulingApi.getAvailableSlots).toHaveBeenLastCalledWith({
      tarotistaId: 2,
      date: '2025-12-15',
    });
  });

  it('should refetch when date changes', async () => {
    vi.mocked(schedulingApi.getAvailableSlots).mockResolvedValue([]);

    const { rerender } = renderHook(
      ({ tarotistaId, date }) => useAvailableSlots(tarotistaId, date),
      {
        wrapper,
        initialProps: { tarotistaId: 1, date: '2025-12-15' },
      }
    );

    await waitFor(() => expect(schedulingApi.getAvailableSlots).toHaveBeenCalledTimes(1));

    // Cambiar date
    rerender({ tarotistaId: 1, date: '2025-12-16' });

    await waitFor(() => expect(schedulingApi.getAvailableSlots).toHaveBeenCalledTimes(2));

    expect(schedulingApi.getAvailableSlots).toHaveBeenLastCalledWith({
      tarotistaId: 1,
      date: '2025-12-16',
    });
  });
});
