import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import ReservarPage from './page';

// Mock useRequireAuth
vi.mock('@/hooks/useRequireAuth');

/** El segmento de la URL: lo lee `useParams`, no una prop (Next 16). */
let mockParams: { id: string } = { id: '1' };

vi.mock('next/navigation', () => ({
  useParams: () => mockParams,
  // `notFound()` corta el render lanzando; el mock reproduce ese contrato.
  notFound: () => {
    throw new Error('NEXT_NOT_FOUND');
  },
}));

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
    mockParams = { id: '1' };
  });

  it('should render loading state when auth is loading', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: true,
    });

    render(<ReservarPage />, { wrapper });

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should render BookingPage component when auth is complete', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: false,
    });

    render(<ReservarPage />, { wrapper });

    expect(screen.getByTestId('booking-page')).toBeInTheDocument();
    expect(screen.getByText(/BookingPage with tarotistaId: 1/i)).toBeInTheDocument();
  });

  it('should pass correct tarotistaId to BookingPage', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: false,
    });
    mockParams = { id: '42' };

    render(<ReservarPage />, { wrapper });

    expect(screen.getByText(/BookingPage with tarotistaId: 42/i)).toBeInTheDocument();
  });

  it('⚠️ T-SEO-006: un segmento que no es un id corta con notFound(), no llega con NaN', () => {
    // Antes tipaba `params` como objeto plano: en Next 16 `params` es una
    // Promise, así que `Number(params.id)` daba `NaN` y `BookingPage` arrancaba
    // con un id inválido.
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: false,
    });
    mockParams = { id: 'abc' };

    expect(() => render(<ReservarPage />, { wrapper })).toThrow('NEXT_NOT_FOUND');
    expect(screen.queryByTestId('booking-page')).not.toBeInTheDocument();
  });
});
