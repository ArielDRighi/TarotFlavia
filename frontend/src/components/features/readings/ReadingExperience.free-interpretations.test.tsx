/**
 * Tests for InterpretationSection with FREE plan features:
 * - freeInterpretations rendering (pre-written texts)
 * - Category header display (icon + name)
 * - Fallback to meaningUpright/Reversed when freeInterpretations is missing
 * - FreeReadingUpgradeBanner visibility (FREE vs PREMIUM)
 *
 * These tests cover HUS-003 and HUS-006
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingExperience } from './ReadingExperience';
import type { Spread, ReadingDetail, ReadingCard, PredefinedQuestion } from '@/types/reading.types';

// Mock Next.js router
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

// Mock Next.js Image
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

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: function MockReactMarkdown({ children }: { children: string }) {
    return <div data-testid="markdown-content">{children}</div>;
  },
}));

// Mock UpgradeBanner (existing one — NOT the new FreeReadingUpgradeBanner)
vi.mock('./UpgradeBanner', () => ({
  default: function MockUpgradeBanner() {
    return (
      <div data-testid="upgrade-banner">
        <p>💎 Desbloquea interpretaciones personalizadas</p>
        <button>Upgrade a Premium</button>
      </div>
    );
  },
}));

// Mock UpgradeModal
vi.mock('./UpgradeModal', () => ({
  default: function MockUpgradeModal({
    open,
    onOpenChange,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
  }) {
    if (!open) return null;
    return (
      <div role="dialog" data-testid="upgrade-modal">
        <button onClick={() => onOpenChange(false)}>Close</button>
      </div>
    );
  },
}));

// Mock FreeReadingUpgradeBanner
vi.mock('./FreeReadingUpgradeBanner', () => ({
  default: function MockFreeReadingUpgradeBanner() {
    return (
      <div data-testid="free-reading-upgrade-banner">
        <p>
          ✨ Con Premium obtenés una interpretación personalizada y profunda para tu pregunta
          exacta.
        </p>
        <button>Conocer Premium</button>
      </div>
    );
  },
}));

// Mock useUserCapabilities — mutable
const mockUseUserCapabilities = vi.fn();
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => mockUseUserCapabilities(),
}));

// Mock useUserPlanFeatures — mutable
const mockUseUserPlanFeatures = vi.fn();
vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
  useUserPlanFeatures: () => mockUseUserPlanFeatures(),
}));

// Mock readings-api
vi.mock('@/lib/api/readings-api', () => ({
  getShareText: vi.fn().mockResolvedValue({ text: 'Mocked share text' }),
}));

// Mock device utils
vi.mock('@/lib/utils/device', () => ({
  shouldUseNativeShare: () => false,
  isMobileDevice: () => false,
}));

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      plan: 'free',
      roles: ['consumer'],
      profilePicture: null,
    },
    isAuthenticated: true,
  }),
}));

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// ============================================================================
// Test data
// ============================================================================

const mockSpread: Spread = {
  id: 2,
  name: 'Tres Cartas',
  description: 'Pasado, presente, futuro',
  cardCount: 3,
  positions: [
    { position: 1, name: 'Pasado', description: 'Lo que dejaste atrás' },
    { position: 2, name: 'Presente', description: 'Tu situación actual' },
    { position: 3, name: 'Futuro', description: 'Lo que vendrá' },
  ],
  difficulty: 'beginner',
  requiredPlan: 'free',
};

const mockPredefinedQuestions: PredefinedQuestion[] = [
  {
    id: 33,
    questionText: '¿Qué debo saber?',
    categoryId: 1,
    order: 1,
    isActive: true,
    usageCount: 10,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
    deletedAt: null,
  },
];

const mockReadingCards: ReadingCard[] = [
  {
    id: 1,
    name: 'El Loco',
    arcana: 'major',
    number: 0,
    suit: null,
    orientation: 'upright',
    position: 1,
    positionName: 'Pasado',
    imageUrl: '/cards/the-fool.jpg',
    isReversed: false,
    meaningUpright: 'El Loco upright significado crudo',
    meaningReversed: 'El Loco reversed significado crudo',
    keywords: 'aventura, libertad',
  },
  {
    id: 2,
    name: 'El Mago',
    arcana: 'major',
    number: 1,
    suit: null,
    orientation: 'upright',
    position: 2,
    positionName: 'Presente',
    imageUrl: '/cards/the-magician.jpg',
    isReversed: false,
    meaningUpright: 'El Mago upright significado crudo',
    meaningReversed: 'El Mago reversed significado crudo',
    keywords: 'habilidad, voluntad',
  },
  {
    id: 3,
    name: 'La Sacerdotisa',
    arcana: 'major',
    number: 2,
    suit: null,
    orientation: 'reversed',
    position: 3,
    positionName: 'Futuro',
    imageUrl: '/cards/high-priestess.jpg',
    isReversed: true,
    meaningUpright: 'La Sacerdotisa upright crudo',
    meaningReversed: 'La Sacerdotisa reversed crudo',
    keywords: 'intuición, misterio',
  },
];

/** Reading WITH freeInterpretations (FREE user with category) */
const mockFreeReadingWithInterpretations: ReadingDetail = {
  id: 200,
  userId: 1,
  spreadId: 2,
  question: 'Lectura general',
  cards: mockReadingCards,
  interpretation: null,
  freeInterpretations: {
    1: { content: 'El Loco en amor: texto amigable pre-escrito upright.' },
    2: { content: 'El Mago en amor: texto amigable pre-escrito upright.' },
    3: { content: 'La Sacerdotisa en amor: texto amigable pre-escrito reversed.' },
  },
  categoryName: 'Amor y Relaciones',
  createdAt: '2025-12-07T10:00:00Z',
  shareToken: null,
};

