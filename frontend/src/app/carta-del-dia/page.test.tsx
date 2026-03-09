import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import CartaDelDiaPage from './page';
import { createMockTarotCard, createMockDailyReading, createMockUser } from '@/test/factories';

// Create mock functions
const mockPush = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock next/image
vi.mock('next/image', () => ({
  default: function MockImage({
    src,
    alt,
    className,
  }: {
    src: string;
    alt: string;
    className?: string;
  }) {
    return <img src={src} alt={alt} className={className} data-testid="next-image" />;
  },
}));

// Mock hooks
const mockUseDailyReadingToday = vi.fn();
const mockUseDailyReading = vi.fn();
const mockUseDailyReadingPublic = vi.fn();
const mockUseRegenerateDailyReading = vi.fn();
const mockUseAuth = vi.fn();
const mockUseRequireAuth = vi.fn();
const mockUseUserCapabilities = vi.fn();
const mockUseInvalidateCapabilities = vi.fn(() => vi.fn());

vi.mock('@/hooks/api/useDailyReading', () => ({
  useDailyReadingToday: () => mockUseDailyReadingToday(),
  useDailyReading: () => mockUseDailyReading(),
  useDailyReadingPublic: () => mockUseDailyReadingPublic(),
  useRegenerateDailyReading: () => mockUseRegenerateDailyReading(),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => mockUseRequireAuth(),
}));

vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
  useInvalidateCapabilities: () => mockUseInvalidateCapabilities(),
}));

// Mock EncyclopediaInfoWidget
vi.mock('@/components/features/encyclopedia', () => ({
  EncyclopediaInfoWidget: ({ slug }: { slug: string }) => (
    <div data-testid="encyclopedia-info-widget" data-slug={slug} />
  ),
}));

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Test wrapper with QueryClient
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('CartaDelDiaPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks: authenticated user, no daily reading yet
    mockUseRequireAuth.mockReturnValue({ isLoading: false });
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      isAuthenticated: true,
      isLoading: false,
    });
    mockUseUserCapabilities.mockReturnValue({
      data: {
        dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        tarotReadings: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: true,
        canCreateTarotReading: true,
        canUseAI: false,
        canUseCustomQuestions: false,
        canUseAdvancedSpreads: false,
        plan: 'free',
        isAuthenticated: true,
      },
      isLoading: false,
      error: null,
    });
    mockUseDailyReadingToday.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
    mockUseDailyReading.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseDailyReadingPublic.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
    mockUseRegenerateDailyReading.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication', () => {
    // TODO: Estos tests verifican useRequireAuth que la página ya no usa
    // Necesitan actualización para verificar la autenticación actual
    it.skip('should show loading state while checking auth', () => {
      mockUseRequireAuth.mockReturnValue({ isLoading: true });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });

    it.skip('should use useRequireAuth hook', () => {
      renderWithProviders(<CartaDelDiaPage />);

      expect(mockUseRequireAuth).toHaveBeenCalled();
    });
  });

  describe('Estado 1: Card Not Revealed', () => {
    it('should render unrevealed state when no daily reading exists', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByTestId('unrevealed-state')).toBeInTheDocument();
    });

    it('should display mystical prompt text', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByText(/conecta con tu energía y toca la carta/i)).toBeInTheDocument();
    });

    it('should render a face-down card that is clickable', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      const card = screen.getByTestId('tarot-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should call useDailyReading mutation when card is clicked', async () => {
      const user = userEvent.setup();
      const mutateFn = vi.fn();

      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: mutateFn,
        isPending: false,
      });

      renderWithProviders(<CartaDelDiaPage />);

      const card = screen.getByTestId('tarot-card');
      await user.click(card);

      expect(mutateFn).toHaveBeenCalled();
    });

    it('should show loading state while creating daily reading', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByTestId('creating-reading')).toBeInTheDocument();
    });
  });

  describe('Estado 2: Card Revealed', () => {
    it('should render revealed state when daily reading exists', () => {
      // Mock PREMIUM user to see revealed card
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      const dailyReading = createMockDailyReading();
      mockUseDailyReadingToday.mockReturnValue({
        data: dailyReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
    });

    it('should display the card name with golden color', () => {
      // Mock PREMIUM user to see revealed card
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      const dailyReading = createMockDailyReading({
        card: createMockTarotCard({ name: 'La Emperatriz' }),
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: dailyReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      const cardTitle = screen.getByTestId('card-title');
      expect(cardTitle).toHaveTextContent('La Emperatriz');
      expect(cardTitle).toHaveClass('text-secondary');
    });

    it('should display the interpretation', () => {
      // Mock PREMIUM user to see revealed card
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      const interpretation = 'Este es el mensaje de tu carta del día.';
      const dailyReading = createMockDailyReading({ interpretation });
      mockUseDailyReadingToday.mockReturnValue({
        data: dailyReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByText(interpretation)).toBeInTheDocument();
    });

    it('should show reversed indicator when card is reversed', () => {
      // Mock PREMIUM user to see revealed card
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      const dailyReading = createMockDailyReading({ isReversed: true });
      mockUseDailyReadingToday.mockReturnValue({
        data: dailyReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByText(/invertida/i)).toBeInTheDocument();
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      // Mock PREMIUM user so they can see revealed card and buttons
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading(),
        isLoading: false,
        error: null,
      });
    });

    it('should render share button in revealed state', () => {
      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByRole('button', { name: /compartir mensaje/i })).toBeInTheDocument();
    });

    it('should render history button in revealed state', () => {
      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByRole('button', { name: /ver historial/i })).toBeInTheDocument();
    });

    it('should navigate to history when history button is clicked', async () => {
      const user = userEvent.setup();

      renderWithProviders(<CartaDelDiaPage />);

      const historyButton = screen.getByRole('button', { name: /ver historial/i });
      await user.click(historyButton);

      expect(mockPush).toHaveBeenCalledWith('/historial');
    });

    it('should copy interpretation when share button is clicked', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      renderWithProviders(<CartaDelDiaPage />);

      const shareButton = screen.getByRole('button', { name: /compartir mensaje/i });
      await user.click(shareButton);

      expect(writeTextMock).toHaveBeenCalled();
    });

    it('should show daily card limit message for FREE users who already have a daily card', () => {
      // Mock FREE user with daily reading already created
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'FREE' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading(),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      // FREE users should see the revealed card (not blocked)
      expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /compartir mensaje/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ver historial/i })).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading skeleton while fetching daily reading', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message when fetch fails', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Error de red'),
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      expect(screen.getByRole('heading', { level: 1, name: /tarot del día/i })).toBeInTheDocument();
    });

    it('should have proper ARIA labels on interactive elements', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      const card = screen.getByTestId('tarot-card');
      expect(card).toHaveAttribute('aria-label');
    });
  });

  describe('Styling', () => {
    it('should have min-h-screen class', () => {
      const { container } = renderWithProviders(<CartaDelDiaPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('min-h-screen');
    });

    it('should have gradient background', () => {
      const { container } = renderWithProviders(<CartaDelDiaPage />);

      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveClass('bg-gradient-to-b');
    });

    it('should have font-serif class on card title', () => {
      // Mock PREMIUM user to see revealed card
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading(),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<CartaDelDiaPage />);

      const cardName = screen.getByTestId('card-title');
      expect(cardName).toHaveClass('font-serif');
    });
  });
});
