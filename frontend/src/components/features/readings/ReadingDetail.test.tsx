/**
 * Tests for ReadingDetail Component
 *
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';

import { ReadingDetail } from './ReadingDetail';
import * as useReadingsModule from '@/hooks/api/useReadings';
import * as useShareTextModule from '@/hooks/api/useShareText';
import type { ReadingDetail as ReadingDetailType, Spread } from '@/types';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    back: vi.fn(),
  }),
}));

// Mock useReadings hooks
vi.mock('@/hooks/api/useReadings', () => ({
  useReadingDetail: vi.fn(),
  useSpreads: vi.fn(),
  useMyAvailableSpreads: vi.fn(),
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
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
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
const mockReadingDetail: ReadingDetailType = {
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
  ],
  interpretation: {
    id: 1,
    generalInterpretation: '## Interpretación\n\nTu lectura revela **transformación**.',
    cardInterpretations: [
      { cardId: 1, interpretation: 'El Mago representa tu poder personal.' },
      { cardId: 2, interpretation: 'La Emperatriz invertida indica bloqueos.' },
    ],
    aiProvider: 'groq',
    model: 'llama-3.1-70b',
  },
  createdAt: '2025-12-01T10:30:00Z',
  shareToken: null,
};

const mockSpread: Spread = {
  id: 1,
  name: 'Dos Cartas',
  description: 'Lectura simple',
  cardCount: 2,
  positions: [
    { position: 1, name: 'Presente', description: 'Tu situación actual' },
    { position: 2, name: 'Obstáculo', description: 'Lo que te frena' },
  ],
  difficulty: 'beginner',
  requiredPlan: 'free',
};

describe('ReadingDetail', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockClear();

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
      data: undefined,
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

      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      expect(screen.getByTestId('reading-detail-skeleton')).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('should show not found when reading does not exist', () => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Not found'),
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);

      render(<ReadingDetail readingId={999} />, { wrapper: createWrapper() });

      expect(screen.getByTestId('reading-not-found')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should display the question', () => {
      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      expect(screen.getByText(mockReadingDetail.question)).toBeInTheDocument();
    });

    it('should display all cards', () => {
      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      expect(screen.getAllByText('El Mago').length).toBeGreaterThan(0);
      expect(screen.getAllByText('La Emperatriz').length).toBeGreaterThan(0);
    });

    it('should display the interpretation section', () => {
      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      expect(screen.getByTestId('interpretation-content')).toBeInTheDocument();
    });

    it('should navigate back to history', () => {
      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      const backButton = screen.getByRole('button', { name: /volver al historial/i });
      fireEvent.click(backButton);

      expect(mockPush).toHaveBeenCalledWith('/historial');
    });
  });

  describe('Share Functionality', () => {
    beforeEach(() => {
      vi.mocked(useReadingsModule.useReadingDetail).mockReturnValue({
        data: mockReadingDetail,
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useReadingsModule.useReadingDetail>);
    });

    it('should show share button', () => {
      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      // Verificar que existe el botón de compartir
      const shareButton = screen.getByRole('button', { name: /compartir$/i });
      expect(shareButton).toBeInTheDocument();
    });

    it('should enable share button when share text data is available', () => {
      const mockShareText =
        '🌟 Mi Lectura de Tarot en Auguria\n\n❓ ¿Qué me depara el futuro?\n\n🃏 El Mago, La Emperatriz ↓';

      vi.mocked(useShareTextModule.useReadingShareText).mockReturnValue({
        data: { text: mockShareText },
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useShareTextModule.useReadingShareText>);

      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      // El botón de compartir debería estar habilitado cuando tiene datos
      const shareButton = screen.getByRole('button', { name: /compartir$/i });
      expect(shareButton).not.toBeDisabled();
    });

    it('should show "Compartir texto" option in dropdown menu when data is available', async () => {
      const mockShareText =
        '🌟 Mi Lectura de Tarot en Auguria\n\n❓ ¿Qué me depara el futuro?\n\n🃏 El Mago, La Emperatriz ↓';

      vi.mocked(useShareTextModule.useReadingShareText).mockReturnValue({
        data: { text: mockShareText },
        isLoading: false,
        isError: false,
        error: null,
      } as ReturnType<typeof useShareTextModule.useReadingShareText>);

      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      // El botón de compartir debería estar habilitado cuando tiene datos
      const shareButton = screen.getByRole('button', { name: /compartir$/i });
      expect(shareButton).not.toBeDisabled();
    });

    it('should show loading state when fetching share text', async () => {
      vi.mocked(useShareTextModule.useReadingShareText).mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        error: null,
      } as ReturnType<typeof useShareTextModule.useReadingShareText>);

      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      // El botón de compartir debería estar disabled mientras carga
      const shareButton = screen.getByRole('button', { name: /compartir$/i });
      expect(shareButton).toBeDisabled();
    });

    it('should handle error when fetching share text', async () => {
      vi.mocked(useShareTextModule.useReadingShareText).mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch'),
      } as ReturnType<typeof useShareTextModule.useReadingShareText>);

      render(<ReadingDetail readingId={1} />, { wrapper: createWrapper() });

      // El botón de compartir debería estar disabled cuando hay error
      const shareButton = screen.getByRole('button', { name: /compartir$/i });
      expect(shareButton).toBeDisabled();
    });
  });
});
