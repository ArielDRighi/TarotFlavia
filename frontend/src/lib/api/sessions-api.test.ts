/**
 * Sessions API Tests
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import {
  getAvailableSlots,
  bookSession,
  getMySessions,
  getSessionDetail,
  cancelSession,
} from './sessions-api';
import type { TimeSlot, Session, SessionDetail, BookSessionDto } from '@/types';

// Mock axios-config
vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

describe('Sessions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================================================
  // getAvailableSlots
  // ============================================================================

  describe('getAvailableSlots', () => {
    it('should fetch available slots for a tarotista in a date range', async () => {
      const tarotistaId = 1;
      const startDate = '2025-12-15';
      const endDate = '2025-12-22';
      const durationMinutes = 30;
      const mockSlots: TimeSlot[] = [
        { date: '2025-12-15', time: '09:00', durationMinutes: 30, available: true },
        { date: '2025-12-15', time: '10:00', durationMinutes: 30, available: false },
        { date: '2025-12-15', time: '11:00', durationMinutes: 30, available: true },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSlots });

      const result = await getAvailableSlots(tarotistaId, startDate, endDate, durationMinutes);

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/available-slots', {
        params: { tarotistaId, startDate, endDate, durationMinutes },
      });
      expect(result).toEqual(mockSlots);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('date');
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('durationMinutes');
      expect(result[0]).toHaveProperty('available');
    });

    it('should handle errors when fetching slots fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getAvailableSlots(1, '2025-12-15', '2025-12-22', 30)).rejects.toThrow(
        'Error al obtener slots disponibles'
      );
    });

    it('should return empty array when no slots available', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getAvailableSlots(1, '2025-12-15', '2025-12-22', 30);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });
  });

  // ============================================================================
  // bookSession
  // ============================================================================

  describe('bookSession', () => {
    it('should create a new session booking', async () => {
      const bookingData: BookSessionDto = {
        tarotistaId: 1,
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
      };

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

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockSession });

      const result = await bookSession(bookingData);

      expect(apiClient.post).toHaveBeenCalledWith('/scheduling/book', bookingData);
      expect(result).toEqual(mockSession);
      expect(result.id).toBe(1);
      expect(result.status).toBe('pending');
    });

    it('should handle errors when booking fails', async () => {
      const bookingData: BookSessionDto = {
        tarotistaId: 1,
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Bad request'));

      await expect(bookSession(bookingData)).rejects.toThrow('Error al reservar sesión');
    });

    it('should handle slot already booked error (409 Conflict)', async () => {
      const bookingData: BookSessionDto = {
        tarotistaId: 1,
        sessionDate: '2025-12-15',
        sessionTime: '09:00',
        durationMinutes: 30,
        sessionType: 'TAROT_READING',
      };

      const conflictError = {
        response: { status: 409 },
      };

      vi.mocked(apiClient.post).mockRejectedValue(conflictError);

      await expect(bookSession(bookingData)).rejects.toThrow('Slot no disponible');
    });
  });

  // ============================================================================
  // getMySessions
  // ============================================================================

  describe('getMySessions', () => {
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSessions });

      const result = await getMySessions();

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/my-sessions', {
        params: undefined,
      });
      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(2);
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSessions });

      const result = await getMySessions('confirmed');

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/my-sessions', {
        params: { status: 'confirmed' },
      });
      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('confirmed');
    });

    it('should handle errors when fetching sessions fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Server error'));

      await expect(getMySessions()).rejects.toThrow('Error al obtener sesiones');
    });
  });

  // ============================================================================
  // getSessionDetail
  // ============================================================================

  describe('getSessionDetail', () => {
    it('should fetch detailed session info by ID', async () => {
      const sessionId = 1;
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDetail });

      const result = await getSessionDetail(sessionId);

      expect(apiClient.get).toHaveBeenCalledWith(`/scheduling/my-sessions/${sessionId}`);
      expect(result).toEqual(mockDetail);
      expect(result.tarotista?.nombre).toBe('Luna Mística');
      expect(result.id).toBe(sessionId);
    });

    it('should handle 404 when session not found', async () => {
      const notFoundError = {
        response: { status: 404 },
      };

      vi.mocked(apiClient.get).mockRejectedValue(notFoundError);

      await expect(getSessionDetail(999)).rejects.toThrow('Sesión no encontrada');
    });

    it('should handle errors when fetching detail fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Server error'));

      await expect(getSessionDetail(1)).rejects.toThrow('Error al obtener detalle de sesión');
    });
  });

  // ============================================================================
  // cancelSession
  // ============================================================================

  describe('cancelSession', () => {
    it('should cancel a session successfully', async () => {
      const sessionId = 1;
      const cancelData = { reason: 'No podré asistir por un compromiso inesperado' };

      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await expect(cancelSession(sessionId, cancelData)).resolves.toBeUndefined();

      expect(apiClient.post).toHaveBeenCalledWith(
        `/scheduling/my-sessions/${sessionId}/cancel`,
        cancelData
      );
    });

    it('should handle errors when cancellation fails', async () => {
      const cancelData = { reason: 'Cancelación' };
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Bad request'));

      await expect(cancelSession(1, cancelData)).rejects.toThrow('Error al cancelar sesión');
    });

    it('should handle 404 when session not found for cancellation', async () => {
      const cancelData = { reason: 'Cancelación' };
      const notFoundError = {
        response: { status: 404 },
      };

      vi.mocked(apiClient.post).mockRejectedValue(notFoundError);

      await expect(cancelSession(999, cancelData)).rejects.toThrow('Sesión no encontrada');
    });
  });
});
