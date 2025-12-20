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
    it('should fetch available slots for a tarotista in a date range', async () => {
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 30, available: true },
        { date: '2025-12-15', time: '10:00', durationMinutes: 30, available: false },
        { date: '2025-12-15', time: '11:00', durationMinutes: 30, available: true },
      ];

      vi.mocked(sessionsApi.getAvailableSlots).mockResolvedValue(mockSlots);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAvailableSlots(1, '2025-12-15', '2025-12-22', 30), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSlots);
      expect(result.current.data).toHaveLength(3);
      expect(sessionsApi.getAvailableSlots).toHaveBeenCalledWith(1, '2025-12-15', '2025-12-22', 30);
    });

    it('should handle errors when fetching slots fails', async () => {
      vi.mocked(sessionsApi.getAvailableSlots).mockRejectedValue(
        new Error('Error al obtener slots')
      );

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAvailableSlots(1, '2025-12-15', '2025-12-22', 30), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeDefined();
    });

    it('should not fetch when tarotistaId is invalid', () => {
      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useAvailableSlots(0, '2025-12-15', '2025-12-22', 30), {
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
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
        status: 'pending',
        priceUsd: 50,
        paymentStatus: 'PENDING',
        googleMeetLink: 'https://meet.google.com/abc-defg-hij',
        userEmail: 'user@example.com',
        createdAt: '2025-12-10T10:00:00Z',
        updatedAt: '2025-12-10T10:00:00Z',
      };

      vi.mocked(sessionsApi.bookSession).mockResolvedValue(mockSession);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useBookSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({
        tarotistaId: 1,
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSession);
      expect(sessionsApi.bookSession).toHaveBeenCalled();
      // Verify the first argument (data) of the mutation
      const callArgs = vi.mocked(sessionsApi.bookSession).mock.calls[0];
      expect(callArgs[0]).toEqual({
        tarotistaId: 1,
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
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
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
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
          sessionDate: '2025-12-15',
          sessionTime: '09:00',
          durationMinutes: 30,
          sessionType: 'TAROT_READING',
          status: 'confirmed',
          priceUsd: 50,
          paymentStatus: 'PAID',
          googleMeetLink: 'https://meet.google.com/abc-defg-hij',
          userEmail: 'user@example.com',
          createdAt: '2025-12-10T10:00:00Z',
          updatedAt: '2025-12-10T10:00:00Z',
        },
        {
          id: 2,
          tarotistaId: 2,
          userId: 100,
          sessionDate: '2025-12-16',
          sessionTime: '10:00',
          durationMinutes: 60,
          sessionType: 'CONSULTATION',
          status: 'pending',
          priceUsd: 75,
          paymentStatus: 'PENDING',
          googleMeetLink: 'https://meet.google.com/xyz-qwer-tyu',
          userEmail: 'user@example.com',
          createdAt: '2025-12-10T11:00:00Z',
          updatedAt: '2025-12-10T11:00:00Z',
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
          sessionDate: '2025-12-15',
          sessionTime: '09:00',
          durationMinutes: 30,
          sessionType: 'TAROT_READING',
          status: 'confirmed',
          priceUsd: 50,
          paymentStatus: 'PAID',
          googleMeetLink: 'https://meet.google.com/abc-defg-hij',
          userEmail: 'user@example.com',
          createdAt: '2025-12-10T10:00:00Z',
          updatedAt: '2025-12-10T10:00:00Z',
        },
      ];

      vi.mocked(sessionsApi.getMySessions).mockResolvedValue(mockSessions);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useMySessions('confirmed'), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockSessions);
      expect(sessionsApi.getMySessions).toHaveBeenCalledWith('confirmed');
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
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
        status: 'confirmed',
        priceUsd: 50,
        paymentStatus: 'PAID',
        googleMeetLink: 'https://meet.google.com/abc-defg-hij',
        userEmail: 'user@example.com',
        createdAt: '2025-12-10T10:00:00Z',
        updatedAt: '2025-12-11T14:30:00Z',
        tarotista: {
          id: 1,
          nombre: 'Luna Mística',
          foto: 'https://example.com/photo.jpg',
        },
      };

      vi.mocked(sessionsApi.getSessionDetail).mockResolvedValue(mockDetail);

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useSessionDetail(1), {
        wrapper: createWrapper(queryClient),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockDetail);
      expect(result.current.data?.tarotista?.nombre).toBe('Luna Mística');
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

      result.current.mutate({ id: 1, reason: 'No podré asistir' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(sessionsApi.cancelSession).toHaveBeenCalled();
      // Verify the arguments of the mutation
      const callArgs = vi.mocked(sessionsApi.cancelSession).mock.calls[0];
      expect(callArgs[0]).toBe(1);
      expect(callArgs[1]).toEqual({ reason: 'No podré asistir' });
    });

    it('should handle errors when cancellation fails', async () => {
      vi.mocked(sessionsApi.cancelSession).mockRejectedValue(new Error('Error al cancelar'));

      const queryClient = createTestQueryClient();
      const { result } = renderHook(() => useCancelSession(), {
        wrapper: createWrapper(queryClient),
      });

      result.current.mutate({ id: 1, reason: 'Cancelación' });

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

      result.current.mutate({ id: 1, reason: 'Cancelación' });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(invalidateSpy).toHaveBeenCalled();
    });
  });
});
