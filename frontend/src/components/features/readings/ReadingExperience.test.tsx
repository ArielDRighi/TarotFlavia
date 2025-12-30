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

// Mock UpgradeBanner
vi.mock('./UpgradeBanner', () => ({
  default: function MockUpgradeBanner({ onUpgradeClick }: { onUpgradeClick: () => void }) {
    return (
      <div data-testid="upgrade-banner">
        <p>💎 Desbloquea interpretaciones personalizadas con IA</p>
        <button onClick={onUpgradeClick}>Upgrade a Premium</button>
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
    id: 1,
    name: 'Una Carta',
    description: 'Consulta simple',
    cardCount: 1,
    positions: [{ position: 1, name: 'Presente', description: 'Tu situación actual' }],
    difficulty: 'beginner',
  },
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
  },
  {
    id: 3,
    name: 'Cruz Simple',
    description: 'Análisis de situación',
    cardCount: 5,
    positions: [
      { position: 1, name: 'Presente', description: 'Tu situación actual' },
      { position: 2, name: 'Desafío', description: 'El obstáculo' },
      { position: 3, name: 'Pasado', description: 'Lo que dejaste atrás' },
      { position: 4, name: 'Futuro', description: 'Lo que vendrá' },
      { position: 5, name: 'Resultado', description: 'El resultado final' },
    ],
    difficulty: 'intermediate',
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
  {
    id: 34,
    questionText: '¿Cómo puedo mejorar mi relación?',
    categoryId: 1,
    order: 2,
    isActive: true,
    usageCount: 80,
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
const mockRegenerateInterpretation = vi.fn();
const mockShareReading = vi.fn();

vi.mock('@/hooks/api/useReadings', () => ({
  useSpreads: () => ({
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
    mutate: mockRegenerateInterpretation,
    isPending: false,
  }),
  useShareReading: () => ({
    mutate: mockShareReading,
    isPending: false,
  }),
}));

// Mock auth store
vi.mock('@/stores/authStore', () => ({
  useAuthStore: () => ({
    user: {
      id: 1,
      email: 'test@example.com',
      plan: 'PREMIUM',
    },
    isAuthenticated: true,
  }),
}));

// Mock useUserPlanFeatures
vi.mock('@/hooks/utils/useUserPlanFeatures', () => ({
  useUserPlanFeatures: () => ({
    canUseAI: true,
    canUseCategories: true,
    canUseCustomQuestions: true,
    isPremium: true,
    isFree: false,
    isAnonymous: false,
    dailyReadingsLimit: null,
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

describe('ReadingExperience', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateReadingMutateAsync.mockReset();
  });

  describe('Card Selection State', () => {
    it('should render card selection state initially', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      expect(screen.getByText(/Selecciona tus cartas/i)).toBeInTheDocument();
    });

    it('should display full deck of 78 cards for selection', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      expect(cards).toHaveLength(78); // Full tarot deck
    });

    it('should show correct selection count for 3-card spread', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      expect(screen.getByText(/0 de 3 cartas seleccionadas/i)).toBeInTheDocument();
      expect(screen.getByText(/Elige 3 cartas del mazo/i)).toBeInTheDocument();
    });

    it('should show correct selection count for 1-card spread', () => {
      renderWithProviders(<ReadingExperience spreadId={1} questionId={1} customQuestion={null} />);

      expect(screen.getByText(/0 de 1 cartas seleccionadas/i)).toBeInTheDocument();
      expect(screen.getByText(/Elige 1 carta del mazo/i)).toBeInTheDocument();
    });

    it('should mark card as selected when clicked', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);

      expect(cards[0]).toHaveClass('ring-2');
    });

    it('should not allow selecting more cards than required', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');

      // Select 3 cards (the max for this spread)
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // Try to select a 4th card - should not work
      fireEvent.click(cards[3]);
      expect(cards[3]).not.toHaveClass('ring-2');

      // Only first 3 should be selected
      expect(cards[0]).toHaveClass('ring-2');
      expect(cards[1]).toHaveClass('ring-2');
      expect(cards[2]).toHaveClass('ring-2');
    });

    it('should toggle card selection when clicking same card', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');

      // Select card
      fireEvent.click(cards[0]);
      expect(cards[0]).toHaveClass('ring-2');

      // Deselect card
      fireEvent.click(cards[0]);
      expect(cards[0]).not.toHaveClass('ring-2');
    });

    it('should disable reveal button until all cards are selected', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      expect(revealButton).toBeDisabled();
    });

    it('should enable reveal button when all cards are selected', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');

      // Select all 3 cards
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      expect(revealButton).not.toBeDisabled();
    });

    it('should show selection progress indicator', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      expect(screen.getByText(/0 de 3 cartas seleccionadas/i)).toBeInTheDocument();

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);

      expect(screen.getByText(/1 de 3 cartas seleccionadas/i)).toBeInTheDocument();
    });
  });

  describe('Loading State (AI Processing)', () => {
    it('should show loading state after clicking reveal', async () => {
      mockCreateReadingMutateAsync.mockImplementation(
        () => new Promise(() => {}) // Never resolves to stay in loading
      );

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');

      // Select all cards
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // Click reveal button
      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByTestId('loading-state')).toBeInTheDocument();
      });
    });

    it('should show cosmic messages during loading', async () => {
      mockCreateReadingMutateAsync.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            /Consultando con el universo|Alineando energías|Descifrando el mensaje cósmico/i
          )
        ).toBeInTheDocument();
      });
    });

    it('should hide card grid during loading', async () => {
      mockCreateReadingMutateAsync.mockImplementation(() => new Promise(() => {}));

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.queryByTestId('card-selection-grid')).not.toBeInTheDocument();
      });
    });
  });

  describe('Result State', () => {
    beforeEach(() => {
      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);
    });

    it('should show result state after API call succeeds', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Tu lectura del Tarot/i })).toBeInTheDocument();
      });
    });

    it('should display cards from API response', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByTestId('result-cards-grid')).toBeInTheDocument();
      });
    });

    it('should render interpretation as markdown', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByTestId('interpretation-content')).toBeInTheDocument();
      });
    });

    it('should show action buttons in result state', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Compartir/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Nueva Lectura/i })).toBeInTheDocument();
      });
    });

    it('should show regenerate button for premium users', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Regenerar Interpretación/i })
        ).toBeInTheDocument();
      });
    });
  });

  describe('Actions', () => {
    beforeEach(() => {
      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);
    });

    it('should call regenerate mutation when regenerate button is clicked', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Regenerar Interpretación/i })
        ).toBeInTheDocument();
      });

      const regenerateButton = screen.getByRole('button', { name: /Regenerar Interpretación/i });
      fireEvent.click(regenerateButton);

      expect(mockRegenerateInterpretation).toHaveBeenCalledWith(123);
    });

    it('should call share mutation when share button is clicked', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Compartir/i })).toBeInTheDocument();
      });

      const shareButton = screen.getByRole('button', { name: /Compartir/i });
      fireEvent.click(shareButton);

      expect(mockShareReading).toHaveBeenCalledWith(123);
    });

    it('should navigate to new reading when "Nueva Lectura" is clicked', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Nueva Lectura/i })).toBeInTheDocument();
      });

      const newReadingButton = screen.getByRole('button', { name: /Nueva Lectura/i });
      fireEvent.click(newReadingButton);

      expect(mockPush).toHaveBeenCalledWith('/ritual');
    });
  });

  describe('Error Handling', () => {
    it('should show error message when API call fails', async () => {
      mockCreateReadingMutateAsync.mockRejectedValue(new Error('Error de conexión'));

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByText(/Error al crear la lectura/i)).toBeInTheDocument();
      });
    });

    it('should show retry button on error', async () => {
      mockCreateReadingMutateAsync.mockRejectedValue(new Error('Error de conexión'));

      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Reintentar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Question Display', () => {
    it('should display the custom question when provided', () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion="¿Encontraré el amor?" />
      );

      expect(screen.getByText(/¿Encontraré el amor?/)).toBeInTheDocument();
    });

    it('should display the predefined question when questionId is provided', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={33} customQuestion={null} />);

      expect(screen.getByText(/¿Qué debo saber sobre mi situación actual?/)).toBeInTheDocument();
    });

    it('should display the spread name', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={33} customQuestion={null} />);

      expect(screen.getByText('Tres Cartas')).toBeInTheDocument();
    });
  });

  describe('Card Layouts', () => {
    it('should display full deck with responsive grid layout', () => {
      renderWithProviders(<ReadingExperience spreadId={1} questionId={1} customQuestion={null} />);

      const grid = screen.getByTestId('card-selection-grid');
      expect(grid).toHaveClass('grid');
    });

    it('should show 78 cards regardless of spread type', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      expect(cards).toHaveLength(78);
    });
  });

  describe('Missing Data Handling', () => {
    it('should show error when spread is not found', () => {
      renderWithProviders(
        <ReadingExperience spreadId={999} questionId={1} customQuestion={null} />
      );

      expect(screen.getByText(/Tirada no encontrada/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels on cards', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('role', 'button');
        expect(card).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should handle keyboard interaction for card selection', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.keyDown(cards[0], { key: 'Enter' });

      expect(cards[0]).toHaveClass('ring-2');
    });
  });

  describe('Upgrade Banner', () => {
    beforeEach(() => {
      mockCreateReadingMutateAsync.mockResolvedValue(mockReadingDetail);
    });

    it('should NOT show upgrade banner for PREMIUM users in result state', async () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      const revealButton = screen.getByRole('button', { name: /Revelar mi destino/i });
      fireEvent.click(revealButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Tu lectura del Tarot/i })).toBeInTheDocument();
      });

      // El banner NO debe aparecer para usuarios premium
      expect(screen.queryByTestId('upgrade-banner')).not.toBeInTheDocument();
    });
  });
});
