/**
 * Tests for useNotifications hooks
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useNotifications,
  useUnreadCount,
  useMarkAsRead,
  useMarkAllAsRead,
} from './useNotifications';
import * as notificationsApi from '@/lib/api/notifications-api';
import { NotificationType, type Notification, type UnreadCountResponse } from '@/types';
import React from 'react';

// Mock the API
vi.mock('@/lib/api/notifications-api');

// Helper to create QueryClient for each test
const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

// Helper to create wrapper with QueryClient
const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('useNotifications', () => {
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

  describe('useNotifications', () => {
    it('should fetch notifications without filters', async () => {
      const mockData = [mockNotification];
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue(mockData);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(notificationsApi.getNotifications).toHaveBeenCalledWith(undefined);
    });

    it('should fetch notifications with unreadOnly filter', async () => {
      const mockData = [mockNotification];
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue(mockData);

      const filters = { unreadOnly: true };

      const { result } = renderHook(() => useNotifications(filters), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(notificationsApi.getNotifications).toHaveBeenCalledWith(filters);
    });

    it('should handle fetch errors', async () => {
      vi.mocked(notificationsApi.getNotifications).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });

    it('should return empty array when no notifications', async () => {
      vi.mocked(notificationsApi.getNotifications).mockResolvedValue([]);

      const { result } = renderHook(() => useNotifications(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useUnreadCount', () => {
    it('should fetch unread count', async () => {
      const mockData: UnreadCountResponse = { count: 5 };
      vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue(mockData);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data).toEqual(mockData);
      expect(notificationsApi.getUnreadCount).toHaveBeenCalled();
    });

    it('should handle zero count', async () => {
      const mockData: UnreadCountResponse = { count: 0 };
      vi.mocked(notificationsApi.getUnreadCount).mockResolvedValue(mockData);

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(result.current.data?.count).toBe(0);
    });

    it('should handle fetch errors', async () => {
      vi.mocked(notificationsApi.getUnreadCount).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useMarkAsRead', () => {
    it('should mark notification as read', async () => {
      const updatedNotification: Notification = {
        ...mockNotification,
        read: true,
        readAt: '2025-02-03T11:00:00Z',
      };
      vi.mocked(notificationsApi.markAsRead).mockResolvedValue(updatedNotification);

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);

      result.current.mutate(1);

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificationsApi.markAsRead).toHaveBeenCalledWith(1);
      expect(result.current.data).toEqual(updatedNotification);
    });

    it('should handle mark as read errors', async () => {
      vi.mocked(notificationsApi.markAsRead).mockRejectedValue(new Error('Not found'));

      const { result } = renderHook(() => useMarkAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate(999);

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });

  describe('useMarkAllAsRead', () => {
    it('should mark all notifications as read', async () => {
      const mockResponse = { message: 'Todas las notificaciones marcadas como leídas' };
      vi.mocked(notificationsApi.markAllAsRead).mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isPending).toBe(false);

      result.current.mutate();

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(notificationsApi.markAllAsRead).toHaveBeenCalled();
      expect(result.current.data).toEqual(mockResponse);
    });

    it('should handle mark all as read errors', async () => {
      vi.mocked(notificationsApi.markAllAsRead).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useMarkAllAsRead(), {
        wrapper: createWrapper(),
      });

      result.current.mutate();

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBeTruthy();
    });
  });
});
