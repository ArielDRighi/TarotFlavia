import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DailyCardExperience } from './DailyCardExperience';
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

// Mock fingerprint utilities
vi.mock('@/lib/utils/fingerprint', () => ({
  getSessionFingerprint: vi.fn().mockResolvedValue('mock-fingerprint-12345'),
  generateSessionFingerprint: vi.fn().mockResolvedValue('mock-fingerprint-12345'),
}));

// Mock hooks
const mockUseDailyReadingToday = vi.fn();
const mockUseDailyReading = vi.fn();
const mockUseDailyReadingPublic = vi.fn();
const mockUseRegenerateDailyReading = vi.fn();
const mockUseAuth = vi.fn();
const mockUseRequireAuth = vi.fn();

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

describe('DailyCardExperience', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks: authenticated user, no daily reading yet
    mockUseRequireAuth.mockReturnValue({ isLoading: false });
    mockUseAuth.mockReturnValue({
      user: createMockUser(),
      isAuthenticated: true,
      isLoading: false,
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

  describe('Unrevealed State', () => {
    it('should render unrevealed state when no daily reading exists', () => {
      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByTestId('unrevealed-state')).toBeInTheDocument();
    });

    it('should display mystical prompt text', () => {
      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByText(/conecta con tu energía y toca la carta/i)).toBeInTheDocument();
    });

    it('should render a clickable tarot card', () => {
      renderWithProviders(<DailyCardExperience />);

      const card = screen.getByTestId('tarot-card');
      expect(card).toBeInTheDocument();
      expect(card).toHaveAttribute('role', 'button');
    });

    it('should call mutation when card is clicked - authenticated user (FREE)', async () => {
      const user = userEvent.setup();
      const mutateFn = vi.fn();

      mockUseDailyReading.mockReturnValue({
        mutate: mutateFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      expect(mutateFn).toHaveBeenCalled();
    });

    it('should call public mutation when card is clicked - anonymous user', async () => {
      const user = userEvent.setup();
      const mutateFn = vi.fn();

      // Mock anonymous user (not authenticated)
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      mockUseDailyReadingPublic.mockReturnValue({
        mutate: mutateFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      expect(mutateFn).toHaveBeenCalled();
    });

    it('should show creating indicator while creating reading', () => {
      mockUseDailyReading.mockReturnValue({
        mutate: vi.fn(),
        isPending: true,
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByTestId('creating-reading')).toBeInTheDocument();
    });
  });

  describe('Revealed State - with personalized interpretation (PREMIUM)', () => {
    it('should render revealed state when daily reading exists with personalized interpretation', () => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading({ interpretation: 'Interpretación personalizada completa' }),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      expect(screen.getByText('Interpretación personalizada completa')).toBeInTheDocument();
    });

    it('should display card name with secondary color - PREMIUM user', () => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading({
          card: createMockTarotCard({ name: 'La Estrella' }),
          interpretation: 'Interpretación personalizada detallada',
        }),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      const cardTitle = screen.getByTestId('card-title');
      expect(cardTitle).toHaveTextContent('La Estrella');
      expect(cardTitle).toHaveClass('text-secondary');
    });
  });

  describe('Revealed State - without AI (FREE/ANONYMOUS)', () => {
    it('should render revealed state for FREE user without AI interpretation', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: null, // No AI interpretation for FREE users
          })
        );
      });

      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'FREE' }),
        isAuthenticated: true,
        isLoading: false,
      });
      // No existing card - must create first
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create daily card first - click face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for card to be revealed
      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      expect(screen.getByTestId('card-meaning-section')).toBeInTheDocument();
      // Verify NO premium interpretation is shown (only basic card info)
      expect(screen.queryByText(/actualiza a premium/i)).not.toBeInTheDocument();
    });

    it('should render revealed state for ANONYMOUS user without AI interpretation', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: null, // No AI interpretation for ANONYMOUS users
          })
        );
      });

      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      // No existing card - must create first
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: vi.fn(), // Not used for anonymous
        isPending: false,
      });
      mockUseDailyReadingPublic.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create daily card first - click face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for card to be revealed
      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      expect(screen.getByTestId('card-title')).toBeInTheDocument();
      expect(screen.getByTestId('card-meaning-section')).toBeInTheDocument();
      // Verify anonymous CTA is shown
      expect(screen.getByTestId('anonymous-cta')).toBeInTheDocument();
      expect(screen.getByText(/regístrate gratis/i)).toBeInTheDocument();
    });

    it('should show reversed indicator when card is reversed - FREE user', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            isReversed: true,
            interpretation: null,
          })
        );
      });

      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'FREE' }),
        isAuthenticated: true,
        isLoading: false,
      });
      // No existing card - must create first
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create daily card first - click face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for card to be revealed
      await waitFor(() => {
        expect(screen.getByText(/invertida/i)).toBeInTheDocument();
      });
    });
  });

  describe('Action Buttons', () => {
    beforeEach(() => {
      // No existing card - unmock to show unrevealed state
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });

      // Mock create mutation to instantly succeed with card
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(createMockDailyReading());
      });
      mockUseDailyReading.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });
    });

    it('should render share button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DailyCardExperience />);

      // Create card first by clicking the face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for reveal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /compartir mensaje/i })).toBeInTheDocument();
      });
    });

    it('should render history button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<DailyCardExperience />);

      // Create card first
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for reveal
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ver historial/i })).toBeInTheDocument();
      });
    });

    it('should navigate to history on click', async () => {
      const user = userEvent.setup();

      renderWithProviders(<DailyCardExperience />);

      // Create card first
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for history button and click
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /ver historial/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /ver historial/i }));

      expect(mockPush).toHaveBeenCalledWith('/historial');
    });

    it('should copy to clipboard on share click', async () => {
      const user = userEvent.setup();
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: { writeText: writeTextMock },
        writable: true,
        configurable: true,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create card first
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for share button and click
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /compartir mensaje/i })).toBeInTheDocument();
      });

      await user.click(screen.getByRole('button', { name: /compartir mensaje/i }));

      expect(writeTextMock).toHaveBeenCalled();
    });
  });

  describe('Premium Features', () => {
    it('should show upgrade modal for free users', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(createMockDailyReading());
      });

      // No existing card - simulate first-time creation
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create daily card first - click face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for card to be revealed
      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Now try to regenerate
      await user.click(screen.getByRole('button', { name: /regenerar/i }));

      await waitFor(() => {
        expect(screen.getByText(/actualiza a premium/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation modal for premium users', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(createMockDailyReading());
      });

      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      // No existing card
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create daily card first - click face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for card to be revealed
      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Now try to regenerate
      await user.click(screen.getByRole('button', { name: /regenerar/i }));

      await waitFor(() => {
        expect(screen.getByText(/¿regenerar carta/i)).toBeInTheDocument();
      });
    });

    it('should call regenerate mutation on confirm', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(createMockDailyReading());
      });
      const regenerateFn = vi.fn();

      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'PREMIUM' }),
        isAuthenticated: true,
        isLoading: false,
      });
      // No existing card
      mockUseDailyReadingToday.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: null,
      });
      mockUseDailyReading.mockReturnValue({
        mutate: createFn,
        isPending: false,
      });
      mockUseRegenerateDailyReading.mockReturnValue({
        mutate: regenerateFn,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Create daily card first - click face-down card
      await user.click(screen.getByTestId('tarot-card'));

      // Wait for card to be revealed
      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Now regenerate
      await user.click(screen.getByRole('button', { name: /regenerar/i }));

      const confirmButton = await screen.findByRole('button', { name: /confirmar/i });
      await user.click(confirmButton);

      expect(regenerateFn).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show skeleton while fetching', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByTestId('loading-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should show error message on fetch error', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByText(/error/i)).toBeInTheDocument();
    });

    it('should have role="alert" on error container for accessibility', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: new Error('Network error'),
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByRole('alert')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-label on skeleton loading container', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      const container = screen.getByLabelText('Cargando carta del día');
      expect(container).toBeInTheDocument();
    });
  });
});
