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
    it('should fetch available slots for a tarotista on a specific date', async () => {
      const tarotistaId = 1;
      const date = '2025-12-15';
      const mockSlots: TimeSlot[] = [
        { time: '09:00', available: true },
        { time: '10:00', available: false },
        { time: '11:00', available: true },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSlots });

      const result = await getAvailableSlots(tarotistaId, date);

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/available-slots', {
        params: { tarotistaId, date },
      });
      expect(result).toEqual(mockSlots);
      expect(result).toHaveLength(3);
      expect(result[0]).toHaveProperty('time');
      expect(result[0]).toHaveProperty('available');
    });

    it('should handle errors when fetching slots fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(getAvailableSlots(1, '2025-12-15')).rejects.toThrow(
        'Error al obtener slots disponibles'
      );
    });

    it('should return empty array when no slots available', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: [] });

      const result = await getAvailableSlots(1, '2025-12-15');

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
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
      };

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

      vi.mocked(apiClient.post).mockResolvedValue({ data: mockSession });

      const result = await bookSession(bookingData);

      expect(apiClient.post).toHaveBeenCalledWith('/scheduling/book', bookingData);
      expect(result).toEqual(mockSession);
      expect(result.id).toBe(1);
      expect(result.status).toBe('PENDING');
    });

    it('should handle errors when booking fails', async () => {
      const bookingData: BookSessionDto = {
        tarotistaId: 1,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
      };

      vi.mocked(apiClient.post).mockRejectedValue(new Error('Bad request'));

      await expect(bookSession(bookingData)).rejects.toThrow('Error al reservar sesión');
    });

    it('should handle slot already booked error (409 Conflict)', async () => {
      const bookingData: BookSessionDto = {
        tarotistaId: 1,
        date: '2025-12-15',
        time: '09:00',
        duration: 30,
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
          date: '2025-12-15',
          time: '09:00',
          duration: 30,
          status: 'CONFIRMED',
          meetLink: 'https://meet.example.com/abc',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockSessions });

      const result = await getMySessions('CONFIRMED');

      expect(apiClient.get).toHaveBeenCalledWith('/scheduling/my-sessions', {
        params: { status: 'CONFIRMED' },
      });
      expect(result).toEqual(mockSessions);
      expect(result).toHaveLength(1);
      expect(result[0].status).toBe('CONFIRMED');
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

      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDetail });

      const result = await getSessionDetail(sessionId);

      expect(apiClient.get).toHaveBeenCalledWith(`/scheduling/my-sessions/${sessionId}`);
      expect(result).toEqual(mockDetail);
      expect(result.tarotistaNombre).toBe('Luna Mística');
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

      vi.mocked(apiClient.post).mockResolvedValue({ data: undefined });

      await expect(cancelSession(sessionId)).resolves.toBeUndefined();

      expect(apiClient.post).toHaveBeenCalledWith(`/scheduling/my-sessions/${sessionId}/cancel`);
    });

    it('should handle errors when cancellation fails', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Bad request'));

      await expect(cancelSession(1)).rejects.toThrow('Error al cancelar sesión');
    });

    it('should handle 404 when session not found for cancellation', async () => {
      const notFoundError = {
        response: { status: 404 },
      };

      vi.mocked(apiClient.post).mockRejectedValue(notFoundError);

      await expect(cancelSession(999)).rejects.toThrow('Sesión no encontrada');
    });
  });
});
