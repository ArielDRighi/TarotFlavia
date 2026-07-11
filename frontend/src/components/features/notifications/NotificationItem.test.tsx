/**
 * Tests para NotificationItem
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { NotificationItem } from './NotificationItem';
import { NotificationType, type Notification } from '@/types';

describe('NotificationItem', () => {
  const baseNotification: Notification = {
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

  it('should render notification title and message', () => {
    render(<NotificationItem notification={baseNotification} />);

    expect(screen.getByText('Luna Llena esta noche')).toBeInTheDocument();
    expect(
      screen.getByText(/Evento sagrado: Luna Llena propicio para rituales de manifestación/)
    ).toBeInTheDocument();
  });

  it('should render notification type icon', () => {
    render(<NotificationItem notification={baseNotification} />);

    // SACRED_EVENT icon is ✨
    expect(screen.getByText('✨')).toBeInTheDocument();
  });

  it('should render relative time', () => {
    render(<NotificationItem notification={baseNotification} />);

    // Should render some time text (exact text depends on date-fns)
    expect(screen.getByTestId('notification-time')).toBeInTheDocument();
  });

  it('should show unread indicator when notification is unread', () => {
    render(<NotificationItem notification={baseNotification} />);

    const item = screen.getByTestId('notification-item');
    // Unread notifications should have visual indicator (e.g., background color or dot)
    expect(item).toHaveClass('bg-purple-50');
  });

  it('should not show unread indicator when notification is read', () => {
    const readNotification: Notification = {
      ...baseNotification,
      read: true,
      readAt: '2025-02-03T11:00:00Z',
    };

    render(<NotificationItem notification={readNotification} />);

    const item = screen.getByTestId('notification-item');
    expect(item).not.toHaveClass('bg-purple-50');
  });

  it('should call onClick when notification is clicked', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(<NotificationItem notification={baseNotification} onClick={handleClick} />);

    const item = screen.getByTestId('notification-item');
    await user.click(item);

    expect(handleClick).toHaveBeenCalledWith(baseNotification);
  });

  it('should render as button when onClick is provided', () => {
    const handleClick = vi.fn();

    render(<NotificationItem notification={baseNotification} onClick={handleClick} />);

    const item = screen.getByTestId('notification-item');
    expect(item.tagName).toBe('BUTTON');
  });

  it('should render as div when onClick is not provided', () => {
    render(<NotificationItem notification={baseNotification} />);

    const item = screen.getByTestId('notification-item');
    expect(item.tagName).toBe('DIV');
  });

  it('should render RITUAL_REMINDER type with correct icon', () => {
    const notification: Notification = {
      ...baseNotification,
      type: NotificationType.RITUAL_REMINDER,
      title: 'Recordatorio de ritual',
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getByText('🕯️')).toBeInTheDocument();
  });

  it('should render READING_SHARED type with correct icon', () => {
    const notification: Notification = {
      ...baseNotification,
      type: NotificationType.READING_SHARED,
      title: 'Nueva lectura compartida',
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getByText('🔮')).toBeInTheDocument();
  });

  it('should render SYSTEM type with correct icon', () => {
    const notification: Notification = {
      ...baseNotification,
      type: NotificationType.SYSTEM,
      title: 'Actualización del sistema',
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getByText('⚙️')).toBeInTheDocument();
  });

  it('should render PROMOTION type with correct icon', () => {
    const notification: Notification = {
      ...baseNotification,
      type: NotificationType.PROMOTION,
      title: 'Nueva promoción disponible',
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getByText('🎁')).toBeInTheDocument();
  });

  it('should handle very long messages gracefully', () => {
    const notification: Notification = {
      ...baseNotification,
      message: 'A'.repeat(500), // Very long message
    };

    render(<NotificationItem notification={notification} />);

    const message = screen.getByTestId('notification-message');
    expect(message).toBeInTheDocument();
  });

  it('should render without actionUrl', () => {
    const notification: Notification = {
      ...baseNotification,
      actionUrl: null,
    };

    render(<NotificationItem notification={notification} />);

    expect(screen.getByText('Luna Llena esta noche')).toBeInTheDocument();
  });

  // T-PROD-011: el enum del frontend estaba desincronizado del backend. El backend
  // emite sacred_event_reminder y pattern_insight, que NO existían acá: el acceso
  // directo a NOTIFICATION_TYPE_INFO[type] tiraba TypeError y rompía el header.
  describe('Tipos del backend y tipos desconocidos (T-PROD-011)', () => {
    it('should render SACRED_EVENT_REMINDER (emitido por el cron del backend)', () => {
      const notification: Notification = {
        ...baseNotification,
        type: NotificationType.SACRED_EVENT_REMINDER,
      };

      render(<NotificationItem notification={notification} />);

      expect(screen.getByText('Luna Llena esta noche')).toBeInTheDocument();
      expect(screen.getByTestId('notification-item')).toBeInTheDocument();
    });

    it('should render PATTERN_INSIGHT (emitido por el backend)', () => {
      const notification: Notification = {
        ...baseNotification,
        type: NotificationType.PATTERN_INSIGHT,
      };

      render(<NotificationItem notification={notification} />);

      expect(screen.getByText('Luna Llena esta noche')).toBeInTheDocument();
      expect(screen.getByTestId('notification-item')).toBeInTheDocument();
    });

    it('should not crash on an unknown type the backend might add later', () => {
      // Simula un tipo nuevo del backend que este frontend todavía no conoce.
      const notification: Notification = {
        ...baseNotification,
        type: 'brand_new_backend_type' as NotificationType,
      };

      expect(() => render(<NotificationItem notification={notification} />)).not.toThrow();

      expect(screen.getByText('Luna Llena esta noche')).toBeInTheDocument();
      expect(screen.getByTestId('notification-item')).toBeInTheDocument();
    });
  });
});
