'use client';

import { useRouter } from 'next/navigation';
import { useNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/api/useNotifications';
import { NotificationItem } from './NotificationItem';
import { Button } from '@/components/ui/button';
import type { Notification } from '@/types';

export function NotificationDropdown() {
  const router = useRouter();
  const { data: notifications, isLoading, isError } = useNotifications();
  const markAsReadMutation = useMarkAsRead();
  const markAllAsReadMutation = useMarkAllAsRead();

  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      markAsReadMutation.mutate(notification.id);
    }

    // Navegar a actionUrl si existe
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  if (isLoading) {
    return <div className="p-4 text-center text-sm text-gray-500">Cargando notificaciones...</div>;
  }

  if (isError) {
    return (
      <div className="p-4 text-center text-sm text-red-600">Error al cargar notificaciones</div>
    );
  }

  if (!notifications || notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-gray-500">No tienes notificaciones</p>
      </div>
    );
  }

  const hasUnread = notifications.some((n) => !n.read);

  return (
    <div className="w-80 max-w-sm">
      {/* Header with "Mark all as read" button */}
      <div className="flex items-center justify-between border-b border-gray-200 p-3 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Notificaciones</h3>
        {hasUnread && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={markAllAsReadMutation.isPending}
            className="text-xs"
          >
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Notifications List */}
      <div
        data-testid="notifications-list"
        className="max-h-96 divide-y divide-gray-200 overflow-y-auto dark:divide-gray-700"
      >
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onClick={handleNotificationClick}
          />
        ))}
      </div>
    </div>
  );
}
