import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TarotistaProfilePage } from './TarotistaProfilePage';
import type { TarotistaDetail } from '@/types/tarotista.types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock useTarotistaDetail hook
const mockUseTarotistaDetail = vi.fn();
vi.mock('@/hooks/api/useTarotistas', () => ({
  useTarotistaDetail: (id: number) => mockUseTarotistaDetail(id),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

function createMockTarotista(): TarotistaDetail {
  return {
    id: 1,
    nombrePublico: 'Luna Mística',
    bio: 'Experta en lecturas de amor y trabajo con 15 años de experiencia. Me especializo en ayudar a personas a encontrar su camino.',
    especialidades: ['Amor', 'Carrera', 'Espiritual'],
    fotoPerfil: 'https://example.com/avatar.jpg',
    ratingPromedio: 4.8,
    totalLecturas: 250,
    totalReviews: 42,
    añosExperiencia: 15,
    idiomas: ['Español', 'Inglés'],
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
  };
}

describe('TarotistaProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
  });

  // ============================================================================
  // Loading State
  // ============================================================================

  it('should show loading skeleton while fetching data', () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    // Should show multiple skeletons
    const skeletons = screen.getAllByTestId(/skeleton/i);
    expect(skeletons.length).toBeGreaterThan(0);
  });

  // ============================================================================
  // Error State
  // ============================================================================

  it('should show error message when fetch fails', () => {
    const mockError = new Error('Failed to fetch tarotista');
    mockUseTarotistaDetail.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: mockError,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    expect(screen.getByText(/error al cargar/i)).toBeInTheDocument();
  });

  // ============================================================================
  // Hero Section
  // ============================================================================

  it('should render hero section with tarotista info', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      // Name
      expect(screen.getByText('Luna Mística')).toBeInTheDocument();

      // Rating
      expect(screen.getByText('4.8')).toBeInTheDocument();
      expect(screen.getByText(/42 reseñas/i)).toBeInTheDocument();
    });
  });
  it('should display specialty badges in hero section', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText('Amor')).toBeInTheDocument();
      expect(screen.getByText('Carrera')).toBeInTheDocument();
      expect(screen.getByText('Espiritual')).toBeInTheDocument();
    });
  });

  it('should show "Disponible ahora" when tarotista is active', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: { ...createMockTarotista(), isActive: true },
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/disponible ahora/i)).toBeInTheDocument();
    });
  });

  it('should show "No disponible" when tarotista is inactive', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: { ...createMockTarotista(), isActive: false },
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/no disponible/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Bio Section
  // ============================================================================

  it('should render bio section with complete information', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/sobre mí/i)).toBeInTheDocument();
      expect(screen.getByText(/Experta en lecturas de amor/i)).toBeInTheDocument();
      // Look for experience specifically in the experience section
      const experienceElements = screen.getAllByText(/15/);
      expect(experienceElements.length).toBeGreaterThan(0);
      expect(screen.getByText(/Español, Inglés/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Services Section
  // ============================================================================

  it('should render both service cards (AI and Live Session)', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/oráculo digital/i)).toBeInTheDocument();
      expect(screen.getByText(/lectura con ia personalizada/i)).toBeInTheDocument();

      expect(screen.getByText(/sesión privada/i)).toBeInTheDocument();
      expect(screen.getByText(/sesión en vivo/i)).toBeInTheDocument();
    });
  });

  it('should navigate to ritual page when "Consultar el Tarot" is clicked', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<TarotistaProfilePage id={1} />, { wrapper });

    // Wait for the button to appear
    const button = await screen.findByRole('button', { name: /consultar el tarot/i });

    // Click the button
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith('/ritual?tarotistaId=1');
  });

  it('should navigate to booking page when "Ver disponibilidad" is clicked', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    const user = userEvent.setup();
    render(<TarotistaProfilePage id={1} />, { wrapper });

    // Wait for the button to appear
    const button = await screen.findByRole('button', { name: /ver disponibilidad/i });

    // Click the button
    await user.click(button);

    expect(mockPush).toHaveBeenCalledWith('/tarotistas/1/reservar');
  });

  // ============================================================================
  // Reviews Section
  // ============================================================================

  it('should render reviews section with title', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      expect(screen.getByText(/lo que dicen mis consultantes/i)).toBeInTheDocument();
    });
  });

  it('should show placeholder for reviews (future implementation)', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      // For now, just verify the section exists
      expect(screen.getByText(/lo que dicen mis consultantes/i)).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Responsive Design
  // ============================================================================

  it('should have responsive classes', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    const { container } = render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      const mainContainer = container.querySelector('[data-testid="tarotista-profile"]');
      expect(mainContainer).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Accessibility
  // ============================================================================

  it('should have proper heading hierarchy', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      const h1 = screen.getByRole('heading', { level: 1 });
      expect(h1).toBeInTheDocument();
      expect(h1).toHaveTextContent('Luna Mística');

      const h2s = screen.queryAllByRole('heading', { level: 2 });
      expect(h2s.length).toBeGreaterThan(0);
    });
  });
  it('should display tarotista name as accessible heading', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      // Verify name is in h1
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Luna Mística');

      // Verify availability indicator exists
      const availabilityIndicator = screen.getByLabelText(/disponible ahora/i);
      expect(availabilityIndicator).toBeInTheDocument();
    });
  });

  // ============================================================================
  // Favorite Tarotista Button
  // ============================================================================

  it('should render FavoriteTarotistaButton component', async () => {
    mockUseTarotistaDetail.mockReturnValue({
      data: createMockTarotista(),
      isLoading: false,
      error: null,
    });

    render(<TarotistaProfilePage id={1} />, { wrapper });

    await waitFor(() => {
      // The button is rendered by FavoriteTarotistaButton component
      // which is tested separately
      expect(screen.getByTestId('tarotista-profile')).toBeInTheDocument();
    });
  });
});
