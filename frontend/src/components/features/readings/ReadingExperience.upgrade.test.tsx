import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReadingExperience } from './ReadingExperience';
import type {
  Spread,
  ReadingDetail,
  ReadingCard,
  Interpretation,
  PredefinedQuestion,
} from '@/types/reading.types';

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
        <p>Con Premium obtenés una interpretación personalizada y profunda</p>
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

// Test data
const mockSpreads: Spread[] = [
  {
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
  },
];

const mockPredefinedQuestions: PredefinedQuestion[] = [
  {
    id: 33,
    questionText: '¿Qué debo saber sobre mi situación actual?',
    categoryId: 1,
    order: 1,
    isActive: true,
    usageCount: 100,
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

// Mocks for hooks
const mockCreateReadingMutateAsync = vi.fn();

vi.mock('@/hooks/api/useReadings', () => ({
  useSpreads: () => ({
    data: mockSpreads,
    isLoading: false,
  }),
  useMyAvailableSpreads: () => ({
    data: mockSpreads,
    isLoading: false,
  }),
  usePredefinedQuestions: () => ({
    data: mockPredefinedQuestions,
    isLoading: false,
  }),
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
  useCategories: () => ({
    data: [{ id: 1, name: 'Amor', slug: 'amor' }],
    isLoading: false,
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

// Mock useUserCapabilities
vi.mock('@/hooks/api/useUserCapabilities', () => ({
  useUserCapabilities: () => ({
    data: {
      dailyCard: {
        used: 0,
        limit: 1,
        canUse: true,
        resetAt: '2025-12-08T00:00:00Z',
      },
      tarotReadings: {
        used: 0,
        limit: 3,
        canUse: true,
        resetAt: '2025-12-08T00:00:00Z',
      },
      canCreateDailyReading: true,
      canCreateTarotReading: true,
      canUseAI: false, // FREE users cannot use AI
      canUseCustomQuestions: false,
      canUseAdvancedSpreads: false,
      plan: 'free',
      isAuthenticated: true,
    },
    isLoading: false,
    isError: false,
    error: null,
  }),
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

describe('ReadingExperience - Upgrade Banner for FREE users', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);
  });

  // Mock auth store para FREE
  vi.mock('@/stores/authStore', () => ({
    useAuthStore: () => ({
      user: {
        id: 1,
        email: 'test@example.com',
        plan: 'free',
      },
      isAuthenticated: true,
    }),
  }));

  // Mock useUserPlanFeatures para FREE (no puede usar AI)
  vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
    useUserPlanFeatures: () => ({
      canUseAI: false,
      canUseCategories: true,
      canUseCustomQuestions: false,
      isPremium: false,
      isFree: true,
      isAnonymous: false,
      dailyReadingsLimit: 3,
    }),
  }));

  it('should show upgrade banner for FREE users in result state', async () => {
    renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

    const cards = screen.getAllByTestId('selectable-card');
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
    fireEvent.click(revealButton);

    await waitFor(
      () => {
        expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    expect(
      screen.getByText(/Con Premium obtenés una interpretación personalizada/i)
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /conocer premium/i })).toBeInTheDocument();
  }, 15000); // Timeout de 15 segundos para el test

  it('should NOT open upgrade modal when clicking banner button (UpgradeBanner handles MP flow internally)', async () => {
    renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

    const cards = screen.getAllByTestId('selectable-card');
    fireEvent.click(cards[0]);
    fireEvent.click(cards[1]);
    fireEvent.click(cards[2]);

    const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
    fireEvent.click(revealButton);

    await waitFor(() => {
      expect(screen.getByTestId('free-reading-upgrade-banner')).toBeInTheDocument();
    });

    // Banner button click should NOT open ReadingExperience's UpgradeModal
    // FreeReadingUpgradeBanner handles its own navigation internally
    const upgradeButton = screen.getByRole('button', { name: /conocer premium/i });
    fireEvent.click(upgradeButton);

    // UpgradeModal should NOT appear from banner click
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
