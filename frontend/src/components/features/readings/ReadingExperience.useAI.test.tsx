/**
 * Tests for ReadingExperience - useAI flag based on user plan
 * TASK-006: Ensure that useAI flag is sent correctly based on user plan
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingExperience } from './ReadingExperience';
import type { Spread, ReadingDetail, ReadingCard, Interpretation } from '@/types/reading.types';

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

// Mock FreeReadingUpgradeBanner
vi.mock('./FreeReadingUpgradeBanner', () => ({
  default: function MockFreeReadingUpgradeBanner() {
    return (
      <div data-testid="free-reading-upgrade-banner">
        <p>Con Premium obtenés una interpretación personalizada</p>
        <button>Conocer Premium</button>
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

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Test data
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
    meaningUpright: undefined,
    meaningReversed: undefined,
    keywords: undefined,
    description: undefined,
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
    meaningUpright: undefined,
    meaningReversed: undefined,
    keywords: undefined,
    description: undefined,
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
    isReversed: false,
    meaningUpright: undefined,
    meaningReversed: undefined,
    keywords: undefined,
    description: undefined,
  },
];

const mockInterpretation: Interpretation = {
  id: 1,
  generalInterpretation: '**Tu lectura revela** un momento de nuevos comienzos...',
  cardInterpretations: [
    { cardId: 1, interpretation: 'El Loco indica un nuevo viaje...' },
    { cardId: 2, interpretation: 'El Mago muestra tu poder creativo...' },
    { cardId: 3, interpretation: 'La Sacerdotisa invertida sugiere confusión...' },
  ],
  aiProvider: 'groq',
  model: 'llama-3.1-70b-versatile',
};

const mockReadingDetail: ReadingDetail = {
  id: 123,
  userId: 1,
  spreadId: 2,
  question: '¿Qué debo esperar en el amor?',
  cards: mockReadingCards,
  interpretation: mockInterpretation,
  createdAt: '2025-12-07T10:00:00Z',
  shareToken: null,
};

// Mock implementations for hooks
const mockCreateReadingMutateAsync = vi.fn();
const mockUseSpreads = vi.fn();
const mockUsePredefinedQuestions = vi.fn();
const mockUseUserPlanFeatures = vi.fn();

// Default mock implementations
vi.mock('@/hooks/api/useReadings', () => ({
  useSpreads: () => mockUseSpreads(),
  useMyAvailableSpreads: () => mockUseSpreads(),
  usePredefinedQuestions: () => mockUsePredefinedQuestions(),
  useCreateReading: () => ({
    mutate: vi.fn(),
    mutateAsync: mockCreateReadingMutateAsync,
    isPending: false,
  }),
  useRegenerateInterpretation: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
  useShareReading: () => ({
    mutate: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      plan: 'premium',
    },
    isAuthenticated: true,
  }),
}));

vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
  useUserPlanFeatures: () => mockUseUserPlanFeatures(),
}));

// Query client for tests
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

describe('ReadingExperience - useAI flag (TASK-006)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateReadingMutateAsync.mockReset();

    // Default mocks
    mockUseSpreads.mockReturnValue({
      data: [mockSpread],
      isLoading: false,
    });

    mockUsePredefinedQuestions.mockReturnValue({
      data: [],
      isLoading: false,
    });
  });

  describe('PREMIUM user - useAI: true', () => {
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
        dailyReadingsLimit: 3,
      });

      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);
    });

    it('should send useAI: true when PREMIUM user creates reading', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      // Select 3 cards
      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // Click reveal button
      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(mockCreateReadingMutateAsync).toHaveBeenCalledTimes(1);
      });

      // Verify useAI: true was sent
      const callArgs = mockCreateReadingMutateAsync.mock.calls[0][0];
      expect(callArgs).toHaveProperty('useAI', true);
    });

    it('should display "Recibirás interpretación personalizada" for PREMIUM user', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      expect(screen.getByText(/Recibirás interpretación personalizada/i)).toBeInTheDocument();
    });
  });

  describe('FREE user - useAI: false', () => {
    beforeEach(() => {
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
        dailyReadingsLimit: 2,
      });

      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);
    });

    it('should send useAI: false when FREE user creates reading', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      // Select 3 cards
      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // Click reveal button
      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(mockCreateReadingMutateAsync).toHaveBeenCalledTimes(1);
      });

      // Verify useAI: false was sent
      const callArgs = mockCreateReadingMutateAsync.mock.calls[0][0];
      expect(callArgs).toHaveProperty('useAI', false);
    });

    it('should display "Verás las cartas y sus significados" for FREE user', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      expect(screen.getByText(/Verás las cartas y sus significados/i)).toBeInTheDocument();
    });
  });

  describe('UI Messages by Plan', () => {
    it('should show upgrade banner after reveal for FREE user', async () => {
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
        dailyReadingsLimit: 2,
      });

      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      // Select 3 cards
      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // Click reveal button
      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
      });
    });

    it('should NOT show upgrade banner for PREMIUM user', async () => {
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
        dailyReadingsLimit: 3,
      });

      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      // Select 3 cards
      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // Click reveal button
      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Tu lectura del Tarot/i })).toBeInTheDocument();
      });

      expect(screen.queryByTestId('free-reading-upgrade-banner')).not.toBeInTheDocument();
    });
  });
});
