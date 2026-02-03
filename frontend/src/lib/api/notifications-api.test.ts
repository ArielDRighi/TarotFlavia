import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient } from './axios-config';
import { API_ENDPOINTS } from './endpoints';
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from './notifications-api';
import type { Notification, UnreadCountResponse } from '@/types';
import { NotificationType } from '@/types';

vi.mock('./axios-config', () => ({
  apiClient: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('Notifications API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockNotification: Notification = {
    id: 1,
    userId: 10,
    type: NotificationType.SACRED_EVENT,
    title: 'Luna Llena esta noche',
    message: 'Evento sagrado: Luna Llena propicio para rituales de manifestación',
    data: { eventId: 5 },
    actionUrl: '/rituales/calendario',
    read: false,
    readAt: null,
    createdAt: '2025-02-03T10:00:00Z',
  };

  describe('getNotifications', () => {
    it('should call correct endpoint without filters', async () => {
      const mockData = [mockNotification];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getNotifications();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.BASE);
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with unreadOnly filter', async () => {
      const mockData = [mockNotification];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getNotifications({ unreadOnly: true });

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}?unreadOnly=true`
      );
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with type filter', async () => {
      const mockData = [mockNotification];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getNotifications({ type: NotificationType.RITUAL_REMINDER });

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}?type=${NotificationType.RITUAL_REMINDER}`
      );
      expect(result).toEqual(mockData);
    });

    it('should call correct endpoint with multiple filters', async () => {
      const mockData = [mockNotification];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getNotifications({
        unreadOnly: true,
        type: NotificationType.SYSTEM,
        limit: 10,
        offset: 0,
      });

      expect(apiClient.get).toHaveBeenCalledWith(
        `${API_ENDPOINTS.NOTIFICATIONS.BASE}?unreadOnly=true&type=system&limit=10&offset=0`
      );
      expect(result).toEqual(mockData);
    });

    it('should return array of notifications', async () => {
      const mockData = [mockNotification];
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getNotifications();

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toEqual(mockNotification);
    });

    it('should handle empty response', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: [] });

      const result = await getNotifications();

      expect(result).toEqual([]);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getNotifications()).rejects.toThrow('Network error');
    });
  });

  describe('getUnreadCount', () => {
    it('should call correct endpoint', async () => {
      const mockData: UnreadCountResponse = { count: 5 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUnreadCount();

      expect(apiClient.get).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.COUNT);
      expect(result).toEqual(mockData);
    });

    it('should return count object', async () => {
      const mockData: UnreadCountResponse = { count: 3 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUnreadCount();

      expect(result.count).toBe(3);
    });

    it('should handle zero count', async () => {
      const mockData: UnreadCountResponse = { count: 0 };
      vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockData });

      const result = await getUnreadCount();

      expect(result.count).toBe(0);
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network error'));

      await expect(getUnreadCount()).rejects.toThrow('Network error');
    });
  });

  describe('markAsRead', () => {
    it('should call correct endpoint with notification ID', async () => {
      const updatedNotification: Notification = {
        ...mockNotification,
        read: true,
        readAt: '2025-02-03T11:00:00Z',
      };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedNotification });

      const result = await markAsRead(1);

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.MARK_READ(1));
      expect(result).toEqual(updatedNotification);
    });

    it('should return updated notification with read=true', async () => {
      const updatedNotification: Notification = {
        ...mockNotification,
        read: true,
        readAt: '2025-02-03T11:00:00Z',
      };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: updatedNotification });

      const result = await markAsRead(1);

      expect(result.read).toBe(true);
      expect(result.readAt).toBeTruthy();
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Not found'));

      await expect(markAsRead(999)).rejects.toThrow('Not found');
    });
  });

  describe('markAllAsRead', () => {
    it('should call correct endpoint', async () => {
      const mockResponse = { message: 'Todas las notificaciones marcadas como leídas' };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockResponse });

      const result = await markAllAsRead();

      expect(apiClient.patch).toHaveBeenCalledWith(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
      expect(result).toEqual(mockResponse);
    });

    it('should return success message', async () => {
      const mockResponse = { message: 'Todas las notificaciones marcadas como leídas' };
      vi.mocked(apiClient.patch).mockResolvedValueOnce({ data: mockResponse });

      const result = await markAllAsRead();

      expect(result.message).toBeTruthy();
    });

    it('should handle API errors', async () => {
      vi.mocked(apiClient.patch).mockRejectedValueOnce(new Error('Unauthorized'));

      await expect(markAllAsRead()).rejects.toThrow('Unauthorized');
    });
  });
});
