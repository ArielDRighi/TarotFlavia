import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import ReservarPage from './page';

// Mock useRequireAuth
vi.mock('@/hooks/useRequireAuth');

// Mock BookingPage component
vi.mock('@/components/features/marketplace', () => ({
  BookingPage: ({ tarotistaId }: { tarotistaId: number }) => (
    <div data-testid="booking-page">BookingPage with tarotistaId: {tarotistaId}</div>
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('ReservarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should render loading state when auth is loading', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: true,
    });

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should render BookingPage component when auth is complete', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: false,
    });

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

    expect(screen.getByTestId('booking-page')).toBeInTheDocument();
    expect(screen.getByText(/BookingPage with tarotistaId: 1/i)).toBeInTheDocument();
  });

  it('should pass correct tarotistaId to BookingPage', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: false,
    });

    render(<ReservarPage params={{ id: '42' }} />, { wrapper });

    expect(screen.getByText(/BookingPage with tarotistaId: 42/i)).toBeInTheDocument();
  });
});
