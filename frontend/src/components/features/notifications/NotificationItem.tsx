'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { NOTIFICATION_TYPE_INFO, type Notification } from '@/types';

interface NotificationItemProps {
  notification: Notification;
  onClick?: (notification: Notification) => void;
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const typeInfo = NOTIFICATION_TYPE_INFO[notification.type];
  const isUnread = !notification.read;

  const handleClick = () => {
    if (onClick) {
      onClick(notification);
    }
  };

  const baseClassName = cn(
    'w-full p-4 text-left transition-colors',
    isUnread ? 'bg-purple-50 dark:bg-purple-950/20' : 'bg-white dark:bg-gray-800'
  );

  const notificationContent = (
    <div className="flex gap-3">
      {/* Icon */}
      <div className="flex-shrink-0">
        <span className="text-2xl" aria-hidden="true">
          {typeInfo.icon}
        </span>
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Title and Time */}
        <div className="mb-1 flex items-start justify-between gap-2">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
            {notification.title}
          </h4>
          <time
            dateTime={notification.createdAt}
            data-testid="notification-time"
            className="flex-shrink-0 text-xs text-gray-500 dark:text-gray-400"
          >
            {formatDistanceToNow(new Date(notification.createdAt), {
              addSuffix: true,
              locale: es,
            })}
          </time>
        </div>

        {/* Message */}
        <p
          data-testid="notification-message"
          className="line-clamp-2 text-sm text-gray-700 dark:text-gray-300"
        >
          {notification.message}
        </p>

        {/* Type Badge (optional, could be removed if redundant with icon) */}
        <div className="mt-2">
          <span
            className={cn(
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              typeInfo.color
            )}
          >
            {typeInfo.name}
          </span>
        </div>
      </div>

      {/* Unread Indicator */}
      {isUnread && (
        <div className="flex-shrink-0">
          <div className="h-2 w-2 rounded-full bg-purple-600" aria-label="No leída" />
        </div>
      )}
    </div>
  );

  return onClick ? (
    <button
      type="button"
      data-testid="notification-item"
      onClick={handleClick}
      className={cn(baseClassName, 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700')}
    >
      {notificationContent}
    </button>
  ) : (
    <div data-testid="notification-item" className={baseClassName}>
      {notificationContent}
    </div>
  );
}
