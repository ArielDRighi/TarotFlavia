import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DailyCardExperience } from './DailyCardExperience';
import {
  createMockTarotCard,
  createMockDailyReading,
  createMockAnonymousCapabilities,
  createMockFreeCapabilities,
  createMockCapabilitiesWithDailyCardLimitReached,
} from '@/test/factories';

// Create mock functions
const mockPush = vi.fn();
const mockUseDailyReadingToday = vi.fn();
const mockUseDailyReading = vi.fn();
const mockUseDailyReadingPublic = vi.fn();
const mockUseAuth = vi.fn();
const mockUseUserCapabilities = vi.fn();
const mockUseInvalidateCapabilities = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock fingerprint utilities
vi.mock('@/lib/utils/fingerprint', () => ({
  getSessionFingerprint: vi.fn().mockResolvedValue('mock-fingerprint-12345'),
  generateSessionFingerprint: vi.fn().mockResolvedValue('mock-fingerprint-12345'),
}));

// Mock hooks
vi.mock('@/hooks/api/useDailyReading', () => ({
  useDailyReadingToday: () => mockUseDailyReadingToday(),
  useDailyReading: () => mockUseDailyReading(),
  useDailyReadingPublic: () => mockUseDailyReadingPublic(),
  useRegenerateDailyReading: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
  useInvalidateCapabilities: () => mockUseInvalidateCapabilities(),
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

describe('DailyCardExperience - Anonymous User Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for invalidateCapabilities
    mockUseInvalidateCapabilities.mockReturnValue(vi.fn());

    // Default mocks for useDailyReading mutation
    mockUseDailyReading.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });

    // Default mock for useDailyReadingPublic mutation
    mockUseDailyReadingPublic.mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    });
  });

  describe('when user is anonymous (not authenticated)', () => {
    beforeEach(() => {
      // Clear sessionStorage to simulate fresh anonymous user session
      sessionStorage.clear();

      // Mock anonymous user (not authenticated)
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Mock capabilities: anonymous user with available limit
      mockUseUserCapabilities.mockReturnValue({
        data: createMockAnonymousCapabilities({ canCreateDailyReading: true }),
        isLoading: false,
        error: null,
      });

      // Mock authenticated endpoint to return default values (won't be called)
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
    });

    it('should allow access without authentication', () => {
      renderWithProviders(<DailyCardExperience />);

      // Should show the unrevealed card without requiring auth
      // Anonymous users don't fetch initial data - they generate on click
      expect(screen.getByTestId('unrevealed-state')).toBeInTheDocument();
    });

    it('should call public POST endpoint with fingerprint when clicking card', async () => {
      const user = userEvent.setup();
      const mockMutate = vi.fn();

      // Mock the mutation hook to return an object with mutate function
      mockUseDailyReadingPublic.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Click on tarot card to trigger generation
      const tarotCard = screen.getByTestId('tarot-card');
      await user.click(tarotCard);

      // Verify POST mutation was called with fingerprint
      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalledWith(
          expect.any(String), // fingerprint
          expect.objectContaining({
            onSuccess: expect.any(Function),
            onError: expect.any(Function),
          })
        );
      });
    });

    it('should show daily reading after generating with POST (without interpretation)', async () => {
      const user = userEvent.setup();
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null, // Anonymous users get null interpretation
        isReversed: false,
      });

      // Mock mutate function that calls onSuccess callback immediately
      const mockMutate = vi.fn((fingerprint, { onSuccess }) => {
        onSuccess(mockReading);
      });

      mockUseDailyReadingPublic.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Click to reveal card
      const tarotCard = screen.getByTestId('tarot-card');
      await user.click(tarotCard);

      // Wait for reveal animation to complete (600ms)
      await waitFor(
        () => {
          expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Should show card title
      expect(screen.getByTestId('card-title')).toHaveTextContent(mockCard.name);

      // Should NOT show interpretation section (interpretation is null)
      expect(screen.queryByTestId('interpretation-section')).not.toBeInTheDocument();

      // Should show CTA to register
      expect(screen.getByTestId('anonymous-cta')).toBeInTheDocument();
    });

    it('should show conversion CTA after revealing card', async () => {
      const user = userEvent.setup();
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null,
      });

      const mockMutate = vi.fn((fingerprint, { onSuccess }) => {
        onSuccess(mockReading);
      });

      mockUseDailyReadingPublic.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Click to reveal
      const tarotCard = screen.getByTestId('tarot-card');
      await user.click(tarotCard);

      await waitFor(
        () => {
          expect(screen.getByTestId('anonymous-cta')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Should show primary CTA to register
      expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
    });

    it('should show AnonymousLimitReached when limit is reached (capabilities-driven)', async () => {
      // Mock capabilities: anonymous limit reached
      mockUseUserCapabilities.mockReturnValue({
        data: createMockCapabilitiesWithDailyCardLimitReached('anonymous'),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      // Should NOT show unrevealed card when limit is reached
      expect(screen.queryByTestId('unrevealed-state')).not.toBeInTheDocument();
      // Component shows AnonymousLimitReached immediately (capabilities prevent card creation)
    });

    it('should NOT show regenerate button for anonymous users', async () => {
      const user = userEvent.setup();
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null,
      });

      const mockMutate = vi.fn((fingerprint, { onSuccess }) => {
        onSuccess(mockReading);
      });

      mockUseDailyReadingPublic.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Click to reveal
      const tarotCard = screen.getByTestId('tarot-card');
      await user.click(tarotCard);

      await waitFor(
        () => {
          expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Regenerate button should NOT be visible for anonymous users
      expect(screen.queryByRole('button', { name: /regenerar/i })).not.toBeInTheDocument();
    });

    it('should NOT show share button for anonymous users', async () => {
      const user = userEvent.setup();
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null,
      });

      const mockMutate = vi.fn((fingerprint, { onSuccess }) => {
        onSuccess(mockReading);
      });

      mockUseDailyReadingPublic.mockReturnValue({
        mutate: mockMutate,
        isPending: false,
      });

      renderWithProviders(<DailyCardExperience />);

      // Click to reveal
      const tarotCard = screen.getByTestId('tarot-card');
      await user.click(tarotCard);

      await waitFor(
        () => {
          expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
        },
        { timeout: 1000 }
      );

      // Share button should NOT be visible for anonymous users (no interpretation)
      expect(screen.queryByRole('button', { name: /compartir/i })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      // Mock useDailyReading mutation
      mockUseDailyReading.mockReturnValue({
        mutate: vi.fn(),
        isPending: false,
      });
    });

    it('should call authenticated endpoint for authenticated users', () => {
      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com', plan: 'FREE' },
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      // Verify authenticated endpoint hook was called
      expect(mockUseDailyReadingToday).toHaveBeenCalled();
    });

    it('should show full interpretation for authenticated users', async () => {
      const user = userEvent.setup();
      const mockCard = createMockTarotCard();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            card: mockCard,
            interpretation: 'Esta es tu interpretación personalizada del día.',
            isReversed: false,
          })
        );
      });

      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com', plan: 'FREE' },
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

      // Should show interpretation
      expect(
        screen.getByText('Esta es tu interpretación personalizada del día.')
      ).toBeInTheDocument();

      // Should show action buttons
      expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ver historial/i })).toBeInTheDocument();
    });
  });
});
