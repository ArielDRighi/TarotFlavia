/**
 * Tests for Reading Detail Page
 *
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import userEvent from '@testing-library/user-event';

import ReadingDetailPage from './page';
import * as useReadingsModule from '@/hooks/api/useReadings';
import * as useShareTextModule from '@/hooks/api/useShareText';
import type { ReadingDetail, Spread } from '@/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
  useParams: () => ({ id: '1' }),
  notFound: vi.fn(),
}));

// Mock useRequireAuth
vi.mock('@/hooks/useRequireAuth', () => ({
  useRequireAuth: () => ({ isLoading: false, user: { id: 1 } }),
}));

// Mock useReadings hooks
vi.mock('@/hooks/api/useReadings', () => ({
  useReadingDetail: vi.fn(),
  useSpreads: vi.fn(),
  useRegenerateInterpretation: vi.fn(),
  useShareReading: vi.fn(),
}));

// Mock useShareText hook
vi.mock('@/hooks/api/useShareText', () => ({
  useReadingShareText: vi.fn(),
}));

// Mock toast
vi.mock('@/hooks/utils/useToast', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn().mockResolvedValue(undefined),
  },
});

// Helper to create QueryClient for tests
function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

// Wrapper component for React Query
function createWrapper() {
  const queryClient = createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

// Mock data
const mockReadingDetail: ReadingDetail = {
  id: 1,
  userId: 1,
  spreadId: 1,
  question: '¿Qué me depara el futuro en el amor?',
  cards: [
    {
      id: 1,
      name: 'El Mago',
      arcana: 'major',
      number: 1,
      suit: null,
      orientation: 'upright',
      position: 1,
      positionName: 'Presente',
      imageUrl: '/cards/magician.jpg',
      isReversed: false,
      meaningUpright: undefined,
      meaningReversed: undefined,
      keywords: undefined,
      description: undefined,
    },
    {
      id: 2,
      name: 'La Emperatriz',
      arcana: 'major',
      number: 3,
      suit: null,
      orientation: 'reversed',
      position: 2,
      positionName: 'Obstáculo',
      imageUrl: '/cards/empress.jpg',
      isReversed: false,
      meaningUpright: undefined,
      meaningReversed: undefined,
      keywords: undefined,
      description: undefined,
    },
    {
      id: 3,
      name: 'El Sol',
      arcana: 'major',
      number: 19,
      suit: null,
      orientation: 'upright',
      position: 3,
      positionName: 'Futuro',
      imageUrl: '/cards/sun.jpg',
      isReversed: false,
      meaningUpright: undefined,
      meaningReversed: undefined,
      keywords: undefined,
      description: undefined,
    },
  ],
  interpretation: {
    id: 1,
    generalInterpretation:
      '## Interpretación General\n\nTu lectura revela un camino de **transformación**.\n\n### El Mago en tu presente\nTienes todas las herramientas necesarias.\n\n- Confía en tu intuición\n- Toma acción decisiva\n- Mantén la fe',
    cardInterpretations: [
      { cardId: 1, interpretation: 'El Mago representa tu poder personal.' },
      { cardId: 2, interpretation: 'La Emperatriz invertida indica bloqueos creativos.' },
      { cardId: 3, interpretation: 'El Sol trae éxito y felicidad.' },
    ],
    aiProvider: 'groq',
    model: 'llama-3.1-70b',
  },
  createdAt: '2025-12-01T10:30:00Z',
  shareToken: null,
};

const mockSpread: Spread = {
  id: 1,
  name: 'Tres Cartas',
  description: 'Pasado, presente y futuro',
  cardCount: 3,
  positions: [
    { position: 1, name: 'Presente', description: 'Tu situación actual' },
    { position: 2, name: 'Obstáculo', description: 'Lo que te frena' },
    { position: 3, name: 'Futuro', description: 'Lo que viene' },
  ],
  difficulty: 'beginner',
  requiredPlan: 'free',
};

describe('ReadingDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mocks
    vi.mocked(useReadingsModule.useSpreads).mockReturnValue({
      data: [mockSpread],
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useReadingsModule.useSpreads>);

    vi.mocked(useReadingsModule.useRegenerateInterpretation).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as unknown as ReturnType<typeof useReadingsModule.useRegenerateInterpretation>);

    vi.mocked(useReadingsModule.useShareReading).mockReturnValue({
      mutate: vi.fn(),
      mutateAsync: vi.fn().mockResolvedValue({ shareToken: 'test-token' }),
      isPending: false,
    } as unknown as ReturnType<typeof useReadingsModule.useShareReading>);

    vi.mocked(useShareTextModule.useReadingShareText).mockReturnValue({
      data: { shareText: 'Mock share text' },
      isLoading: false,
      isError: false,
      error: null,
    } as ReturnType<typeof useShareTextModule.useReadingShareText>);
  });

  describe('Loading State', () => {
    it('should show skeleton while loading', () => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);

      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('reading-detail-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show error message when reading not found', () => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Reading not found'),
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);

      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('reading-not-found')).toBeInTheDocument();
      expect(screen.getByText(/lectura no encontrada/i)).toBeInTheDocument();
    });

    it('should show back to history button on error', () => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Reading not found'),
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);

      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      const backButton = screen.getByRole('button', { name: /volver al historial/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe('Success State - Header', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should display breadcrumb navigation', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Historial')).toBeInTheDocument();
      expect(screen.getByText('Lectura')).toBeInTheDocument();
    });

    it('should display the question with serif font', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      const question = screen.getByText(mockReadingDetail.question);
      expect(question).toBeInTheDocument();
      expect(question).toHaveClass('font-serif');
    });

    it('should display formatted date and time', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      // Should show the date in Spanish locale format
      expect(screen.getByTestId('reading-date')).toBeInTheDocument();
    });

    it('should display spread type badge', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByTestId('spread-badge')).toBeInTheDocument();
      expect(screen.getByText('Tres Cartas')).toBeInTheDocument();
    });
  });

  describe('Success State - Cards Section', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should display all cards in the reading', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      // Card names appear twice (in TarotCard and CardDisplay), use getAllByText
      expect(screen.getAllByText('El Mago').length).toBeGreaterThan(0);
      expect(screen.getAllByText('La Emperatriz').length).toBeGreaterThan(0);
      expect(screen.getAllByText('El Sol').length).toBeGreaterThan(0);
    });

    it('should display card position names', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Presente')).toBeInTheDocument();
      expect(screen.getByText('Obstáculo')).toBeInTheDocument();
      expect(screen.getByText('Futuro')).toBeInTheDocument();
    });

    it('should show reversed indicator for reversed cards', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      // La Emperatriz is reversed
      expect(screen.getByTestId('card-reversed-indicator-2')).toBeInTheDocument();
    });
  });

  describe('Success State - Interpretation Section', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should display interpretation section title', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByText('Interpretación')).toBeInTheDocument();
    });

    it('should render markdown interpretation content', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      // Check for markdown rendered content
      expect(screen.getByTestId('interpretation-content')).toBeInTheDocument();
    });
  });

  describe('Actions - Share', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should display share dropdown button', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /compartir$/i })).toBeInTheDocument();
    });

    it('should show share options when dropdown is opened', async () => {
      const user = userEvent.setup();
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      const shareButton = screen.getByRole('button', { name: /compartir$/i });
      await user.click(shareButton);

      // Wait for dropdown menu to appear
      await waitFor(() => {
        expect(screen.getByRole('menuitem', { name: /compartir link/i })).toBeInTheDocument();
        expect(screen.getByRole('menuitem', { name: /compartir texto/i })).toBeInTheDocument();
      });
    });
  });

  describe('Actions - Back to History', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should display back to history button', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      expect(screen.getByRole('button', { name: /volver al historial/i })).toBeInTheDocument();
    });

    it('should navigate to history when back button is clicked', () => {
      render(<ReadingDetailPage />, { wrapper: createWrapper() });

      const backButton = screen.getByRole('button', { name: /volver al historial/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/historial');
    });
  });
});
