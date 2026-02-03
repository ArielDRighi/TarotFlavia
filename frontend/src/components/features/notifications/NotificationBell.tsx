'use client';

import { Bell } from 'lucide-react';
import { useUnreadCount } from '@/hooks/api/useNotifications';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';

export function NotificationBell() {
  const { data: unreadCount } = useUnreadCount();

  const count = unreadCount?.count ?? 0;
  const displayCount = count > 99 ? '99+' : count.toString();
  const hasUnread = count > 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          data-testid="notification-bell-button"
          aria-label={`Notificaciones${hasUnread ? ` (${count} sin leer)` : ''}`}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span
              data-testid="notification-badge"
              className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white"
            >
              {displayCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-auto p-0">
        <NotificationDropdown />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
