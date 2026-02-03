/**
 * Tests para NotificationBell
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NotificationBell } from './NotificationBell';
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

describe('NotificationBell', () => {
  it('should render bell icon button', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: { count: 0 },
      isLoading: false,
      isError: false,
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-bell-button')).toBeInTheDocument();
  });

  it('should show unread count badge when count > 0', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: { count: 5 },
      isLoading: false,
      isError: false,
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
  });

  it('should not show badge when count is 0', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: { count: 0 },
      isLoading: false,
      isError: false,
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('should show "99+" for counts greater than 99', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: { count: 150 },
      isLoading: false,
      isError: false,
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-badge')).toBeInTheDocument();
    expect(screen.getByText('99+')).toBeInTheDocument();
  });

  it('should handle loading state gracefully', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-bell-button')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('should handle error state gracefully', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network error'),
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    expect(screen.getByTestId('notification-bell-button')).toBeInTheDocument();
    expect(screen.queryByTestId('notification-badge')).not.toBeInTheDocument();
  });

  it('should open dropdown when clicked', async () => {
    const user = userEvent.setup();

    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: { count: 3 },
      isLoading: false,
      isError: false,
    } as never);

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

    render(<NotificationBell />, { wrapper: createWrapper() });

    const bellButton = screen.getByTestId('notification-bell-button');
    await user.click(bellButton);

    // Dropdown should appear
    expect(screen.getByText(/Notificaciones/i)).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    vi.mocked(useNotificationsHook.useUnreadCount).mockReturnValue({
      data: { count: 2 },
      isLoading: false,
      isError: false,
    } as never);

    render(<NotificationBell />, { wrapper: createWrapper() });

    const button = screen.getByTestId('notification-bell-button');
    expect(button).toHaveAttribute('aria-label');
  });
});
