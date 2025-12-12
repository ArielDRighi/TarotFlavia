/**
 * TanStack Query hooks for sessions API - Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import {
  useAvailableSlots,
  useBookSession,
  useMySessions,
  useSessionDetail,
  useCancelSession,
} from './useSessions';
import * as sessionsApi from '@/lib/api/sessions-api';
import type { Session, SessionDetail, TimeSlot } from '@/types';

// Mock sessions API
vi.mock('@/lib/api/sessions-api');

// Create a query client for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

// Wrapper for testing hooks with QueryClient
const createWrapper = (queryClient: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestQueryClientWrapper';
  return Wrapper;
};

describe('useSessions Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // useAvailableSlots
  // ============================================================================

  describe('useAvailableSlots', () => {
    it('should fetch available slots for a tarotista on a specific date', async () => {
      const mockSlots: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
      ];

      vi.mocked(sessionsApi.getAvailableSlots).mockResolvedValue(mockSlots);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAvailableSlots(1, '2025-12-15'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSlots);
      expect(result.current.data).toHaveLength(3);
      expect(sessionsApi.getAvailableSlots).toHaveBeenCalledWith(1, '2025-12-15');
    });

    it('should handle errors when fetching slots fails', async () => {
      vi.mocked(sessionsApi.getAvailableSlots).mockRejectedValue(
        new Error('Error al obtener slots')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAvailableSlots(1, '2025-12-15'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should not fetch when tarotistaId is invalid', () => {
      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAvailableSlots(0, '2025-12-15'), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(sessionsApi.getAvailableSlots).not.toHaveBeenCalled();
    });
  });

  // ============================================================================
  // useBookSession
  // ============================================================================

  describe('useBookSession', () => {
    it('should book a session successfully', async () => {
      const mockSession: Session = {
        id: 1,
        tarotistaId: 1,
        userId: 100,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
        status: 'PENDING',
        meetLink: null,
      };

      vi.mocked(sessionsApi.bookSession).mockResolvedValue(mockSession);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useBookSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        tarotistaId: 1,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSession);
      expect(sessionsApi.bookSession).toHaveBeenCalled();
      // Verify the first argument (data) of the mutation
      const callArgs = vi.mocked(sessionsApi.bookSession).mock.calls[0];
      expect(callArgs[0]).toEqual({
        tarotistaId: 1,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
      });
    });

    it('should handle errors when booking fails', async () => {
      vi.mocked(sessionsApi.bookSession).mockRejectedValue(new Error('Slot no disponible'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useBookSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        tarotistaId: 1,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useMySessions
  // ============================================================================

  describe('useMySessions', () => {
    it('should fetch all sessions without filter', async () => {
      const mockSessions: Session[] = [
        {
          id: 1,
          tarotistaId: 1,
          userId: 100,
          date: '2025-12-15',
          time: '09:00',
          duration: 30,
          status: 'CONFIRMED',
          meetLink: 'https://meet.example.com/abc',
        },
        {
          id: 2,
          tarotistaId: 2,
          userId: 100,
          date: '2025-12-16',
          time: '10:00',
          duration: 60,
          status: 'PENDING',
          meetLink: null,
        },
      ];

      vi.mocked(sessionsApi.getMySessions).mockResolvedValue(mockSessions);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMySessions(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSessions);
      expect(result.current.data).toHaveLength(2);
      expect(sessionsApi.getMySessions).toHaveBeenCalledWith(undefined);
    });

    it('should fetch sessions filtered by status', async () => {
      const mockSessions: Session[] = [
        {
          id: 1,
          tarotistaId: 1,
          userId: 100,
          date: '2025-12-15',
          time: '09:00',
          duration: 30,
          status: 'CONFIRMED',
          meetLink: 'https://meet.example.com/abc',
        },
      ];

      vi.mocked(sessionsApi.getMySessions).mockResolvedValue(mockSessions);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMySessions('CONFIRMED'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSessions);
      expect(sessionsApi.getMySessions).toHaveBeenCalledWith('CONFIRMED');
    });

    it('should handle errors when fetching sessions fails', async () => {
      vi.mocked(sessionsApi.getMySessions).mockRejectedValue(new Error('Error al obtener'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMySessions(), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useSessionDetail
  // ============================================================================

  describe('useSessionDetail', () => {
    it('should fetch session detail by ID', async () => {
      const mockDetail: SessionDetail = {
        id: 1,
        tarotistaId: 1,
        userId: 100,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
        status: 'CONFIRMED',
        meetLink: 'https://meet.example.com/abc',
        tarotistaNombre: 'Luna Mística',
        tarotistaFoto: 'https://example.com/photo.jpg',
        createdAt: '2025-12-10T10:00:00Z',
        updatedAt: '2025-12-11T14:30:00Z',
      };

      vi.mocked(sessionsApi.getSessionDetail).mockResolvedValue(mockDetail);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useSessionDetail(1), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDetail);
      expect(result.current.data?.tarotistaNombre).toBe('Luna Mística');
      expect(sessionsApi.getSessionDetail).toHaveBeenCalledWith(1);
    });

    it('should not fetch when sessionId is invalid', () => {
      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useSessionDetail(0), {
        wrapper: createWrapper(queryClient),
      });

      expect(result.current.fetchStatus).toBe('idle');
      expect(sessionsApi.getSessionDetail).not.toHaveBeenCalled();
    });

    it('should handle errors when fetching detail fails', async () => {
      vi.mocked(sessionsApi.getSessionDetail).mockRejectedValue(new Error('Sesión no encontrada'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useSessionDetail(999), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });
  });

  // ============================================================================
  // useCancelSession
  // ============================================================================

  describe('useCancelSession', () => {
    it('should cancel a session successfully', async () => {
      vi.mocked(sessionsApi.cancelSession).mockResolvedValue(undefined);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCancelSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(sessionsApi.cancelSession).toHaveBeenCalled();
      // Verify the first argument (id) of the mutation
      const callArgs = vi.mocked(sessionsApi.cancelSession).mock.calls[0];
      expect(callArgs[0]).toBe(1);
    });

    it('should handle errors when cancellation fails', async () => {
      vi.mocked(sessionsApi.cancelSession).mockRejectedValue(new Error('Error al cancelar'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCancelSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should invalidate sessions queries on success', async () => {
      vi.mocked(sessionsApi.cancelSession).mockResolvedValue(undefined);

      const queryClient = createTestQueryClient();
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');

      const { result } = renderHook(() => useCancelSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