/** Reading WITHOUT freeInterpretations (FREE user legacy, or freeInterpretations missing for a card) */
const mockFreeReadingWithoutInterpretations: ReadingDetail = {
  id: 201,
  userId: 1,
  spreadId: 2,
  question: 'Lectura general',
  cards: mockReadingCards,
  interpretation: null,
  freeInterpretations: null,
  createdAt: '2025-12-07T10:00:00Z',
  shareToken: null,
};

/** Reading for PREMIUM with AI interpretation */
const mockPremiumReading: ReadingDetail = {
  id: 202,
  userId: 2,
  spreadId: 2,
  question: '¿Qué me dice el universo?',
  cards: mockReadingCards,
  interpretation: {
    id: 1,
    generalInterpretation: '**Interpretación personalizada** del universo...',
    cardInterpretations: [],
    aiProvider: 'groq',
    model: 'llama-3.1-70b-versatile',
  },
  freeInterpretations: null,
  createdAt: '2025-12-07T10:00:00Z',
  shareToken: null,
};

// ============================================================================
// Hooks mock setup
// ============================================================================

const mockCreateReadingMutateAsync = vi.fn();

vi.mock('@/hooks/api/useReadings', () => ({
  useMyAvailableSpreads: () => ({ data: [mockSpread], isLoading: false }),
  usePredefinedQuestions: () => ({ data: mockPredefinedQuestions, isLoading: false }),
  useCreateReading: () => ({
    mutate: vi.fn(),
    mutateAsync: mockCreateReadingMutateAsync,
    isPending: false,
  }),
  useRegenerateInterpretation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

// ============================================================================
// Helpers
// ============================================================================

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
};

const selectAndRevealCards = async () => {
  const cards = screen.getAllByTestId('selectable-card');
  fireEvent.click(cards[0]);
  fireEvent.click(cards[1]);
  fireEvent.click(cards[2]);

  const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
  fireEvent.click(revealButton);

  await waitFor(() => {
    expect(screen.getByTestId('result-cards-grid')).toBeInTheDocument();
  });
};

// ============================================================================
// Tests
// ============================================================================

describe('InterpretationSection — FREE con freeInterpretations', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default: FREE user plan features
    mockUseUserPlanFeatures.mockReturnValue({
      plan: 'free',
      planLabel: 'GRATUITO',
      canUseAI: false,
      canUseCategories: false,
      canUseCustomQuestions: false,
      canShare: true,
      isPremium: false,
      isFree: true,
      isAnonymous: false,
    });

    // Default: FREE user capabilities
    mockUseUserCapabilities.mockReturnValue({
      data: {
        dailyCard: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        tarotReadings: { used: 0, limit: 1, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
        canCreateDailyReading: true,
        canCreateTarotReading: true,
        canUseAI: false,
        canUseCustomQuestions: false,
        canUseAdvancedSpreads: false,
        canUseFullDeck: false,
        plan: 'free',
        isAuthenticated: true,
      },
      isLoading: false,
    });
  });

  describe('Con freeInterpretations presente', () => {
    beforeEach(() => {
      mockCreateReadingMutateAsync.mockResolvedValue(mockFreeReadingWithInterpretations);
    });

    it('debería mostrar los textos pre-escritos de freeInterpretations por carta', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={3} />
      );

      await selectAndRevealCards();

      expect(
        screen.getByText('El Loco en amor: texto amigable pre-escrito upright.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('El Mago en amor: texto amigable pre-escrito upright.')
      ).toBeInTheDocument();
      expect(
        screen.getByText('La Sacerdotisa en amor: texto amigable pre-escrito reversed.')
      ).toBeInTheDocument();
    });

    it('debería mostrar el nombre de la categoría en el encabezado', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={3} />
      );

      await selectAndRevealCards();

      expect(screen.getByText(/Tu Lectura de Amor y Relaciones/i)).toBeInTheDocument();
    });

    it('NO debería mostrar los significados crudos (meaningUpright/Reversed) cuando hay freeInterpretations', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={3} />
      );

      await selectAndRevealCards();

      expect(screen.queryByText('El Loco upright significado crudo')).not.toBeInTheDocument();
    });

    it('debería mostrar el FreeReadingUpgradeBanner para usuarios FREE', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={3} />
      );

      await selectAndRevealCards();

      expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
    });

    it('debería incluir el categoryId en el CreateReadingDto enviado al backend', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={3} />
      );

      await selectAndRevealCards();

      expect(mockCreateReadingMutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 3 })
      );
    });
  });

  describe('Sin freeInterpretations (fallback)', () => {
    beforeEach(() => {
      mockCreateReadingMutateAsync.mockResolvedValue(mockFreeReadingWithoutInterpretations);
    });

    it('debería mostrar los significados crudos como fallback cuando freeInterpretations es null', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={null} />
      );

      await selectAndRevealCards();

      // Falls back to card-by-card meanings from DB
      expect(screen.getByText('El Loco upright significado crudo')).toBeInTheDocument();
    });

    it('debería mostrar el FreeReadingUpgradeBanner también en el fallback', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={null} />
      );

      await selectAndRevealCards();

      expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
    });
  });

  describe('Usuario PREMIUM — sin regresión', () => {
    beforeEach(() => {
      mockUseUserPlanFeatures.mockReturnValue({
        plan: 'premium',
        planLabel: 'PREMIUM',
        canUseAI: true,
        canUseCategories: true,
        canUseCustomQuestions: true,
        canShare: true,
        isPremium: true,
        isFree: false,
        isAnonymous: false,
      });

      mockUseUserCapabilities.mockReturnValue({
        data: {
          dailyCard: { used: 3, limit: 999, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          tarotReadings: { used: 5, limit: 999, canUse: true, resetAt: '2026-01-09T00:00:00Z' },
          canCreateDailyReading: true,
          canCreateTarotReading: true,
          canUseAI: true,
          canUseCustomQuestions: true,
          canUseAdvancedSpreads: true,
          canUseFullDeck: true,
          plan: 'premium',
          isAuthenticated: true,
        },
        isLoading: false,
      });

      mockCreateReadingMutateAsync.mockResolvedValue(mockPremiumReading);
    });

    it('debería mostrar la interpretación personalizada (markdown) para PREMIUM', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={null} />
      );

      await selectAndRevealCards();

      expect(screen.getByTestId('markdown-content')).toBeInTheDocument();
      // The markdown content itself contains "Interpretación personalizada"
      expect(screen.getByTestId('markdown-content').textContent).toMatch(/Interpretación personalizada/i);
    });

    it('NO debería mostrar FreeReadingUpgradeBanner para PREMIUM', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={null} />
      );

      await selectAndRevealCards();

      expect(screen.queryByTestId('free-reading-upgrade-banner')).not.toBeInTheDocument();
    });

    it('NO debería enviar categoryId al backend en modo PREMIUM cuando no hay categoryId', async () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion={null} categoryId={null} />
      );

      await selectAndRevealCards();

      const callArg = mockCreateReadingMutateAsync.mock.calls[0][0];
      expect(callArg.categoryId).toBeUndefined();
    });
  });
});
