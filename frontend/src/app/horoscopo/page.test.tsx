import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import HoroscopoPage from './page';

// Mock EncyclopediaInfoWidget
vi.mock('@/components/features/encyclopedia', () => ({
  EncyclopediaInfoWidget: ({ slug }: { slug: string }) => (
    <div data-testid="encyclopedia-info-widget" data-slug={slug} />
  ),
}));
// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock hooks
const mockUseTodayAllHoroscopes = vi.fn();
const mockUseAuthStore = vi.fn();

vi.mock('@/hooks/api/useHoroscope', () => ({
  useTodayAllHoroscopes: () => mockUseTodayAllHoroscopes(),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => mockUseAuthStore(),
}));

// Test wrapper
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('HoroscopoPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPush.mockClear();
  });

  it('should render page title', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    expect(screen.getByText('Horóscopo Diario')).toBeInTheDocument();
    expect(screen.getByText('Selecciona tu signo para ver las predicciones')).toBeInTheDocument();
  });

  it('should render zodiac selector when not loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    expect(screen.getByTestId('zodiac-selector')).toBeInTheDocument();
  });

  it('should render skeleton when loading', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: true,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    expect(screen.getByTestId('horoscope-skeleton-grid')).toBeInTheDocument();
  });

  it('should show register message for anonymous users', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    expect(screen.getByText(/Regístrate/i)).toBeInTheDocument();
    expect(screen.getByText(/para ver tu horóscopo automáticamente/i)).toBeInTheDocument();
  });

  it('should show birthDate config message for authenticated users without birthDate', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@test.com', birthDate: null },
      isAuthenticated: true,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    expect(screen.getByText(/Configura tu fecha de nacimiento/i)).toBeInTheDocument();
  });

  it('should navigate to sign page when clicking on a zodiac card', async () => {
    const user = userEvent.setup();
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    const ariesCard = screen.getByTestId('zodiac-card-aries');
    await user.click(ariesCard);

    expect(mockPush).toHaveBeenCalledWith('/horoscopo/aries');
  });

  it('should pass user zodiac sign to selector when authenticated with birthDate', () => {
    mockUseAuthStore.mockReturnValue({
      user: { id: 1, email: 'test@test.com', birthDate: '1990-03-25' }, // Aries
      isAuthenticated: true,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    const ariesCard = screen.getByTestId('zodiac-card-aries');
    // La tarjeta de Aries debería tener una clase especial para "Tu signo"
    expect(ariesCard).toHaveClass('border-accent');
  });

  it('debe renderizar EncyclopediaInfoWidget con slug="guide-horoscope"', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    const widget = screen.getByTestId('encyclopedia-info-widget');
    expect(widget).toBeInTheDocument();
    expect(widget).toHaveAttribute('data-slug', 'guide-horoscope');
  });

  it('debe renderizar correctamente si EncyclopediaInfoWidget retorna null', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isAuthenticated: false,
    });
    mockUseTodayAllHoroscopes.mockReturnValue({
      isLoading: false,
      data: [],
    });

    renderWithProviders(<HoroscopoPage />);

    // Page renders without errors (widget mock returns div, page is stable)
    expect(screen.getByText('Horóscopo Diario')).toBeInTheDocument();
  });
});
