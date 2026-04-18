/**
 * T-FR-F03: DailyCardExperience con Texto de Energía Diaria
 *
 * Tests TDD para la nueva funcionalidad:
 * - FREE/anónimo: muestra `interpretation` como bloque único de energía diaria
 * - PREMIUM: mantiene interpretación personalizada (sin regresión)
 * - Banner upgrade visible para FREE/anónimo, oculto para PREMIUM
 * - Fallback visual cuando `interpretation` es null
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { DailyCardExperience } from './DailyCardExperience';
import {
  createMockTarotCard,
  createMockDailyReading,
  createMockUser,
  createMockFreeCapabilities,
  createMockPremiumCapabilities,
  createMockAnonymousCapabilities,
} from '@/test/factories';

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
const mockUseAuth = vi.fn();
const mockUseUserCapabilities = vi.fn();
const mockUseInvalidateCapabilities = vi.fn();

vi.mock('@/hooks/api/useDailyReading', () => ({
  useDailyReadingToday: () => mockUseDailyReadingToday(),
  useDailyReading: () => mockUseDailyReading(),
  useDailyReadingPublic: () => mockUseDailyReadingPublic(),
  useRegenerateDailyReading: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => mockUseAuth(),
}));

vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
  useInvalidateCapabilities: () => mockUseInvalidateCapabilities(),
}));

vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, staleTime: 0 },
      mutations: { retry: false },
    },
  });
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('DailyCardExperience - Energía Diaria (T-FR-F03)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseInvalidateCapabilities.mockReturnValue(vi.fn());
    mockUseDailyReading.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseDailyReadingPublic.mockReturnValue({ mutate: vi.fn(), isPending: false });
    mockUseDailyReadingToday.mockReturnValue({ data: null, isLoading: false, error: null });
  });

  describe('FREE usuario autenticado - texto de energía diaria', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'free' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseUserCapabilities.mockReturnValue({
        data: createMockFreeCapabilities(),
        isLoading: false,
        error: null,
      });
    });

    it('should display daily energy interpretation as single block when interpretation is present', async () => {
      const user = userEvent.setup();
      const energyText =
        'Hoy la energía del Loco te acompaña. En el amor, es un día para animarte a dar ese primer paso.';
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: energyText,
          })
        );
      });
      mockUseDailyReading.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      expect(screen.getByTestId('daily-energy-interpretation')).toBeInTheDocument();
      expect(screen.getByText(energyText)).toBeInTheDocument();
    });

    it('should show FreeReadingUpgradeBanner after revealing card with interpretation', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: 'Hoy la energía de El Loco te acompaña...',
          })
        );
      });
      mockUseDailyReading.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
      });
    });

    it('should show FreeReadingUpgradeBanner even when interpretation is null (fallback)', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: null,
          })
        );
      });
      mockUseDailyReading.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
      });
    });

    it('should show fallback content when interpretation is null', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: null,
          })
        );
      });
      mockUseDailyReading.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Should show fallback section (cardMeaning or keywords)
      expect(screen.getByTestId('card-meaning-section')).toBeInTheDocument();
    });

    it('should display card name in header when revealed', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            card: createMockTarotCard({ name: 'La Estrella' }),
            interpretation: 'Hoy la energía de La Estrella te guía...',
          })
        );
      });
      mockUseDailyReading.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('card-title')).toHaveTextContent('La Estrella');
      });
    });

    it('should not show anonymous-cta for authenticated FREE user', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: 'Hoy la energía de El Loco te acompaña...',
          })
        );
      });
      mockUseDailyReading.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('anonymous-cta')).not.toBeInTheDocument();
    });
  });

  describe('PREMIUM usuario - interpretación personalizada (sin regresión)', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'premium' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseUserCapabilities.mockReturnValue({
        data: createMockPremiumCapabilities(),
        isLoading: false,
        error: null,
      });
    });

    it('should NOT show FreeReadingUpgradeBanner for PREMIUM user', () => {
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading({
          interpretation: 'Interpretación personalizada y profunda...',
        }),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.queryByTestId('free-reading-upgrade-banner')).not.toBeInTheDocument();
    });

    it('should display PREMIUM interpretation in interpretation-section (not daily-energy)', () => {
      const premiumText = 'Interpretación personalizada y profunda para tu pregunta exacta.';
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading({ interpretation: premiumText }),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByTestId('interpretation-section')).toBeInTheDocument();
      expect(screen.getByText(premiumText)).toBeInTheDocument();
      expect(screen.queryByTestId('daily-energy-interpretation')).not.toBeInTheDocument();
    });
  });

  describe('Usuario anónimo - texto de energía diaria', () => {
    beforeEach(() => {
      mockUseAuth.mockReturnValue({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
      mockUseUserCapabilities.mockReturnValue({
        data: createMockAnonymousCapabilities({ canCreateDailyReading: true }),
        isLoading: false,
        error: null,
      });
    });

    it('should display daily energy interpretation as single block for anonymous user', async () => {
      const user = userEvent.setup();
      const energyText = 'Hoy la energía del Mago te acompaña con su poder creador...';
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: energyText,
          })
        );
      });
      mockUseDailyReadingPublic.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('daily-energy-interpretation')).toBeInTheDocument();
        expect(screen.getByText(energyText)).toBeInTheDocument();
      });
    });

    it('should show FreeReadingUpgradeBanner for anonymous user after reveal', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: 'Hoy la energía del Mago...',
          })
        );
      });
      mockUseDailyReadingPublic.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
      });
    });

    it('should still show anonymous-cta for anonymous user (in addition to upgrade banner)', async () => {
      const user = userEvent.setup();
      const createFn = vi.fn((_, options) => {
        options?.onSuccess?.(
          createMockDailyReading({
            interpretation: null,
          })
        );
      });
      mockUseDailyReadingPublic.mockReturnValue({ mutate: createFn, isPending: false });

      renderWithProviders(<DailyCardExperience />);

      await user.click(screen.getByTestId('tarot-card'));

      await waitFor(() => {
        expect(screen.getByTestId('revealed-state')).toBeInTheDocument();
      });

      // Anonymous users still see CTA to register
      expect(screen.getByTestId('anonymous-cta')).toBeInTheDocument();
    });
  });

  describe('Existing reading pre-loaded (FREE - re-enter page)', () => {
    it('should show daily energy interpretation and upgrade banner for pre-loaded FREE reading', () => {
      mockUseAuth.mockReturnValue({
        user: createMockUser({ plan: 'free' }),
        isAuthenticated: true,
        isLoading: false,
      });
      mockUseUserCapabilities.mockReturnValue({
        data: createMockFreeCapabilities(),
        isLoading: false,
        error: null,
      });
      mockUseDailyReadingToday.mockReturnValue({
        data: createMockDailyReading({
          interpretation: 'Hoy la energía de El Loco te acompaña...',
        }),
        isLoading: false,
        error: null,
      });

      renderWithProviders(<DailyCardExperience />);

      expect(screen.getByTestId('daily-energy-interpretation')).toBeInTheDocument();
      expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
    });
  });
});
