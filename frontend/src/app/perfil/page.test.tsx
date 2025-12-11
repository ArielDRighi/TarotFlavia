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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
