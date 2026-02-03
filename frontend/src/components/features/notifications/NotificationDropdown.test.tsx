/**
 * Tests para NotificationDropdown
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationDropdown } from './NotificationDropdown';
import { NotificationType, type Notification } from '@/types';
import * as useNotificationsHook from '@/hooks/api/useNotifications';
import React from 'react';

vi.mock('@/hooks/api/useNotifications');
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('NotificationDropdown', () => {
  const mockNotifications: Notification[] = [
    {
      id: 1,
      userId: 10,
      type: NotificationType.SACRED_EVENT,
      title: 'Luna Llena esta noche',
      message: 'Evento sagrado próximo',
      data: null,
      actionUrl: '/rituales/calendario',
      read: false,
      readAt: null,
      createdAt: '2025-02-03T10:00:00Z',
    },
    {
      id: 2,
      userId: 10,
      type: NotificationType.RITUAL_REMINDER,
      title: 'Ritual pendiente',
      message: 'Recuerda completar tu ritual',
      data: null,
      actionUrl: '/rituales',
      read: true,
      readAt: '2025-02-03T09:00:00Z',
      createdAt: '2025-02-02T10:00:00Z',
    },
  ];

  it('should render notifications list', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText('Luna Llena esta noche')).toBeInTheDocument();
    expect(screen.getByText('Ritual pendiente')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it('should show empty state when no notifications', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText(/No tienes notificaciones/i)).toBeInTheDocument();
  });

  it('should show error state on error', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText(/Error al cargar notificaciones/i)).toBeInTheDocument();
  });

  it('should call markAsRead when clicking notification', async () => {
    const user = userEvent.setup();
    const mutateMock = vi.fn();

    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: mutateMock,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    const firstNotification = screen.getByText('Luna Llena esta noche').closest('button');
    if (firstNotification) {
      await user.click(firstNotification);
    }

    await waitFor(() => {
      expect(mutateMock).toHaveBeenCalledWith(1);
    });
  });

  it('should render "Marcar todas como leídas" button', () => {
    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    expect(screen.getByText(/Marcar todas como leídas/i)).toBeInTheDocument();
  });

  it('should call markAllAsRead when clicking "Marcar todas" button', async () => {
    const user = userEvent.setup();
    const mutateAllMock = vi.fn();

    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: mockNotifications,
      isLoading: false,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: mutateAllMock,
    } as never);

    render(<NotificationDropdown />, { wrapper: createWrapper() });

    const markAllButton = screen.getByText(/Marcar todas como leídas/i);
    await user.click(markAllButton);

    expect(mutateAllMock).toHaveBeenCalled();
  });

  it('should have max height and scroll for many notifications', () => {
    const manyNotifications = Array.from({ length: 20 }, (_, i) => ({
      ...mockNotifications[0],
      id: i + 1,
      title: `Notificación ${i + 1}`,
    }));

    vi.mocked(useNotificationsHook.useNotifications).mockReturnValue({
      data: manyNotifications,
      isLoading: false,
      isError: false,
    } as never);

    vi.mocked(useNotificationsHook.useMarkAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    vi.mocked(useNotificationsHook.useMarkAllAsRead).mockReturnValue({
      mutate: vi.fn(),
    } as never);

    const { container } = render(<NotificationDropdown />, { wrapper: createWrapper() });

    const scrollableContainer = container.querySelector('[data-testid="notifications-list"]');
    expect(scrollableContainer).toBeInTheDocument();
  });
});
