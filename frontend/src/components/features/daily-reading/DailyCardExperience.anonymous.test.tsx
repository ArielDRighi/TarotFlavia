import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AxiosError } from 'axios';

import { DailyCardExperience } from './DailyCardExperience';
import { createMockTarotCard, createMockDailyReading } from '@/test/factories';

// Create mock functions
const mockPush = vi.fn();
const mockUseDailyReadingTodayPublic = vi.fn();
const mockUseDailyReadingToday = vi.fn();
const mockUseDailyReading = vi.fn();
const mockUseDailyReadingPublic = vi.fn();
const mockUseAuth = vi.fn();

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock hooks
vi.mock('@/hooks/api/useDailyReading', () => ({
  useDailyReadingTodayPublic: () => mockUseDailyReadingTodayPublic(),
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

// Helper to create an AxiosError mock
function createMockAxiosError(status: number, message?: string): AxiosError {
  const error = new Error(message || 'Request failed') as AxiosError;
  error.isAxiosError = true;
  error.response = {
    status,
    data: { message },
    statusText: '',
    headers: {},
    config: {} as Record<string, unknown>,
  };
  return error;
}

describe('DailyCardExperience - Anonymous User Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();

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
      // Mock anonymous user (not authenticated)
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });

      // Mock authenticated endpoint to return default values (won't be called)
      mockUseDailyReadingToday.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });
    });

    it('should allow access without authentication', () => {
      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      // Should show the unrevealed card without requiring auth
      expect(screen.getByTestId('unrevealed-state')).toBeInTheDocument();
    });

    it('should call public endpoint when fetching daily reading', () => {
      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      // Verify public endpoint hook was called
      expect(mockUseDailyReadingTodayPublic).toHaveBeenCalled();
      // Both hooks are called (React Query pattern), but component uses public data
    });

    it('should show daily reading from public endpoint (without interpretation)', async () => {
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null, // Public endpoint returns null interpretation
        isReversed: false,
      });

      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: mockReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Should show card title (use getByTestId to avoid duplicate match)
      expect(screen.getByTestId('card-title')).toHaveTextContent(mockCard.name);

      // Should NOT show interpretation section (interpretation is null)
      expect(screen.queryByTestId('interpretation-section')).not.toBeInTheDocument();

      // Should show CTA to register
      expect(screen.getByTestId('anonymous-cta')).toBeInTheDocument();
    });

    it('should show conversion CTA after revealing card', async () => {
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null,
      });

      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: mockReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByTestId('anonymous-cta')).toBeInTheDocument();
      });

      // Should show primary CTA to register
      expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
    });

    it('should show AnonymousLimitReached when limit is reached (403)', async () => {
      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: null,
        isLoading: false,
        error: createMockAxiosError(403, 'Ya viste tu carta del día'),
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toBeInTheDocument();
      });

      expect(
        screen.getByText('Ya viste tu carta del día. Regístrate para acceder a más lecturas.')
      ).toBeInTheDocument();

      expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /iniciar sesión/i })).toBeInTheDocument();
    });

    it('should navigate to register when clicking primary CTA in limit reached state', async () => {
      const user = userEvent.setup();

      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: null,
        isLoading: false,
        error: createMockAxiosError(403),
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /crear cuenta gratis/i })).toBeInTheDocument();
      });

      const registerButton = screen.getByRole('button', { name: /crear cuenta gratis/i });
      await user.click(registerButton);

      expect(mockPush).toHaveBeenCalledWith('/register');
    });

    it('should NOT show regenerate button for anonymous users', async () => {
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null,
      });

      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: mockReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Regenerate button should NOT be visible for anonymous users
      expect(screen.queryByRole('button', { name: /regenerar/i })).not.toBeInTheDocument();
    });

    it('should NOT show share button for anonymous users', async () => {
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: null,
      });

      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: mockReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Share button should NOT be visible for anonymous users (no interpretation)
      expect(screen.queryByRole('button', { name: /compartir/i })).not.toBeInTheDocument();
    });
  });

  describe('when user is authenticated', () => {
    beforeEach(() => {
      // Mock public endpoint to return default values (won't be called)
      mockUseDailyReadingTodayPublic.mockReturnValue({
        data: null,
        isLoading: false,
        error: null,
      });

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
      // Both hooks are called (React Query pattern), but component uses authenticated data
    });

    it('should show full interpretation for authenticated users', async () => {
      const mockCard = createMockTarotCard();
      const mockReading = createMockDailyReading({
        card: mockCard,
        interpretation: 'Esta es tu interpretación personalizada del día.',
        isReversed: false,
      });

      mockUseAuth.mockReturnValue({
        user: { id: 1, email: 'test@example.com', plan: 'FREE' },
        isAuthenticated: true,
        isLoading: false,
      });

      mockUseDailyReadingToday.mockReturnValue({
        data: mockReading,
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Should show interpretation
      expect(
        screen.getByText('Esta es tu interpretación personalizada del día.')
      ).toBeInTheDocument();

      // Should show action buttons
      expect(screen.getByRole('button', { name: /compartir/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /regenerar/i })).toBeInTheDocument();
    });
  });
});
