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

// Test data
const mockSpreads: Spread[] = [
  {
    id: 1,
    name: 'Una Carta',
    slug: 'una-carta',
    description: 'Consulta simple',
    cardsCount: 1,
    positions: [{ position: 1, name: 'Presente', description: 'Tu situación actual' }],
    difficulty: 'beginner',
  },
  {
    id: 2,
    name: 'Tres Cartas',
    slug: 'tres-cartas',
    description: 'Pasado, presente, futuro',
    cardsCount: 3,
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
    slug: 'cruz-simple',
    description: 'Análisis de situación',
    cardsCount: 5,
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

    it('should display correct number of cards based on spread', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      expect(cards).toHaveLength(3); // Tres Cartas spread
    });

    it('should display 1 card for single card spread', () => {
      renderWithProviders(<ReadingExperience spreadId={1} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      expect(cards).toHaveLength(1);
    });

    it('should display 5 cards for cruz simple spread', () => {
      renderWithProviders(<ReadingExperience spreadId={3} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      expect(cards).toHaveLength(5);
    });

    it('should mark card as selected when clicked', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');
      fireEvent.click(cards[0]);

      expect(cards[0]).toHaveClass('ring-2');
    });

    it('should allow selecting up to the required number of cards', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const cards = screen.getAllByTestId('selectable-card');

      // Select all 3 cards
      fireEvent.click(cards[0]);
      fireEvent.click(cards[1]);
      fireEvent.click(cards[2]);

      // All cards should be selectable
      cards.forEach((card) => {
        expect(card).toHaveClass('ring-2');
      });
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
    it('should display the user question', () => {
      renderWithProviders(
        <ReadingExperience spreadId={2} questionId={null} customQuestion="¿Encontraré el amor?" />
      );

      expect(screen.getByText(/¿Encontraré el amor?/)).toBeInTheDocument();
    });
  });

  describe('Card Layouts', () => {
    it('should use centered layout for single card spread', () => {
      renderWithProviders(<ReadingExperience spreadId={1} questionId={1} customQuestion={null} />);

      const grid = screen.getByTestId('card-selection-grid');
      expect(grid).toHaveClass('justify-center');
    });

    it('should use grid layout for 3 cards spread', () => {
      renderWithProviders(<ReadingExperience spreadId={2} questionId={1} customQuestion={null} />);

      const grid = screen.getByTestId('card-selection-grid');
      expect(grid).toHaveClass('grid-cols-3');
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
});
