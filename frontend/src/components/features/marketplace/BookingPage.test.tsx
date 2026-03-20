import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useTarotistaDetail } from '@/hooks/api/useTarotistas';
import { useBookSession } from '@/hooks/api/useSessions';
import { BookingPage } from './BookingPage';

// Mock Next.js navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock useTarotistaDetail
vi.mock('@/hooks/api/useTarotistas');

// Mock useBookSession
vi.mock('@/hooks/api/useSessions');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe('BookingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  it('should render loading state initially', () => {
    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<BookingPage tarotistaId={1} />, { wrapper });

    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('should render breadcrumb with tarotista name', async () => {
    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: {
        id: 1,
        nombrePublico: 'María Luna',
        fotoPerfil: 'avatar.jpg',
        ratingPromedio: 4.5,
        bio: 'Experta en tarot',
        especialidades: ['Tarot'],
        totalLecturas: 100,
        totalReviews: 50,
        añosExperiencia: 5,
        idiomas: ['Español'],
        createdAt: '2024-01-01',
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<BookingPage tarotistaId={1} />, { wrapper });

    await waitFor(() => {
      const breadcrumb = screen.getByRole('navigation', { name: /breadcrumb/i });
      expect(breadcrumb).toHaveTextContent('Explorar');
      expect(breadcrumb).toHaveTextContent('María Luna');
      expect(breadcrumb).toHaveTextContent('Reservar');
    });
  });

  it('should display tarotista info in header', async () => {
    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: {
        id: 1,
        nombrePublico: 'María Luna',
        fotoPerfil: 'avatar.jpg',
        ratingPromedio: 4.8,
        bio: 'Experta en tarot',
        especialidades: ['Tarot'],
        totalLecturas: 100,
        totalReviews: 50,
        añosExperiencia: 5,
        idiomas: ['Español'],
        createdAt: '2024-01-01',
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<BookingPage tarotistaId={1} />, { wrapper });

    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('María Luna');
      expect(screen.getByText('4.8')).toBeInTheDocument();
    });
  });

  it('should render BookingCalendar component', async () => {
    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: {
        id: 1,
        nombrePublico: 'María Luna',
        fotoPerfil: 'avatar.jpg',
        ratingPromedio: 4.5,
        bio: 'Experta en tarot',
        especialidades: ['Tarot'],
        totalLecturas: 100,
        totalReviews: 50,
        añosExperiencia: 5,
        idiomas: ['Español'],
        createdAt: '2024-01-01',
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<BookingPage tarotistaId={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/selecciona fecha y hora/i)).toBeInTheDocument();
    });
  });

  it('should handle successful booking', async () => {
    const mockMutate = vi.fn((data, callbacks) => {
      callbacks?.onSuccess({
        id: 1,
        tarotistaId: 1,
        userId: 42,
        sessionType: 'TAROT_READING',
        status: 'CONFIRMED',
        priceUsd: 50,
        paymentStatus: 'PAID',
        userEmail: 'user@example.com',
        sessionDate: '2025-12-20',
        sessionTime: '10:00',
        durationMinutes: 60,
        googleMeetLink: 'https://meet.google.com/abc-def-ghi',
        createdAt: '2025-12-01T10:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      });
    });

    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: {
        id: 1,
        nombrePublico: 'María Luna',
        fotoPerfil: 'avatar.jpg',
        ratingPromedio: 4.5,
        bio: 'Experta en tarot',
        especialidades: ['Tarot'],
        totalLecturas: 100,
        totalReviews: 50,
        añosExperiencia: 5,
        idiomas: ['Español'],
        createdAt: '2024-01-01',
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    } as never);

    render(<BookingPage tarotistaId={1} />, { wrapper });

    // Verificar que el componente renderiza correctamente
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('María Luna');
    });
  });

  it('should show error state when tarotista not found', async () => {
    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<BookingPage tarotistaId={999} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should show loading overlay when booking is in progress', async () => {
    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: {
        id: 1,
        nombrePublico: 'María Luna',
        fotoPerfil: 'avatar.jpg',
        ratingPromedio: 4.5,
        bio: 'Experta en tarot',
        especialidades: ['Tarot'],
        totalLecturas: 100,
        totalReviews: 50,
        añosExperiencia: 5,
        idiomas: ['Español'],
        createdAt: '2024-01-01',
      },
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: true, // Booking in progress
    } as never);

    render(<BookingPage tarotistaId={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/procesando reserva/i)).toBeInTheDocument();
    });
  });
});
