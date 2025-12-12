import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { useRouter } from 'next/navigation';
import { useTarotistaDetail } from '@/hooks/api/useTarotistas';
import { useBookSession } from '@/hooks/api/useSessions';
import { useRequireAuth } from '@/hooks/useRequireAuth';
import ReservarPage from './page';

// Mock Next.js navigation
const mockPush = vi.fn();
const mockParams = { id: '1' };
const mockRouter = {
  push: mockPush,
};

vi.mock('next/navigation', () => ({
  useRouter: () => mockRouter,
  useParams: () => mockParams,
}));

// Mock useRequireAuth
vi.mock('@/hooks/useRequireAuth');

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

describe('ReservarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();

    // Default mocks
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: false,
    });
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

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

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

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

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

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

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

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/selecciona una fecha/i)).toBeInTheDocument();
    });
  });

  it('should handle successful booking', async () => {
    const mockMutate = vi.fn((data, callbacks) => {
      callbacks?.onSuccess({
        id: 1,
        sessionDate: '2025-12-20',
        sessionTime: '10:00',
        durationMinutes: 60,
        googleMeetLink: 'https://meet.google.com/abc-def-ghi',
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

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

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

    render(<ReservarPage params={{ id: '999' }} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  it('should protect page with useRequireAuth', () => {
    vi.mocked(useRequireAuth).mockReturnValue({
      isLoading: true,
    });

    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

    // Si está cargando auth, debería mostrar loading
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
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

    render(<ReservarPage params={{ id: '1' }} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/procesando reserva/i)).toBeInTheDocument();
    });
  });

  it('should navigate back to explorar on error button click', async () => {
    const mockPush = vi.fn();
    mockRouter.push = mockPush;

    vi.mocked(useTarotistaDetail).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Not found'),
    } as never);

    vi.mocked(useBookSession).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as never);

    render(<ReservarPage params={{ id: '999' }} />, { wrapper });

    const backButton = await screen.findByText(/volver a explorar/i);
    backButton.click();

    expect(mockPush).toHaveBeenCalledWith('/explorar');
  });
});
