import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import PerfilPage from './page';
import React from 'react';

// Mock useRequireAuth
vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: vi.fn(() => ({ isLoading: false })),
}));

// Mock useProfile
vi.mock('@/hooks/api/useUser', () => ({
  useProfile: vi.fn(() => ({
    data: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      roles: ['consumer'],
      plan: 'free',
      dailyReadingsCount: 2,
      dailyReadingsLimit: 5,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      profilePicture: undefined,
      lastLogin: null,
    },
    isLoading: false,
  })),
  useUpdateProfile: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useUpdatePassword: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
  useDeleteAccount: vi.fn(() => ({
    mutate: vi.fn(),
    isPending: false,
  })),
}));

// Mock useAuth
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
    },
  })),
}));

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

const createWrapper = () => {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
};

describe('PerfilPage', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Reset mocks to default state
    const { useRequireAuth } = await import('@/hooks/useRequireAuth');
    const { useProfile } = await import('@/hooks/api/useUser');

    (useRequireAuth as ReturnType<typeof vi.fn>).mockReturnValue({ isLoading: false });
    (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
      data: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        roles: ['consumer'],
        plan: 'free',
        dailyReadingsCount: 2,
        dailyReadingsLimit: 5,
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
        profilePicture: undefined,
        lastLogin: null,
      },
      isLoading: false,
    });
  });

  describe('Rendering', () => {
    it('should render profile header with user name', () => {
      render(<PerfilPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should render tabs for account, subscription, and settings', () => {
      render(<PerfilPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('tab', { name: /cuenta/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /suscripción/i })).toBeInTheDocument();
      expect(screen.getByRole('tab', { name: /ajustes/i })).toBeInTheDocument();
    });

    it('should show account tab content by default', () => {
      render(<PerfilPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Información de Cuenta')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton when auth is loading', async () => {
      const { useRequireAuth } = await import('@/hooks/useRequireAuth');
      (useRequireAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoading: true,
      });

      const { container } = render(<PerfilPage />, { wrapper: createWrapper() });

      // Should show skeleton loaders
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });

    it('should show loading skeleton when profile is loading', async () => {
      const { useProfile } = await import('@/hooks/api/useUser');
      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: true,
      });

      const { container } = render(<PerfilPage />, { wrapper: createWrapper() });

      // Should show skeleton loaders
      const skeletons = container.querySelectorAll('[data-slot="skeleton"]');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('Error States', () => {
    it('should show error message when profile is null after loading', async () => {
      const { useRequireAuth } = await import('@/hooks/useRequireAuth');
      const { useProfile } = await import('@/hooks/api/useUser');

      (useRequireAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoading: false,
      });

      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: null,
        isLoading: false,
      });

      render(<PerfilPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Error al cargar perfil/i)).toBeInTheDocument();
    });

    it('should show error message when profile is undefined after loading', async () => {
      const { useRequireAuth } = await import('@/hooks/useRequireAuth');
      const { useProfile } = await import('@/hooks/api/useUser');

      (useRequireAuth as ReturnType<typeof vi.fn>).mockReturnValue({
        isLoading: false,
      });

      (useProfile as ReturnType<typeof vi.fn>).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      render(<PerfilPage />, { wrapper: createWrapper() });

      expect(screen.getByText(/Error al cargar perfil/i)).toBeInTheDocument();
    });
  });

  describe('Tab Interactions', () => {
    it('should switch to subscription tab when clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      const { waitFor } = await import('@testing-library/react');

      render(<PerfilPage />, { wrapper: createWrapper() });

      // Wait for profile to load and render
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /cuenta/i })).toBeInTheDocument();
      });

      const subscriptionTab = screen.getByRole('tab', { name: /suscripción/i });
      await user.click(subscriptionTab);

      // Subscription tab content should be visible
      expect(screen.getByText('Plan Actual')).toBeInTheDocument();
      expect(screen.getByText('Estadísticas de Uso')).toBeInTheDocument();
    });

    it('should switch to settings tab when clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      const { waitFor } = await import('@testing-library/react');

      render(<PerfilPage />, { wrapper: createWrapper() });

      // Wait for profile to load and render
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /cuenta/i })).toBeInTheDocument();
      });

      const settingsTab = screen.getByRole('tab', { name: /ajustes/i });
      await user.click(settingsTab);

      // Settings tab content should be visible
      expect(screen.getByText('Notificaciones')).toBeInTheDocument();
      expect(screen.getByText('Privacidad')).toBeInTheDocument();
      expect(screen.getByText('Zona Peligrosa')).toBeInTheDocument();
    });

    it('should switch back to account tab when clicked', async () => {
      const userEvent = (await import('@testing-library/user-event')).default;
      const user = userEvent.setup();
      const { waitFor } = await import('@testing-library/react');

      render(<PerfilPage />, { wrapper: createWrapper() });

      // Wait for profile to load and render
      await waitFor(() => {
        expect(screen.getByRole('tab', { name: /cuenta/i })).toBeInTheDocument();
      });

      // Go to subscription tab
      const subscriptionTab = screen.getByRole('tab', { name: /suscripción/i });
      await user.click(subscriptionTab);

      // Go back to account tab
      const accountTab = screen.getByRole('tab', { name: /cuenta/i });
      await user.click(accountTab);

      // Account tab content should be visible
      expect(screen.getByText('Información de Cuenta')).toBeInTheDocument();
    });
  });
});
